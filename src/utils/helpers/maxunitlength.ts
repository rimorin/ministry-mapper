import { floorDetails } from "../interface";

const getMaxUnitLength = (floors: floorDetails[]) => {
  let maxUnitNumberLength = 1;
  if (floors.length === 0) return maxUnitNumberLength;
  floors[0].units.forEach((element) => {
    const lengthOfUnitNumber = `${element.number}`.length;
    if (maxUnitNumberLength < lengthOfUnitNumber) {
      maxUnitNumberLength = lengthOfUnitNumber;
    }
  });
  return maxUnitNumberLength;
};

export default getMaxUnitLength;
