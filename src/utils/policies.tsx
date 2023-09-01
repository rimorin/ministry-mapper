import { IdTokenResult } from "firebase/auth";
import {
  NOT_HOME_STATUS_CODES,
  COUNTABLE_HOUSEHOLD_STATUS,
  STATUS_CODES,
  LINK_TYPES,
  DEFAULT_CONGREGATION_MAX_TRIES
} from "./constants";
import { HHOptionProps, unitDetails } from "./interface";

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

export class Policy {
  maxTries: number;
  countableTypes: Array<string>;
  defaultType: string;
  constructor(
    userData?: IdTokenResult,
    options?: Array<HHOptionProps>,
    maxtries = parseInt(NOT_HOME_STATUS_CODES.SECOND_TRY)
  ) {
    this.maxTries = maxtries;
    this.countableTypes = [];
    this.defaultType = "";
    options?.forEach((option) => {
      if (option.isCountable) {
        this.countableTypes.push(option.code);
      }
      if (option.isDefault) {
        this.defaultType = option.code;
      }
    });
    if (!userData) return;
    const userClaims = userData.claims;
    if (!userClaims) return;
    if (userClaims.maxTries !== undefined) {
      this.maxTries = userClaims.maxTries;
    }
  }
  isCountable(unit: unitDetails): boolean {
    return (
      COUNTABLE_HOUSEHOLD_STATUS.includes(unit.status as string) &&
      this.countableTypes.includes(unit.type as string)
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
}

export class LinkSession {
  tokenEndtime: number;
  postalCode: string;
  maxTries: number;
  linkType: number;
  userId: string;
  congregation: string | undefined;
  tokenCreatetime: number;
  key: string;
  name: string;
  publisherName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(linkData?: any, key?: string) {
    this.tokenEndtime = 0;
    this.postalCode = "";
    this.maxTries = DEFAULT_CONGREGATION_MAX_TRIES;
    this.linkType = LINK_TYPES.VIEW;
    this.tokenCreatetime = new Date().getTime();
    this.userId = "";
    this.congregation = "";
    this.key = "";
    this.name = "";
    this.publisherName = "";
    if (!linkData) return;
    this.key = key || "";
    this.userId = linkData.userId;
    this.tokenCreatetime = linkData.tokenCreatetime;
    this.congregation = linkData.congregation;
    this.name = linkData.name;
    this.publisherName = linkData.publisherName;
    if (linkData.tokenEndtime === undefined) {
      this.tokenEndtime = linkData;
    } else {
      this.tokenEndtime = linkData.tokenEndtime;
      this.postalCode = linkData.postalCode;
      this.linkType = linkData.linkType;
      this.maxTries = linkData.maxTries;
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
