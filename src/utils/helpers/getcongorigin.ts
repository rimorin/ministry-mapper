import { get, child, ref } from "firebase/database";
import { database } from "../../firebase";
import pollingQueryFunction from "./pollingquery";
import { DEFAULT_MAP_DIRECTION_CONGREGATION_LOCATION } from "../constants";

const getCongregationOrigin = async (code: string) => {
  const data = await pollingQueryFunction(() =>
    get(child(ref(database), `congregations/${code}/origin`))
  );
  return data.exists()
    ? data.val()
    : DEFAULT_MAP_DIRECTION_CONGREGATION_LOCATION;
};

export default getCongregationOrigin;
