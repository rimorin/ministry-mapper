import { NOT_HOME_STATUS_CODES, HOUSEHOLD_LANGUAGES } from "./util";

const STORAGE_HOMELANGUAGE = "homeLanguage";
const STORAGE_MAXTRIES = "maxTries";
export class Preferences {
  homeLanguage: string;
  maxTries: number;
  constructor() {
    this.homeLanguage = HOUSEHOLD_LANGUAGES.ENGLISH.CODE;
    this.maxTries = parseInt(NOT_HOME_STATUS_CODES.SECOND_TRY);
  }
}
export const loadPreferences = (prefs: Preferences) => {
  var s;
  s = localStorage.getItem(STORAGE_HOMELANGUAGE);
  prefs.homeLanguage = s === null ? prefs.homeLanguage : s;
  s = localStorage.getItem(STORAGE_MAXTRIES);
  prefs.maxTries = s === null ? prefs.maxTries : parseInt(s);
};
export const savePreferences = (prefs: Preferences) => {
  localStorage.setItem(STORAGE_HOMELANGUAGE, prefs.homeLanguage);
  localStorage.setItem(STORAGE_MAXTRIES, String(prefs.maxTries));
};
