import {
  TERRITORY_TYPES,
  SPECIAL_CHARACTERS,
  NUMERIC_CHARACTERS
} from "../constants";

const isValidPostalSequence = (
  sequence: string,
  postalType = TERRITORY_TYPES.PRIVATE
) => {
  if (!sequence) return false;
  const units = sequence.split(",");
  if (units.length === 0) return false;
  for (let index = 0; index < units.length; index++) {
    const unitValue = units[index].trim();
    // check if unit is blank after trimming
    if (!unitValue) return false;
    // check if there are special chars
    if (SPECIAL_CHARACTERS.test(unitValue)) return false;
    if (postalType === TERRITORY_TYPES.PUBLIC) {
      // if public, check if unit is numeric only
      if (!NUMERIC_CHARACTERS.test(unitValue)) return false;
    }
  }
  return true;
};

export default isValidPostalSequence;
