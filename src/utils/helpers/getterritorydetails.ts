import { get, query, ref, orderByValue, child } from "firebase/database";
import { database } from "../../firebase";
import pollingQueryFunction from "./pollingquery";

const getTerritoryData = async (
  code: string,
  selectedTerritoryCode: string
) => {
  const [territoryAddsResult, territoryNameResult, territoryAggregates] =
    await Promise.all([
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
      ),
      pollingQueryFunction(() =>
        get(
          child(
            ref(database),
            `congregations/${code}/territories/${selectedTerritoryCode}/aggregates`
          )
        )
      )
    ]);

  return { territoryAddsResult, territoryNameResult, territoryAggregates };
};

export default getTerritoryData;
