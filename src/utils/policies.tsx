import { IdTokenResult } from "firebase/auth";
import {
  NOT_HOME_STATUS_CODES,
  COUNTABLE_HOUSEHOLD_STATUS,
  STATUS_CODES,
  LINK_TYPES,
  DEFAULT_CONGREGATION_MAX_TRIES,
  DEFAULT_CONGREGATION_OPTION_IS_MULTIPLE,
  DEFAULT_MULTPLE_OPTION_DELIMITER,
  DEFAULT_MAP_DIRECTION_CONGREGATION_LOCATION
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
  isMultiselect: boolean;
  origin: string;
  constructor(
    userData?: IdTokenResult,
    options?: Array<HHOptionProps>,
    maxtries = parseInt(NOT_HOME_STATUS_CODES.SECOND_TRY),
    isMultiselect = DEFAULT_CONGREGATION_OPTION_IS_MULTIPLE,
    origin = DEFAULT_MAP_DIRECTION_CONGREGATION_LOCATION
  ) {
    this.maxTries = maxtries;
    this.countableTypes = [];
    this.defaultType = "";
    this.isMultiselect = isMultiselect;
    this.origin = origin;
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
    // check for customised user max tries and countable types
    if (!userClaims) return;
    const policyCountableTypes = userClaims.countableTypes;
    const policyMaxTries = userClaims.maxTries;
    if (typeof policyMaxTries === "number" && policyMaxTries > 0) {
      this.maxTries = policyMaxTries;
    }
    if (
      Array.isArray(policyCountableTypes) &&
      policyCountableTypes.length > 0
    ) {
      this.countableTypes = policyCountableTypes;
    }
  }
  isCountable(unit: unitDetails): boolean {
    if (this.isMultiselect) {
      const multipleTypes = unit.type.split(DEFAULT_MULTPLE_OPTION_DELIMITER);
      return (
        COUNTABLE_HOUSEHOLD_STATUS.includes(unit.status as string) &&
        multipleTypes.some((type) => this.countableTypes.includes(type))
      );
    }
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
  requiresPostcode(): boolean {
    return this.origin === DEFAULT_MAP_DIRECTION_CONGREGATION_LOCATION;
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

export class LinkDetails {
  assigneeDetailsList: Array<LinkSession>;
  personalDetailsList: Array<LinkSession>;
  constructor() {
    this.assigneeDetailsList = [];
    this.personalDetailsList = [];
  }
}
