import { RuleNames } from "react-password-checklist";

//STILL_NOT_HOME not longer in use.
const STATUS_CODES = {
  DEFAULT: "-1",
  DONE: "1",
  NOT_HOME: "2",
  STILL_NOT_HOME: "3",
  DO_NOT_CALL: "4",
  INVALID: "5"
};

const NOT_HOME_STATUS_CODES = {
  DEFAULT: "1",
  SECOND_TRY: "2",
  THIRD_TRY: "3",
  FOURTH_TRY: "4"
};

const USER_ACCESS_LEVELS = {
  READ_ONLY: 1,
  CONDUCTOR: 2,
  TERRITORY_SERVANT: 3
};

const HOUSEHOLD_TYPES = {
  CHINESE: "cn",
  MALAY: "ml",
  INDIAN: "in",
  FILIPINO: "fp",
  INDONESIAN: "id",
  BURMESE: "bm",
  THAI: "th",
  VIETNAMESE: "vn",
  OTHER: "ot"
};

const MUTABLE_CODES = [
  STATUS_CODES.DONE,
  STATUS_CODES.NOT_HOME,
  STATUS_CODES.STILL_NOT_HOME
];

const ADMIN_MODAL_TYPES = {
  UNIT: 0,
  FEEDBACK: 1,
  LINK: 2,
  RENAME_TERRITORY: 3,
  CREATE_PUBLIC_ADDRESS: 4,
  CREATE_TERRITORY: 5,
  ADD_UNIT: 6,
  RENAME_ADDRESS_NAME: 7,
  UPDATE_UNIT: 8,
  PROFILE: 9,
  UPDATE_POSTAL: 10,
  UPDATE_TERRITORY_CODE: 11,
  CREATE_PRIVATE_ADDRESS: 12,
  CHANGE_PASSWORD: 13,
  INSTRUCTIONS: 14,
  PERSONAL_SLIP: 15
};

const LINK_TYPES = {
  VIEW: 0,
  ASSIGNMENT: 1,
  PERSONAL: 2
};

const DEFAULT_FLOOR_PADDING = 2;
// 24 hours
const DEFAULT_SELF_DESTRUCT_HOURS = 24;
const MIN_PERCENTAGE_DISPLAY = 10;
const FIREBASE_AUTH_UNAUTHORISED_MSG =
  "Client doesn't have permission to access the desired data.";
// 5 secs
const RELOAD_CHECK_INTERVAL_MS = 5000;
// 10mins
const RELOAD_INACTIVITY_DURATION = 600000;
// 3 secs
const FIREBASE_FUNCTION_TIMEOUT = 3000;

const DEFAULT_CONGREGATION_MAX_TRIES = 2;

const COUNTABLE_HOUSEHOLD_STATUS = [
  STATUS_CODES.DONE,
  STATUS_CODES.DEFAULT,
  STATUS_CODES.NOT_HOME
];

const MIN_START_FLOOR = 1;
const MAX_TOP_FLOOR = 40;

const TERRITORY_SELECTOR_VIEWPORT_HEIGHT = "75vh";

const TERRITORY_VIEW_WINDOW_WELCOME_TEXT =
  "<!DOCTYPE html><html><head><title>Loading Territory...</title></<head><body><style> body {display: flex; justify-content: center;align-items: center;}</style><h1>Loading Territory...</h1></body></html>";

const HOUSEHOLD_LANGUAGES = {
  ENGLISH: { CODE: "e", DISPLAY: "English" },
  CHINESE: { CODE: "c", DISPLAY: "Chinese" },
  BURMESE: { CODE: "b", DISPLAY: "Burmese" },
  TAMIL: { CODE: "t", DISPLAY: "Tamil" },
  TAGALOG: { CODE: "tg", DISPLAY: "Tagalog" },
  INDONESIAN: { CODE: "id", DISPLAY: "Indonesian" },
  MALAY: { CODE: "m", DISPLAY: "Malay" }
};

const UA_DEVICE_MAKES = {
  HUAWEI: "Huawei"
};

const UNSUPPORTED_BROWSER_MSG = "Browser doesn't support this feature.";
const PIXELS_TILL_BK_TO_TOP_BUTTON_DISPLAY = 600;
const DEFAULT_UNIT_DNC_MS_TIME = 0;

const TERRITORY_TYPES = {
  PUBLIC: 0,
  PRIVATE: 1,
  BUSINESS: 2
};

//eslint-disable-next-line
const SPECIAL_CHARACTERS = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
// Hardcode for local SG postal standards
const MINIMUM_POSTAL_LENGTH = 6;

const MINIMUM_PASSWORD_LENGTH = 6;
const PASSWORD_POLICY = [
  "minLength",
  "number",
  "capital",
  "match"
] as RuleNames[];

const MINISTRY_MAPPER_INFORMATION_PAGE =
  "https://github.com/rimorin/ministry-mapper/wiki";

export {
  UA_DEVICE_MAKES,
  UNSUPPORTED_BROWSER_MSG,
  STATUS_CODES,
  MUTABLE_CODES,
  DEFAULT_FLOOR_PADDING,
  DEFAULT_SELF_DESTRUCT_HOURS,
  HOUSEHOLD_TYPES,
  FIREBASE_AUTH_UNAUTHORISED_MSG,
  ADMIN_MODAL_TYPES,
  RELOAD_CHECK_INTERVAL_MS,
  RELOAD_INACTIVITY_DURATION,
  TERRITORY_VIEW_WINDOW_WELCOME_TEXT,
  NOT_HOME_STATUS_CODES,
  MIN_START_FLOOR,
  MAX_TOP_FLOOR,
  COUNTABLE_HOUSEHOLD_STATUS,
  HOUSEHOLD_LANGUAGES,
  USER_ACCESS_LEVELS,
  LINK_TYPES,
  TERRITORY_SELECTOR_VIEWPORT_HEIGHT,
  FIREBASE_FUNCTION_TIMEOUT,
  MIN_PERCENTAGE_DISPLAY,
  PIXELS_TILL_BK_TO_TOP_BUTTON_DISPLAY,
  DEFAULT_UNIT_DNC_MS_TIME,
  TERRITORY_TYPES,
  SPECIAL_CHARACTERS,
  MINIMUM_POSTAL_LENGTH,
  MINIMUM_PASSWORD_LENGTH,
  PASSWORD_POLICY,
  DEFAULT_CONGREGATION_MAX_TRIES,
  MINISTRY_MAPPER_INFORMATION_PAGE
};
