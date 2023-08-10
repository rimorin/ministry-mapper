import { get, child, ref } from "firebase/database";
import { database } from "../../firebase";
import pollingQueryFunction from "./pollingquery";

const checkCongregationExpireHours = async (code: string) => {
  return await pollingQueryFunction(() =>
    get(child(ref(database), `congregations/${code}/expiryHours`))
  );
};

export default checkCongregationExpireHours;
