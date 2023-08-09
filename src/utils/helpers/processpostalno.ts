import { get, ref, update } from "firebase/database";
import { database } from "../../firebase";
import {
  HOUSEHOLD_TYPES,
  STATUS_CODES,
  NOT_HOME_STATUS_CODES
} from "../constants";
import { addressDetails, unitMaps } from "../interface";
import pollingVoidFunction from "./pollingvoid";

const processPostalUnitNumber = async (
  postalCode: string,
  unitNumber: string,
  addressData: addressDetails | undefined,
  isDelete = false
) => {
  if (!addressData) return;

  if (!isDelete) {
    const existingUnitNo = await get(
      ref(
        database,
        `/${postalCode}/units/${addressData.floors[0].floor}/${unitNumber}`
      )
    );
    if (existingUnitNo.exists()) {
      alert(`Unit number, ${unitNumber} already exist.`);
      return;
    }
  }

  const unitUpdates: unitMaps = {};
  const lastSequenceNo = addressData.floors[0].units.length + 1;
  for (const index in addressData.floors) {
    const floorDetails = addressData.floors[index];
    floorDetails.units.forEach(() => {
      unitUpdates[`/${postalCode}/units/${floorDetails.floor}/${unitNumber}`] =
        isDelete
          ? {}
          : {
              type: HOUSEHOLD_TYPES.CHINESE,
              note: "",
              status: STATUS_CODES.DEFAULT,
              nhcount: NOT_HOME_STATUS_CODES.DEFAULT,
              x_floor: floorDetails.floor,
              languages: "",
              sequence: lastSequenceNo
            };
    });
  }
  await pollingVoidFunction(() => update(ref(database), unitUpdates));
};

export default processPostalUnitNumber;
