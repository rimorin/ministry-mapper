import { unitDetails, Policy } from "./interface";
import {
  COUNTABLE_HOUSEHOLD_STATUS,
  HOUSEHOLD_TYPES,
  STATUS_CODES,
  NOT_HOME_STATUS_CODES,
  HOUSEHOLD_LANGUAGES
} from "./util";

export class RacePolicy implements Policy {
  isCountable(unit: unitDetails): boolean {
    return (
      COUNTABLE_HOUSEHOLD_STATUS.includes(unit.status as string) &&
      unit.type !== HOUSEHOLD_TYPES.MALAY
    );
  }
  isCompleted(unit: unitDetails): boolean {
    return (
      unit.status === STATUS_CODES.DONE ||
      (unit.status === STATUS_CODES.NOT_HOME &&
        (unit.nhcount === NOT_HOME_STATUS_CODES.SECOND_TRY ||
          unit.nhcount === NOT_HOME_STATUS_CODES.THIRD_TRY))
    );
  }
}

export class LanguagePolicy implements Policy {
  maxTries: number;
  homeLanguage: string;
  constructor(
    maxtries = parseInt(NOT_HOME_STATUS_CODES.SECOND_TRY),
    homelanguage = HOUSEHOLD_LANGUAGES.ENGLISH.CODE
  ) {
    this.maxTries = maxtries;
    this.homeLanguage = homelanguage;
  }
  isHomeLanguage(unit: unitDetails): boolean {
    const languageValue = unit.languages.toUpperCase().trim();
    if (languageValue.length < 1) {
      return true;
    }
    const languages = languageValue.split(",");
    return (
      languages.includes(this.homeLanguage.toUpperCase()) ||
      languages.length === 0
    );
  }
  isCountable(unit: unitDetails): boolean {
    return (
      COUNTABLE_HOUSEHOLD_STATUS.includes(unit.status as string) &&
      this.isHomeLanguage(unit)
    );
  }
  isCompleted(unit: unitDetails): boolean {
    const tries: number = parseInt(unit.nhcount as string);
    return (
      (unit.status === STATUS_CODES.DONE ||
        (unit.status === STATUS_CODES.NOT_HOME && tries >= this.maxTries)) &&
      this.isHomeLanguage(unit)
    );
  }
}
