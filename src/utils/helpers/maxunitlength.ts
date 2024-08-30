import { floorDetails } from "../interface";

const getMaxUnitLength = (floors: floorDetails[]) => {
  if (floors.length === 0 || floors[0].units.length === 0) return 1;

  return floors[0].units.reduce((maxLength, element) => {
    const lengthOfUnitNumber = element.number.length;
    return Math.max(maxLength, lengthOfUnitNumber);
  }, 1);
};

export default getMaxUnitLength;
