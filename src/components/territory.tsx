import { useState, useEffect } from "react";
import { database } from "../firebase";
import "bootstrap/dist/css/bootstrap.min.css";
import Loader from "./loader";
import { useParams } from "react-router-dom";
import { child, onValue, ref } from "firebase/database";
import InvalidPage from "./invalidpage";
import NotFoundPage from "./notfoundpage";
import Slip from "./slip";

function Territory() {
  const { id, postalcode, congregationcode } = useParams();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTokenLoading, setIsTokenLoading] = useState<boolean>(true);
  const [isLinkExpired, setIsLinkExpired] = useState<boolean>(false);
  const [isValidPostalcode, setIsValidPostalcode] = useState<boolean>(true);
  const [tokenEndTime, setTokenEndTime] = useState<number>(0);

  useEffect(() => {
    const linkReference = child(ref(database), `/links/${id}`);
    const postalData = child(ref(database), `/${postalcode}`);
    onValue(linkReference, (snapshot) => {
      setIsTokenLoading(false);
      if (snapshot.exists()) {
        const tokenEndtime = snapshot.val();
        const currentTimestamp = new Date().getTime();
        setTokenEndTime(tokenEndtime);
        if (currentTimestamp < tokenEndtime) {
          setIsLinkExpired(false);
        }
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
  if (isLoading && isTokenLoading) return <Loader />;
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
    ></Slip>
  );
}

export default Territory;
