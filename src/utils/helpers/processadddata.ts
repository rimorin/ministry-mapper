import { get, query, ref, orderByChild, DataSnapshot } from "firebase/database";
import { database } from "../../firebase";
import { NOT_HOME_STATUS_CODES } from "../constants";
import { unitDetails } from "../interface";
import pollingQueryFunction from "./pollingquery";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const processAddressData = async (postal: string, data: any) => {
  const dataList = [];
  for (const floor in data) {
    const unitsDetails: unitDetails[] = [];
    const addressSnapshot = await pollingQueryFunction(() =>
      get(
        query(
          ref(database, `/${postal}/units/${floor}`),
          orderByChild("sequence")
        )
      )
    );
    addressSnapshot.forEach((element: DataSnapshot) => {
      const unitValues = element.val();
      const unitNumber = element.key || "";
      unitsDetails.push({
        propertyPostal: unitValues.x_zip,
        number: unitNumber,
        note: unitValues.note,
        type: unitValues.type || "",
        status: unitValues.status,
        nhcount: unitValues.nhcount || NOT_HOME_STATUS_CODES.DEFAULT,
        languages: unitValues.languages || "",
        dnctime: unitValues.dnctime || null,
        sequence: unitValues.sequence
      });
    });
    dataList.unshift({ floor: floor, units: unitsDetails });
  }
  return dataList;
};

export default processAddressData;
