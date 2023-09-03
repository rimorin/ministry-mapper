import { get, ref, orderByChild, query } from "firebase/database";
import { database } from "../../firebase";
import pollingQueryFunction from "./pollingquery";
import { HHOptionProps } from "../interface";

const getOptions = async (code: string) => {
  const householdTypes = new Array<HHOptionProps>();

  const snapshot = await pollingQueryFunction(() =>
    get(
      query(
        ref(database, `congregations/${code}/options/list`),
        orderByChild("sequence")
      )
    )
  );

  snapshot.forEach((option) => {
    const value = option.val();
    householdTypes.push({
      code: option.key || "",
      description: value.description,
      isCountable: value.isCountable,
      isDefault: value.isDefault,
      sequence: value.sequence
    });
  });
  return householdTypes;
};

export default getOptions;
