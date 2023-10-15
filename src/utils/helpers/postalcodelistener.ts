import { increment, ref, update } from "firebase/database";
import { database } from "../../firebase";

const triggerPostalCodeListeners = async (
  congregation: string,
  postalcode: string
) => {
  await update(ref(database, `addresses/${congregation}/${postalcode}`), {
    delta: increment(1)
  });
};

export default triggerPostalCodeListeners;
