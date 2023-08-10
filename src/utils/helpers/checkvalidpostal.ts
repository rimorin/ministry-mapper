import { MINIMUM_POSTAL_LENGTH, SPECIAL_CHARACTERS } from "../constants";

const isValidPostal = (postalCode: string) => {
  if (!postalCode) return false;

  if (isNaN(Number(postalCode))) return false;

  if (postalCode.length < MINIMUM_POSTAL_LENGTH) return false;

  if (SPECIAL_CHARACTERS.test(postalCode)) return false;

  return true;
};

export default isValidPostal;
