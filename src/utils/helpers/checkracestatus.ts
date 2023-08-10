import { get, child, ref } from "firebase/database";
import { database } from "../../firebase";
import pollingQueryFunction from "./pollingquery";

const checkTraceRaceStatus = async (code: string) => {
  return await pollingQueryFunction(() =>
    get(child(ref(database), `congregations/${code}/trackRace`))
  );
};

export default checkTraceRaceStatus;
