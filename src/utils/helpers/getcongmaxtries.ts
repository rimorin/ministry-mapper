import { get, child, ref } from "firebase/database";
import { database } from "../../firebase";
import pollingQueryFunction from "./pollingquery";
import { DEFAULT_CONGREGATION_MAX_TRIES } from "../constants";

const getCongregationMaxTries = async (code: string) => {
  const data = await pollingQueryFunction(() =>
    get(child(ref(database), `congregations/${code}/maxTries`))
  );
  return data.exists() ? data.val() : DEFAULT_CONGREGATION_MAX_TRIES;
};

export default getCongregationMaxTries;
