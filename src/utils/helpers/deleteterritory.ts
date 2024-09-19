import { remove, ref } from "firebase/database";
import { database } from "../../firebase";
import deleteAddress from "./deleteaddress";
import getTerritoryData from "./getterritorydetails";
import pollingVoidFunction from "./pollingvoid";

const deleteTerritoryData = async (
  congregationCode: string,
  selectedTerritoryCode: string
) => {
  if (!selectedTerritoryCode) return;

  const addressesSnapshot = await getTerritoryData(
    congregationCode,
    selectedTerritoryCode
  );
  for (const postalcode of addressesSnapshot) {
    await deleteAddress(congregationCode, postalcode);
  }
  await pollingVoidFunction(() =>
    remove(
      ref(
        database,
        `congregations/${congregationCode}/territories/${selectedTerritoryCode}`
      )
    )
  );
};

export default deleteTerritoryData;
