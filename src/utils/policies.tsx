import {
  NOT_HOME_STATUS_CODES,
  COUNTABLE_HOUSEHOLD_STATUS,
  HOUSEHOLD_TYPES,
  STATUS_CODES,
  HOUSEHOLD_LANGUAGES,
  LINK_TYPES
} from "./constants";
import { unitDetails, Policy } from "./interface";

const AVAILABLE_STYLE_CLASS = "available";

const processAvailableColour = (
  completedUnit = false,
  countableUnit = true,
  addressProgress = 0
) => {
  if (!countableUnit || completedUnit) return "";
  if (addressProgress < 90) return AVAILABLE_STYLE_CLASS;

  return `${AVAILABLE_STYLE_CLASS} cell-highlight`;
};

export class RacePolicy implements Policy {
  maxTries: number;
  constructor(
    userData?: any,
    maxtries = parseInt(NOT_HOME_STATUS_CODES.SECOND_TRY)
  ) {
    this.maxTries = maxtries;
    if (!userData) return;
    const userClaims = userData.claims;
    if (!userClaims) return;
    if (userClaims.maxTries !== undefined) {
      this.maxTries = userData.maxTries;
    }
  }
  isCountable(unit: unitDetails): boolean {
    return (
      COUNTABLE_HOUSEHOLD_STATUS.includes(unit.status as string) &&
      unit.type !== HOUSEHOLD_TYPES.MALAY
    );
  }
  isCompleted(unit: unitDetails): boolean {
    const tries: number = parseInt(unit.nhcount as string);
    return (
      unit.status === STATUS_CODES.DONE ||
      (unit.status === STATUS_CODES.NOT_HOME && tries >= this.maxTries)
    );
  }
  getUnitColor(unit: unitDetails, progress: number): string {
    return processAvailableColour(
      this.isCompleted(unit),
      this.isCountable(unit),
      progress
    );
  }
  getHomeLanguage(): string {
    return "";
  }
  getMaxTries(): number {
    return this.maxTries;
  }
}

export class LanguagePolicy implements Policy {
  maxTries: number;
  homeLanguage: string;
  constructor(
    userData?: any,
    maxtries = parseInt(NOT_HOME_STATUS_CODES.SECOND_TRY),
    homelanguage = HOUSEHOLD_LANGUAGES.ENGLISH.CODE
  ) {
    this.maxTries = maxtries;
    this.homeLanguage = homelanguage;
    if (!userData) return;
    const userClaims = userData.claims;
    if (!userClaims) return;
    if (userClaims.maxTries !== undefined) {
      this.maxTries = userClaims.maxTries;
    }
    if (userClaims.homeLanguage !== undefined) {
      this.homeLanguage = userClaims.homeLanguage;
    }
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
  getUnitColor(unit: unitDetails, progress: number): string {
    return processAvailableColour(
      this.isCompleted(unit),
      this.isCountable(unit),
      progress
    );
  }
  getHomeLanguage(): string {
    return this.homeLanguage;
  }
  getMaxTries(): number {
    return this.maxTries;
  }
}

export class LinkSession {
  tokenEndtime: number;
  postalCode: string;
  homeLanguage: string;
  maxTries: number;
  linkType: number;
  constructor(linkData?: any) {
    this.tokenEndtime = 0;
    this.postalCode = "";
    this.homeLanguage = HOUSEHOLD_LANGUAGES.ENGLISH.CODE;
    this.maxTries = 2;
    this.linkType = LINK_TYPES.VIEW;
    if (!linkData) return;
    if (linkData.tokenEndtime === undefined) {
      this.tokenEndtime = linkData;
    } else {
      this.tokenEndtime = linkData.tokenEndtime;
      this.postalCode = linkData.postalCode;
      this.linkType = linkData.linkType;
      this.maxTries = linkData.maxTries;
      this.homeLanguage = linkData.homeLanguage;
    }
  }
}

export class LinkCounts {
  assigneeCount: number;
  personalCount: number;
  constructor() {
    this.assigneeCount = 0;
    this.personalCount = 0;
  }
}
