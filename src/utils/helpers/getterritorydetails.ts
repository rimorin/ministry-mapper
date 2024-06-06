import { get, query, ref, orderByValue, child } from "firebase/database";
import { database } from "../../firebase";
import pollingQueryFunction from "./pollingquery";

const getTerritoryData = async (
  code: string,
  selectedTerritoryCode: string
) => {
  const [territoryAddsResult, territoryNameResult] = await Promise.all([
    pollingQueryFunction(() =>
      get(
        query(
          ref(
            database,
            `congregations/${code}/territories/${selectedTerritoryCode}/addresses`
          ),
          orderByValue()
        )
      )
    ),
    pollingQueryFunction(() =>
      get(
        child(
          ref(database),
          `congregations/${code}/territories/${selectedTerritoryCode}/name`
        )
      )
    )
  ]);

  return { territoryAddsResult, territoryNameResult };
};

export default getTerritoryData;
