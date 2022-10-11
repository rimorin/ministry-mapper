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
  const { id, postalcode } = useParams();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLinkExpired, setIsLinkExpired] = useState<boolean>(false);
  const [isValidPostalcode, setIsValidPostalcode] = useState<boolean>(true);

  useEffect(() => {
    const linkReference = child(ref(database), `/links/${id}`);
    const postalData = child(ref(database), `/${postalcode}`);
    onValue(linkReference, (snapshot) => {
      if (snapshot.exists()) {
        const currentTimestamp = new Date().getTime();
        if (currentTimestamp < snapshot.val()) {
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
  if (isLoading) return <Loader />;
  if (!isValidPostalcode) return <NotFoundPage />;
  if (isLinkExpired) {
    document.title = "Ministry Mapper";
    return <InvalidPage />;
  }
  return <Slip token={id} postalcode={postalcode}></Slip>;
}

export default Territory;
