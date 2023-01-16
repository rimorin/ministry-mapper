import { unitDetails, Policy } from "./interface";
import {
  COUNTABLE_HOUSEHOLD_STATUS,
  HOUSEHOLD_TYPES,
  STATUS_CODES,
  NOT_HOME_STATUS_CODES,
  LINK_TYPES,
  HOUSEHOLD_LANGUAGES
} from "./util";

export class RacePolicy implements Policy {
  maxTries: number;
  constructor(maxtries = parseInt(NOT_HOME_STATUS_CODES.SECOND_TRY)) {
    this.maxTries = maxtries;
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
  isAvailable(unit: unitDetails): boolean {
    return this.isCountable(unit) && !this.isCompleted(unit);
  }
  getHomeLanguage(): string {
    return "";
  }
  getMaxTries(): number {
    return this.maxTries;
  }
  fromClaims(claims: any): void {
    if (claims.maxTries !== undefined) {
      this.maxTries = claims.maxTries;
    }
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
  isAvailable(unit: unitDetails): boolean {
    return this.isCountable(unit) && !this.isCompleted(unit);
  }
  getHomeLanguage(): string {
    return this.homeLanguage;
  }
  getMaxTries(): number {
    return this.maxTries;
  }
  fromClaims(claims: any): void {
    if (claims.maxTries !== undefined) {
      this.maxTries = claims.maxTries;
    }
    if (claims.homeLanguage !== undefined) {
      this.homeLanguage = claims.homeLanguage;
    }
  }
}

export class LinkSession {
  tokenEndtime: number;
  postalCode: string;
  homeLanguage: string;
  maxTries: number;
  linkType: number;
  constructor() {
    this.tokenEndtime = 0;
    this.postalCode = "";
    this.homeLanguage = HOUSEHOLD_LANGUAGES.ENGLISH.CODE;
    this.maxTries = 2;
    this.linkType = LINK_TYPES.VIEW;
  }
  fromSnapshot(linkval: any) {
    if (linkval.tokenEndtime === undefined) {
      this.tokenEndtime = linkval;
    } else {
      this.tokenEndtime = linkval.tokenEndtime;
      this.postalCode = linkval.postalCode;
      this.linkType = linkval.linkType;
      this.maxTries = linkval.maxTries;
      this.homeLanguage = linkval.homeLanguage;
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
