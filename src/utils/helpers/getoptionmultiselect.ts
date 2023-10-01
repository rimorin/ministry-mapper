import { get, ref, query } from "firebase/database";
import { database } from "../../firebase";
import pollingQueryFunction from "./pollingquery";

const getOptionIsMultiSelect = async (code: string) => {
  return await pollingQueryFunction(() =>
    get(query(ref(database, `congregations/${code}/options/isMultiSelect`)))
  );
};

export default getOptionIsMultiSelect;
