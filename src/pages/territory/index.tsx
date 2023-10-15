import { useState, useEffect, lazy } from "react";
import { database } from "../../firebase";
import { useParams } from "react-router-dom";
import { get, onChildRemoved, ref } from "firebase/database";
import Slip from "./slip";
import { LinkSession } from "../../utils/policies";
import Loader from "../../components/statics/loader";
import SuspenseComponent from "../../components/utils/suspense";
import pollingQueryFunction from "../../utils/helpers/pollingquery";
import { DEFAULT_CONGREGATION_MAX_TRIES } from "../../utils/constants";
const InvalidPage = SuspenseComponent(
  lazy(() => import("../../components/statics/invalidpage"))
);

function Territory() {
  const { id, code } = useParams();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLinkExpired, setIsLinkExpired] = useState<boolean>(true);
  const [tokenEndTime, setTokenEndTime] = useState<number>(0);
  const [publisherName, setPublisherName] = useState<string>("");
  const [congregationMaxTries, setCongregationMaxTries] = useState<number>(
    DEFAULT_CONGREGATION_MAX_TRIES
  );
  const [postalcode, setPostalcode] = useState<string>("");

  useEffect(() => {
    const linkRef = ref(database, `links/${code}/${id}`);
    pollingQueryFunction(() => {
      return get(linkRef);
    })
      .then((linkSnapshot) => {
        if (!linkSnapshot.exists()) {
          return;
        }
        const linkrec = new LinkSession(linkSnapshot.val());
        setPublisherName(linkrec.publisherName);
        setCongregationMaxTries(linkrec.maxTries);
        setPostalcode(linkrec.postalCode);
        const tokenEndtime = linkrec.tokenEndtime;
        const currentTimestamp = new Date().getTime();
        setTokenEndTime(tokenEndtime);
        setIsLinkExpired(currentTimestamp > tokenEndtime);
        onChildRemoved(linkRef, () => window.location.reload());
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);
  if (isLoading) return <Loader />;
  if (isLinkExpired) {
    document.title = "Ministry Mapper";
    return <InvalidPage />;
  }
  return (
    <Slip
      tokenEndtime={tokenEndTime}
      postalcode={postalcode}
      congregationcode={code}
      maxTries={congregationMaxTries}
      pubName={publisherName}
    ></Slip>
  );
}

export default Territory;
