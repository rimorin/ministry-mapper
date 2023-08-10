import { get, ref, update } from "firebase/database";
import { database } from "../../firebase";

const triggerPostalCodeListeners = async (postalcode: string) => {
  const deltaSnapshot = await get(ref(database, `/${postalcode}/delta`));
  let delta = 0;
  if (deltaSnapshot.exists()) {
    delta = deltaSnapshot.val() + 1;
  }
  update(ref(database, `/${postalcode}`), {
    delta: delta
  });
};

export default triggerPostalCodeListeners;
