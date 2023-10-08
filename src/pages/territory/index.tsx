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
const NotFoundPage = SuspenseComponent(
  lazy(() => import("../../components/statics/notfound"))
);
const InvalidPage = SuspenseComponent(
  lazy(() => import("../../components/statics/invalidpage"))
);

function Territory() {
  const { id, postalcode, congregationcode } = useParams();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLinkExpired, setIsLinkExpired] = useState<boolean>(false);
  const [isValidPostalcode, setIsValidPostalcode] = useState<boolean>(true);
  const [tokenEndTime, setTokenEndTime] = useState<number>(0);
  const [publisherName, setPublisherName] = useState<string>("");
  const [congregationMaxTries, setCongregationMaxTries] = useState<number>(
    DEFAULT_CONGREGATION_MAX_TRIES
  );

  useEffect(() => {
    const linkRef = ref(database, `links/${id}`);
    Promise.all([
      pollingQueryFunction(() => {
        return get(linkRef);
      }),
      pollingQueryFunction(() => {
        return get(ref(database, postalcode as string));
      })
    ]).then(([linkSnapshot, postalSnapshot]) => {
      let isLinkExpired = true;
      if (linkSnapshot.exists()) {
        const linkrec = new LinkSession(linkSnapshot.val());
        const tokenEndtime = linkrec.tokenEndtime;
        const currentTimestamp = new Date().getTime();
        isLinkExpired = currentTimestamp > tokenEndtime;
        setTokenEndTime(tokenEndtime);
        setPublisherName(linkrec.publisherName);
        setCongregationMaxTries(linkrec.maxTries);
        onChildRemoved(linkRef, () => {
          setIsLinkExpired(true);
        });
      }
      setIsLinkExpired(isLinkExpired);
      setIsValidPostalcode(postalSnapshot.exists());
      setIsLoading(false);
    });
  }, []);
  if (isLoading) return <Loader />;
  if (!isValidPostalcode) return <NotFoundPage />;
  if (isLinkExpired) {
    document.title = "Ministry Mapper";
    return <InvalidPage />;
  }
  return (
    <Slip
      tokenEndtime={tokenEndTime}
      postalcode={postalcode}
      congregationcode={congregationcode}
      maxTries={congregationMaxTries}
      pubName={publisherName}
    ></Slip>
  );
}

export default Territory;
