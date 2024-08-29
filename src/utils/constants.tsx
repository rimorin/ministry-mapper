import {
  HarmBlockThreshold,
  HarmCategory,
  SafetySetting
} from "firebase/vertexai-preview";
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

const PH_STATUS_KEYS = {
  [STATUS_CODES.NOT_HOME]: "address_not_home",
  [STATUS_CODES.DO_NOT_CALL]: "address_do_not_call",
  [STATUS_CODES.DONE]: "address_done",
  [STATUS_CODES.INVALID]: "address_invalid",
  [STATUS_CODES.DEFAULT]: "address_not_done"
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
// 3 secs
const FIREBASE_FUNCTION_TIMEOUT = 3000;

const DEFAULT_CONGREGATION_MAX_TRIES = 2;

const DEFAULT_CONGREGATION_OPTION_IS_MULTIPLE = false;
const DEFAULT_MULTPLE_OPTION_DELIMITER = ", ";

const COUNTABLE_HOUSEHOLD_STATUS = [
  STATUS_CODES.DONE,
  STATUS_CODES.DEFAULT,
  STATUS_CODES.NOT_HOME
];

const MIN_START_FLOOR = 1;
const MAX_TOP_FLOOR = 50;

const TERRITORY_SELECTOR_VIEWPORT_HEIGHT = "85vh";
const LINK_SELECTOR_VIEWPORT_HEIGHT = "40vh";

const TERRITORY_VIEW_WINDOW_WELCOME_TEXT =
  "<!DOCTYPE html><html><head><title>Loading Territory...</title></<head><body><style> body {display: flex; justify-content: center;align-items: center;}</style><h1>Loading Territory...</h1></body></html>";

const UNSUPPORTED_BROWSER_MSG = "Browser doesn't support this feature.";
const PIXELS_TILL_BK_TO_TOP_BUTTON_DISPLAY = 600;
const DEFAULT_UNIT_DNC_MS_TIME = 0;

const TERRITORY_TYPES = {
  PUBLIC: 0,
  PRIVATE: 1,
  BUSINESS: 2
};

const NOTIFICATION_TYPES = {
  FEEDBACK: 1,
  INSTRUCTIONS: 2
};

//eslint-disable-next-line
const SPECIAL_CHARACTERS = /[`!@#$%^&()_+\=\[\]{};':"\\|,.<>\/?~][^-*]/;
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
  MANAGE_CONG_SETTINGS: `${MINISTRY_MAPPER_WIKI_PAGE}/${ADMIN_WIKI}#14-other-congregation-settings`,
  MANAGE_CONG_OPTIONS: `${MINISTRY_MAPPER_WIKI_PAGE}/${ADMIN_WIKI}#15-congregation-options`,
  GET_ASSIGNMENTS: `${MINISTRY_MAPPER_WIKI_PAGE}/${CONDUCTOR_WIKI}#list-of-assignments`,
  UPDATE_UNIT_STATUS: `${MINISTRY_MAPPER_WIKI_PAGE}/${PUBLISHER_WIKI}#4-marking-slips`,
  CONDUCTOR_ADDRESS_FEEDBACK: `${MINISTRY_MAPPER_WIKI_PAGE}/${CONDUCTOR_WIKI}#4-receiving-feedback-from-publishers`,
  PUBLISHER_ADDRESS_FEEDBACK: `${MINISTRY_MAPPER_WIKI_PAGE}/${PUBLISHER_WIKI}#6-giving-feedback-to-administrators-and-conductors`
};

const DEFAULT_FB_CLOUD_FUNCTIONS_REGION = "asia-southeast1";
const DEFAULT_MAP_DIRECTION_CONGREGATION_LOCATION = "sg";
// create a map of coordinates for each congregation
// key is the congregation name
// value is the coordinates
const DEFAULT_COORDINATES = {
  Singapore: {
    lat: 1.2814921633413734,
    lng: 103.86357685947748
  },
  Malaysia: {
    lat: 4.2105,
    lng: 101.9758
  }
};

const CLOUD_FUNCTIONS_CALLS = {
  UPDATE_USER_ACCESS: "updateUserAccess",
  GET_CONGREGATION_USERS: "getCongregationUsers",
  GET_USER_BY_EMAIL: "getUserByEmail"
};

const AI_MODEL = "gemini-1.5-flash";
const NOTE_AI_PROMPT = `
<OBJECTIVE_AND_PERSONA>
You are a developer tasked with refining a feature that analyzes notes to ensure they contain only household address information, exclude personal information about individuals, and accommodate permissible business details like company names. Additionally, allow for details about the house itself such as renovation, empty house, foreclosed, friends, etc., including their short forms.
</OBJECTIVE_AND_PERSONA>

<INSTRUCTIONS>
To enhance this feature, proceed as follows:
1. Analyze the content of a note to identify household address information.
2. Check for any personal information such as names, phone numbers, emails, health conditions, family situations, or other uniquely identifying details of individuals.
3. Identify and allow business-related details such as company names, provided they do not contain personal information.
4. Allow for details about the house itself such as renovation, empty house, foreclosed, friends, etc., including their short forms.
5. Return the analysis results in a strict JSON format. If personal information about individuals is found, provide a single actionable recommendation to ensure the note adheres to the criteria. If the note passes the criteria, indicate so without a recommendation.
</INSTRUCTIONS>

<CONSTRAINTS>
Dos and don'ts for the following aspects:
1. Dos:
  - Strictly adhere to JSON syntax rules.
  - Use double quotes for keys and string values.
  - Ensure proper use of commas and colons.
  - Include permissible business details like company names when relevant.
  - Allow for house-related details such as renovation, empty house, foreclosed, friends, etc., and their short forms.
2. Don'ts:
  - Avoid including comments in the JSON response.
  - Exclude personal information about individuals unless it is integral to the business details.
</CONSTRAINTS>

<CONTEXT>
This feature is essential for an application that processes notes related to household addresses, ensuring they are free from sensitive personal information about individuals before any processing or sharing, while accommodating relevant business details and house-related details.
</CONTEXT>

<OUTPUT_FORMAT>
The output format must be:
1. A JSON object with a boolean key "containsPersonalInfo" indicating whether personal information about individuals was found.
2. A "recommendation" key with a string value providing an actionable recommendation if personal information is found. This recommendation should include a detailed explanation of why the note contains personal information, identifying specific types of personal information found and why they are considered personal. Additionally, explain why personal information should not be included in the note. If the note passes the criteria, the "recommendation" key should be omitted.
</OUTPUT_FORMAT>

<FEW_SHOT_EXAMPLES>
Examples include:
1. Input: "The Smith residence is located at 123 Maple Street, Anytown, AT 12345. John's phone number is 555-1234."
  Output: {
    "containsPersonalInfo": true,
    "recommendation": "This note contains personal information in two instances: 1) It mentions 'The Smith residence', which includes a family name. 2) It includes a personal phone number '555-1234' associated with an individual named John. Both names and personal contact information are considered sensitive personal data. Personal information should not be included in the note to protect individuals' privacy and comply with data protection regulations. Please revise the note to focus solely on the address details, removing personal names and contact information."
  }

2. Input: "Reminder: Send mail to 456 Oak Avenue, Anytown, AT 67890."
  Output: {"containsPersonalInfo": false}

3. Input: "Meeting at 789 Pine Road, Anytown, AT 10112 on Thursday. Jane Doe will attend."
  Output: {
    "containsPersonalInfo": true,
    "recommendation": "The note includes personal information by mentioning 'Jane Doe', which is an individual's name. Names are considered personal identifying information. Personal information should not be included in the note to protect individuals' privacy and comply with data protection regulations. Please revise the note to include only the address information, removing any references to specific individuals."
  }

4. Input: "Property at 321 Birch Street, Anytown, AT 20224 needs inspection for renovation. Contact XYZ Renovations."
  Output: {"containsPersonalInfo": false}

5. Input: "The Johnson family at 654 Elm Street, Anytown, AT 30336 has requested a valuation. Contact: johnson.family@email.com"
  Output: {
    "containsPersonalInfo": true,
    "recommendation": "This note contains personal information in two forms: 1) It mentions 'The Johnson family', which includes a family name. 2) It includes a personal email address 'johnson.family@email.com'. Both family names and personal email addresses are considered sensitive personal data. Personal information should not be included in the note to protect individuals' privacy and comply with data protection regulations. Please revise the note to include only the address details and any relevant business information, removing family names and email addresses."
  }

6. Input: "John Lobb. Coping with health issues."
  Output: {
    "containsPersonalInfo": true,
    "recommendation": "This note contains sensitive personal information in two aspects: 1) It mentions 'John Lobb', which is an individual's name. 2) It refers to 'health issues', which is considered private medical information. Both personal names and health details are highly sensitive personal data. Personal information should not be included in the note to protect individuals' privacy and comply with data protection regulations. Please revise the note to focus only on household address information, excluding any personal names or health-related details."
  }

7. Input: "Acme Corp at 123 Industrial Way, Anytown, AT 45678 is expanding its warehouse."
  Output: {"containsPersonalInfo": false}

8. Input: "123 Elm Street, Anytown, AT 30336 is currently empty and under renovation."
  Output: {"containsPersonalInfo": false}

9. Input: "456 Oak Avenue, Anytown, AT 67890 is foreclosed (FC)."
  Output: {"containsPersonalInfo": false}

10. Input: "789 Pine Road, Anytown, AT 10112 is a friend's house (FR)."
  Output: {"containsPersonalInfo": false}
</FEW_SHOT_EXAMPLES>

<RECAP>
Emphasize the importance of ensuring notes contain only household address information, are free from personal information about individuals, and accommodate relevant business details and house-related details. The response must be in strict JSON format and adhere to JSON syntax rules.
</RECAP>
`;
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
  },
  {
    category: HarmCategory.HARM_CATEGORY_UNSPECIFIED,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
  }
] as SafetySetting[];
const AI_SETTINGS = {
  model: AI_MODEL,
  systemInstruction: NOTE_AI_PROMPT,
  safetySettings: safetySettings,
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.2
  }
};
export {
  UNSUPPORTED_BROWSER_MSG,
  STATUS_CODES,
  MUTABLE_CODES,
  DEFAULT_FLOOR_PADDING,
  DEFAULT_SELF_DESTRUCT_HOURS,
  FIREBASE_AUTH_UNAUTHORISED_MSG,
  TERRITORY_VIEW_WINDOW_WELCOME_TEXT,
  NOT_HOME_STATUS_CODES,
  MIN_START_FLOOR,
  MAX_TOP_FLOOR,
  COUNTABLE_HOUSEHOLD_STATUS,
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
  WIKI_CATEGORIES,
  DEFAULT_FB_CLOUD_FUNCTIONS_REGION,
  NOTIFICATION_TYPES,
  DEFAULT_MAP_DIRECTION_CONGREGATION_LOCATION,
  DEFAULT_CONGREGATION_OPTION_IS_MULTIPLE,
  DEFAULT_MULTPLE_OPTION_DELIMITER,
  DEFAULT_COORDINATES,
  CLOUD_FUNCTIONS_CALLS,
  AI_SETTINGS,
  PH_STATUS_KEYS
};
