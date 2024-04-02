import { get, child, ref } from "firebase/database";
import { database } from "../../firebase";
import pollingQueryFunction from "./pollingquery";

const getCongregationOrigin = async (code: string) => {
  return await pollingQueryFunction(() =>
    get(child(ref(database), `congregations/${code}/origin`))
  );
};

export default getCongregationOrigin;
