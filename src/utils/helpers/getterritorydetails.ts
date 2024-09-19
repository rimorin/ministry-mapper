import { get, query, ref, orderByValue } from "firebase/database";
import { database } from "../../firebase";
import pollingQueryFunction from "./pollingquery";

const getTerritoryData = async (
  congregationCode: string,
  selectedTerritoryCode: string
) => {
  const detailsListing = [] as Array<string>;
  try {
    const territoryRef = query(
      ref(
        database,
        `congregations/${congregationCode}/territories/${selectedTerritoryCode}/addresses`
      ),
      orderByValue()
    );

    const territoryAddsResult = await pollingQueryFunction(() =>
      get(territoryRef)
    );

    if (!territoryAddsResult.exists()) {
      return detailsListing;
    }

    territoryAddsResult.forEach((address) => {
      detailsListing.push(address.val());
    });
  } catch (error) {
    console.error("Error fetching territory data:", error);
  }
  return detailsListing;
};

export default getTerritoryData;
