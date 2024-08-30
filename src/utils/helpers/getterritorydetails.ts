import { get, query, ref, orderByValue } from "firebase/database";
import { database } from "../../firebase";
import pollingQueryFunction from "./pollingquery";

const getTerritoryData = async (
  code: string,
  selectedTerritoryCode: string
) => {
  try {
    const territoryRef = query(
      ref(
        database,
        `congregations/${code}/territories/${selectedTerritoryCode}/addresses`
      ),
      orderByValue()
    );

    const territoryAddsResult = await pollingQueryFunction(() =>
      get(territoryRef)
    );

    return territoryAddsResult;
  } catch (error) {
    console.error("Error fetching territory data:", error);
    return;
  }
};

export default getTerritoryData;
