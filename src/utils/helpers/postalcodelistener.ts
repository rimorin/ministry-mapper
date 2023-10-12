import { increment, ref, update } from "firebase/database";
import { database } from "../../firebase";

const triggerPostalCodeListeners = async (postalcode: string) => {
  await update(ref(database, postalcode), {
    delta: increment(1)
  });
};

export default triggerPostalCodeListeners;
