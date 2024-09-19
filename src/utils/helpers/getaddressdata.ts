import processAddressData from "./processadddata";
import processLinkDetails from "./processlinkct";
import getMaxUnitLength from "./maxunitlength";
import { DataSnapshot } from "firebase/database";

const getAddressData = async (
  code: string,
  postalCode: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  snapShot: DataSnapshot
) => {
  if (!snapShot.exists()) {
    return null;
  }
  const postalSnapshot = snapShot.val();
  const floorData = await processAddressData(
    code,
    postalCode,
    postalSnapshot.units
  );
  const linkDetails = await processLinkDetails(code, postalCode);
  return {
    assigneeDetailsList: linkDetails.assigneeDetailsList,
    personalDetailsList: linkDetails.personalDetailsList,
    name: postalSnapshot.name,
    postalCode: postalCode,
    floors: floorData,
    feedback: postalSnapshot.feedback,
    type: postalSnapshot.type,
    instructions: postalSnapshot.instructions,
    location: postalSnapshot.location,
    coordinates: postalSnapshot.coordinates,
    aggregates: postalSnapshot.aggregates,
    maxUnitLength: getMaxUnitLength(floorData)
  };
};

export default getAddressData;
