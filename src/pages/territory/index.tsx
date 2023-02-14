import { useState, useEffect } from "react";
import { database } from "../../firebase";
import { useParams } from "react-router-dom";
import { child, onValue, ref } from "firebase/database";
import Slip from "./slip";
import { LinkSession } from "../../utils/policies";
import { Loader, NotFoundPage, InvalidPage } from "../../components/static";

function Territory() {
  const { id, postalcode, congregationcode } = useParams();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTokenLoading, setIsTokenLoading] = useState<boolean>(true);
  const [isLinkExpired, setIsLinkExpired] = useState<boolean>(false);
  const [isValidPostalcode, setIsValidPostalcode] = useState<boolean>(true);
  const [tokenEndTime, setTokenEndTime] = useState<number>(0);
  const [linkSession, setLinkSession] = useState<LinkSession>();

  useEffect(() => {
    const linkReference = child(ref(database), `/links/${id}`);
    const postalData = child(ref(database), `/${postalcode}`);
    onValue(linkReference, (snapshot) => {
      setIsTokenLoading(false);
      if (snapshot.exists()) {
        const linkrec = new LinkSession();
        linkrec.fromSnapshot(snapshot.val());
        setLinkSession(linkrec);
        const tokenEndtime = linkrec.tokenEndtime;
        const currentTimestamp = new Date().getTime();
        setTokenEndTime(tokenEndtime);
        setIsLinkExpired(currentTimestamp > tokenEndtime);
      } else {
        setIsLinkExpired(true);
      }
    });
    onValue(
      postalData,
      (snapshot) => {
        if (!snapshot.exists()) {
          setIsValidPostalcode(false);
        }
        setIsLoading(false);
      },
      { onlyOnce: true }
    );
  }, [id, postalcode]);
  if (isLoading || isTokenLoading) return <Loader />;
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
      maxTries={linkSession?.maxTries}
      homeLanguage={linkSession?.homeLanguage}
    ></Slip>
  );
}

export default Territory;
