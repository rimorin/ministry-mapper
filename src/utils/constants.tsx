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
  NO_ACCESS: { CODE: -1, DISPLAY: "Delete Access", SHORT_DISPLAY: "D" },
  READ_ONLY: { CODE: 1, DISPLAY: "Read-only", SHORT_DISPLAY: "R" },
  CONDUCTOR: { CODE: 2, DISPLAY: "Conductor", SHORT_DISPLAY: "C" },
  TERRITORY_SERVANT: {
    CODE: 3,
    DISPLAY: "Administrator",
    SHORT_DISPLAY: "A"
  }
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
const LINK_SELECTOR_VIEWPORT_HEIGHT = "40vh";

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
const NUMERIC_CHARACTERS = /^-?\d+$/;
// Hardcode for local SG postal standards
const MINIMUM_POSTAL_LENGTH = 6;

const MINIMUM_PASSWORD_LENGTH = 6;
const PASSWORD_POLICY = [
  "minLength",
  "number",
  "capital",
  "match"
] as RuleNames[];

const MINISTRY_MAPPER_WIKI_PAGE =
  "https://github.com/rimorin/ministry-mapper/wiki";

const ADMIN_WIKI = "for-administrators";
const CONDUCTOR_WIKI = "for-conductors";
const PUBLISHER_WIKI = "for-Publishers";

const WIKI_CATEGORIES = {
  CREATE_ACCOUNT: `${MINISTRY_MAPPER_WIKI_PAGE}/Getting-Started-(for-Administrators-and-Conductors)#setup-accounts`,
  CREATE_TERRITORIES: `${MINISTRY_MAPPER_WIKI_PAGE}/${ADMIN_WIKI}#2-create-territories`,
  DELETE_TERRITORIES: `${MINISTRY_MAPPER_WIKI_PAGE}/${ADMIN_WIKI}#4-deleting-territories`,
  RESET_TERRITORIES: `${MINISTRY_MAPPER_WIKI_PAGE}/${ADMIN_WIKI}#9-resetting-territories`,
  CHANGE_TERRITORY_NAME: `${MINISTRY_MAPPER_WIKI_PAGE}/${ADMIN_WIKI}#change-territory-name`,
  CHANGE_TERRITORY_CODE: `${MINISTRY_MAPPER_WIKI_PAGE}/${ADMIN_WIKI}#change-territory-code`,
  CHANGE_ADDRESS_NAME: `${MINISTRY_MAPPER_WIKI_PAGE}/${ADMIN_WIKI}#change-address-name`,
  RESET_ADDRESS: `${MINISTRY_MAPPER_WIKI_PAGE}/${ADMIN_WIKI}#8-resetting-addresses`,
  DELETE_ADDRESS: `${MINISTRY_MAPPER_WIKI_PAGE}/${ADMIN_WIKI}#5-deleting-addresses`,
  DELETE_ADDRESS_FLOOR: `${MINISTRY_MAPPER_WIKI_PAGE}/${ADMIN_WIKI}#adddelete-floors-for-public-addresses-only`,
  CHANGE_ADDRESS_POSTAL: `${MINISTRY_MAPPER_WIKI_PAGE}/${ADMIN_WIKI}#change-postal-code`,
  CREATE_PUBLIC_ADDRESS: `${MINISTRY_MAPPER_WIKI_PAGE}/${ADMIN_WIKI}#for-public-addresses`,
  CREATE_PRIVATE_ADDRESS: `${MINISTRY_MAPPER_WIKI_PAGE}/${ADMIN_WIKI}#for-private-addresses`,
  ADD_PUBLIC_UNIT: `${MINISTRY_MAPPER_WIKI_PAGE}/${ADMIN_WIKI}#adddelete-units-for-public-addresses-only`,
  ADD_DELETE_PRIVATE_PROPERTY: `${MINISTRY_MAPPER_WIKI_PAGE}/${ADMIN_WIKI}#adddelete-house-for-private-addresses-only`,
  UPDATE_UNIT_NUMBER: `${MINISTRY_MAPPER_WIKI_PAGE}/${ADMIN_WIKI}#change-unit-sequence-for-public-addresses-only`,
  UPDATE_INSTRUCTIONS: `${MINISTRY_MAPPER_WIKI_PAGE}/${ADMIN_WIKI}#11-giving-instructions-to-publishers`,
  CREATE_PERSONAL_SLIPS: `${MINISTRY_MAPPER_WIKI_PAGE}/${ADMIN_WIKI}#10-assigning-slips-for-personal-territory`,
  INVITE_USER: `${MINISTRY_MAPPER_WIKI_PAGE}/${ADMIN_WIKI}#inviting-users`,
  MANAGE_USERS: `${MINISTRY_MAPPER_WIKI_PAGE}/${ADMIN_WIKI}#managing-users`,
  MANAGE_CONG_SETTINGS: `${MINISTRY_MAPPER_WIKI_PAGE}/${ADMIN_WIKI}#managing-congregation-settings`,
  GET_ASSIGNMENTS: `${MINISTRY_MAPPER_WIKI_PAGE}/${CONDUCTOR_WIKI}#list-of-assignments`,
  UPDATE_UNIT_STATUS: `${MINISTRY_MAPPER_WIKI_PAGE}/${PUBLISHER_WIKI}#4-marking-slips`,
  CONDUCTOR_ADDRESS_FEEDBACK: `${MINISTRY_MAPPER_WIKI_PAGE}/${CONDUCTOR_WIKI}#4-receiving-feedback-from-publishers`,
  PUBLISHER_ADDRESS_FEEDBACK: `${MINISTRY_MAPPER_WIKI_PAGE}/${PUBLISHER_WIKI}#6-giving-feedback-to-administrators-and-conductors`
};

const ASSIGNMENT_MODAL_ID = "mm-user-assignments";

const DEFAULT_FB_CLOUD_FUNCTIONS_REGION = "asia-southeast1";

export {
  UA_DEVICE_MAKES,
  UNSUPPORTED_BROWSER_MSG,
  STATUS_CODES,
  MUTABLE_CODES,
  DEFAULT_FLOOR_PADDING,
  DEFAULT_SELF_DESTRUCT_HOURS,
  HOUSEHOLD_TYPES,
  FIREBASE_AUTH_UNAUTHORISED_MSG,
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
  MINISTRY_MAPPER_WIKI_PAGE,
  NUMERIC_CHARACTERS,
  LINK_SELECTOR_VIEWPORT_HEIGHT,
  ASSIGNMENT_MODAL_ID,
  WIKI_CATEGORIES,
  DEFAULT_FB_CLOUD_FUNCTIONS_REGION
};
