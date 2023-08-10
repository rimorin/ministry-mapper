import { TERRITORY_TYPES } from "../constants";

const processPropertyNumber = (unitNo: string, propertyType: number) => {
  if (!unitNo) return "";
  unitNo = unitNo.trim();
  if (propertyType === TERRITORY_TYPES.PRIVATE) {
    return unitNo.toUpperCase();
  }
  return parseInt(unitNo).toString();
};

export default processPropertyNumber;
