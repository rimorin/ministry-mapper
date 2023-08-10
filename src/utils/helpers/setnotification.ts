import { ref, set } from "firebase/database";
import { database } from "../../firebase";
import pollingVoidFunction from "./pollingvoid";

const setNotification = async (
  type: number,
  congregation: string,
  postal: string,
  fromUser: string
) => {
  await pollingVoidFunction(() =>
    set(ref(database, `notifications/${postal}-${type}`), {
      congregation: congregation,
      type: type,
      postalCode: postal,
      fromUser: fromUser
    })
  );
};

export default setNotification;
