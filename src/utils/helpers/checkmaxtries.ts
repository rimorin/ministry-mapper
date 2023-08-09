import { get, child, ref } from "firebase/database";
import { database } from "../../firebase";
import pollingQueryFunction from "./pollingquery";

const checkCongregationMaxTries = async (code: string) => {
  return await pollingQueryFunction(() =>
    get(child(ref(database), `congregations/${code}/maxTries`))
  );
};

export default checkCongregationMaxTries;
