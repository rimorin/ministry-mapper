import { get, ref, query } from "firebase/database";
import { database } from "../../firebase";
import pollingQueryFunction from "./pollingquery";
import { DEFAULT_CONGREGATION_OPTION_IS_MULTIPLE } from "../constants";

const getOptionIsMultiSelect = async (code: string) => {
  const data = await pollingQueryFunction(() =>
    get(query(ref(database, `congregations/${code}/options/isMultiSelect`)))
  );
  return data.exists() ? data.val() : DEFAULT_CONGREGATION_OPTION_IS_MULTIPLE;
};

export default getOptionIsMultiSelect;
