import { useState, useEffect, lazy } from "react";
import { database } from "../../firebase";
import { useParams } from "react-router-dom";
import { child, onValue, ref } from "firebase/database";
import Slip from "./slip";
import { LinkSession } from "../../utils/policies";
import Loader from "../../components/statics/loader";
import SetPollerInterval from "../../utils/helpers/pollinginterval";
import SuspenseComponent from "../../components/utils/suspense";
const NotFoundPage = SuspenseComponent(
  lazy(() => import("../../components/statics/notfound"))
);
const InvalidPage = SuspenseComponent(
  lazy(() => import("../../components/statics/invalidpage"))
);
const OfflinePage = SuspenseComponent(
  lazy(() => import("../../components/statics/offline"))
);

function Territory() {
  const { id, postalcode, congregationcode } = useParams();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTokenLoading, setIsTokenLoading] = useState<boolean>(true);
  const [isLinkExpired, setIsLinkExpired] = useState<boolean>(false);
  const [isValidPostalcode, setIsValidPostalcode] = useState<boolean>(true);
  const [tokenEndTime, setTokenEndTime] = useState<number>(0);
  const [linkSession, setLinkSession] = useState<LinkSession>();
  const [publisherName, setPublisherName] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(true);

  useEffect(() => {
    const linkReference = child(ref(database), `/links/${id}`);
    const postalData = child(ref(database), `/${postalcode}`);

    const pollerId = SetPollerInterval();
    onValue(linkReference, (snapshot) => {
      clearInterval(pollerId);
      setIsTokenLoading(false);
      setIsLinkExpired(true);
      if (snapshot.exists()) {
        const linkrec = new LinkSession(snapshot.val());
        setLinkSession(linkrec);
        const tokenEndtime = linkrec.tokenEndtime;
        const currentTimestamp = new Date().getTime();
        setTokenEndTime(tokenEndtime);
        setIsLinkExpired(currentTimestamp > tokenEndtime);
        setPublisherName(linkrec.publisherName);
      }
    });
    onValue(
      postalData,
      (snapshot) => {
        clearInterval(pollerId);
        if (!snapshot.exists()) {
          setIsValidPostalcode(false);
        }
        setIsLoading(false);
      },
      { onlyOnce: true }
    );
    onValue(ref(database, ".info/connected"), (snapshot) => {
      setIsConnected(snapshot.val());
    });
  }, [id, postalcode]);
  if (isLoading || isTokenLoading) return <Loader />;
  if (!isValidPostalcode) return <NotFoundPage />;
  if (isLinkExpired) {
    document.title = "Ministry Mapper";
    return <InvalidPage />;
  }
  if (!isConnected) return <OfflinePage />;
  return (
    <Slip
      tokenEndtime={tokenEndTime}
      postalcode={postalcode}
      congregationcode={congregationcode}
      maxTries={linkSession?.maxTries}
      pubName={publisherName}
    ></Slip>
  );
}

export default Territory;
