import { HOUSEHOLD_LANGUAGES } from "../constants";

const getLanguageDisplayByCode = (code: string): string => {
  let display = "";
  if (code !== undefined) {
    const keys = Object.keys(HOUSEHOLD_LANGUAGES);
    keys.every((key) => {
      const language = Reflect.get(HOUSEHOLD_LANGUAGES, key);
      if (language.CODE.toLowerCase() === code.toLowerCase()) {
        display = language.DISPLAY;
        return false;
      }
      return true;
    });
  }
  return display;
};

export default getLanguageDisplayByCode;
