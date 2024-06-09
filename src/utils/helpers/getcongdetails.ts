import { get, child, ref } from "firebase/database";
import { database } from "../../firebase";
import pollingQueryFunction from "./pollingquery";

const getCongregationDetails = async (congregationCode: string) => {
  return await pollingQueryFunction(() =>
    get(child(ref(database), `congregations/${congregationCode}`))
  );
};

export default getCongregationDetails;
