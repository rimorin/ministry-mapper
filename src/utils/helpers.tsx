import {
  child,
  get,
  goOffline,
  goOnline,
  orderByChild,
  query,
  startAt,
  endAt,
  update,
  ref,
  DataSnapshot,
  set
} from "firebase/database";
import Rollbar from "rollbar";
import { database } from "../firebase";
import { Policy, floorDetails, unitDetails } from "../utils/interface";
import { LinkSession, LinkCounts } from "../utils/policies";
import {
  LINK_TYPES,
  HOUSEHOLD_LANGUAGES,
  FIREBASE_FUNCTION_TIMEOUT,
  MIN_PERCENTAGE_DISPLAY,
  NOT_HOME_STATUS_CODES,
  TERRITORY_TYPES,
  SPECIAL_CHARACTERS,
  MINIMUM_POSTAL_LENGTH,
  NUMERIC_CHARACTERS
} from "../utils/constants";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const errorHandler = (error: any, rollbar: Rollbar, showAlert = true) => {
  rollbar.error(error);
  if (showAlert) {
    alert(error);
  }
};

const errorMessage = (code: string) => {
  if (code === "auth/too-many-requests")
    return "Device has been blocked temporarily. Please try again later.";
  if (code === "auth/user-disabled")
    return "Account disabled. Please contact support.";
  if (code === "auth/web-storage-unsupported")
    return "Your browser does not support web storage. Please enable it and try again";
  if (code === "auth/network-request-failed")
    return "Network error. Please either try again with a stable internet connection or contact support";
  if (code === "auth/user-not-found") return "Invalid user.";
  if (code === "auth/requires-recent-login")
    return "This security sensitive operation requires re-authentication. Please re-login and try again.";
  return "Invalid Credentials";
};

const ZeroPad = (num: string, places: number) => num.padStart(places, "0");

const assignmentMessage = (address: string) => {
  const currentDate = new Date();
  const hrs = currentDate.getHours();

  let greet;

  if (hrs < 12) greet = "Morning";
  else if (hrs >= 12 && hrs <= 17) greet = "Afternoon";
  else if (hrs >= 17 && hrs <= 24) greet = "Evening";

  return `Good ${greet}!! You are assigned to ${address}. Please click on the link below to proceed.`;
};

const getMaxUnitLength = (floors: floorDetails[]) => {
  let maxUnitNumberLength = 1;
  if (floors.length === 0) return maxUnitNumberLength;
  floors[0].units.forEach((element) => {
    const lengthOfUnitNumber = `${element.number}`.length;
    if (maxUnitNumberLength < lengthOfUnitNumber) {
      maxUnitNumberLength = lengthOfUnitNumber;
    }
  });
  return maxUnitNumberLength;
};

const parseHHLanguages = (languages: string | undefined) => {
  if (!languages) return [];
  return languages.split(",");
};

const processHHLanguages = (languages: string[]) => {
  if (!languages) return "";

  return languages.join();
};

const processCompletedPercentage = (
  completedUnits: number,
  totalUnits: number
) => {
  const completedValue = Math.round((completedUnits / totalUnits) * 100);
  const completedDisplay =
    completedValue > MIN_PERCENTAGE_DISPLAY ? `${completedValue}%` : "";
  return { completedValue, completedDisplay };
};

const getCompletedPercent = (policy: Policy, floors: floorDetails[]) => {
  let totalUnits = 0;
  let completedUnits = 0;

  floors.forEach((element) => {
    element.units.forEach((uElement) => {
      const isCountable = policy.isCountable(uElement);
      if (!isCountable) return;
      if (isCountable) totalUnits++;
      if (policy.isCompleted(uElement)) completedUnits++;
    });
  });
  return processCompletedPercentage(completedUnits, totalUnits);
};

const addHours = (numOfHours: number, date = new Date()) => {
  date.setTime(date.getTime() + numOfHours * 60 * 60 * 1000);
  return date.getTime();
};

const pollingQueryFunction = async (
  callback: () => Promise<DataSnapshot>,
  intervalMs = FIREBASE_FUNCTION_TIMEOUT
) => {
  const reconnectRtdbInterval = SetPollerInterval(intervalMs);
  try {
    return await callback();
  } finally {
    clearInterval(reconnectRtdbInterval);
  }
};

const pollingVoidFunction = async (
  callback: () => Promise<void>,
  intervalMs = FIREBASE_FUNCTION_TIMEOUT
) => {
  const reconnectRtdbInterval = SetPollerInterval(intervalMs);
  try {
    await callback();
  } finally {
    clearInterval(reconnectRtdbInterval);
  }
};

const SetPollerInterval = (intervalMs = FIREBASE_FUNCTION_TIMEOUT) => {
  return setInterval(() => {
    goOffline(database);
    goOnline(database);
  }, intervalMs);
};

const checkTraceRaceStatus = async (code: string) => {
  return await pollingQueryFunction(() =>
    get(child(ref(database), `congregations/${code}/trackRace`))
  );
};

const checkTraceLangStatus = async (code: string) => {
  return await pollingQueryFunction(() =>
    get(child(ref(database), `congregations/${code}/trackLanguages`))
  );
};

const checkCongregationExpireHours = async (code: string) => {
  return await pollingQueryFunction(() =>
    get(child(ref(database), `congregations/${code}/expiryHours`))
  );
};

const checkCongregationMaxTries = async (code: string) => {
  return await pollingQueryFunction(() =>
    get(child(ref(database), `congregations/${code}/maxTries`))
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const processAddressData = async (postal: string, data: any) => {
  const dataList = [];
  for (const floor in data) {
    const unitsDetails: unitDetails[] = [];
    const addressSnapshot = await pollingQueryFunction(() =>
      get(
        query(
          ref(database, `/${postal}/units/${floor}`),
          orderByChild("sequence")
        )
      )
    );
    addressSnapshot.forEach((element: DataSnapshot) => {
      const unitValues = element.val();
      const unitNumber = element.key || "";
      unitsDetails.push({
        propertyPostal: unitValues.x_zip,
        number: unitNumber,
        note: unitValues.note,
        type: unitValues.type || "",
        status: unitValues.status,
        nhcount: unitValues.nhcount || NOT_HOME_STATUS_CODES.DEFAULT,
        languages: unitValues.languages || "",
        dnctime: unitValues.dnctime || null,
        sequence: unitValues.sequence
      });
    });
    dataList.unshift({ floor: floor, units: unitsDetails });
  }
  return dataList;
};

const processLinkCounts = async (postal: string) => {
  const postalCode = postal as string;
  // need to add to rules for links: ".indexOn": "postalCode",
  const linksSnapshot = await pollingQueryFunction(() =>
    get(
      query(
        child(ref(database), "links"),
        orderByChild("postalCode"),
        startAt(postalCode),
        endAt(postalCode)
      )
    )
  );
  const currentTimestamp = new Date().getTime();
  const counts = new LinkCounts();
  linksSnapshot.forEach((rec: DataSnapshot) => {
    const link = rec.val() as LinkSession;
    if (link.tokenEndtime > currentTimestamp) {
      if (link.linkType === LINK_TYPES.ASSIGNMENT) {
        counts.assigneeCount++;
      }
      if (link.linkType === LINK_TYPES.PERSONAL) {
        counts.personalCount++;
      }
    }
  });
  return counts;
};

const triggerPostalCodeListeners = async (postalcode: string) => {
  const deltaSnapshot = await get(ref(database, `/${postalcode}/delta`));
  let delta = 0;
  if (deltaSnapshot.exists()) {
    delta = deltaSnapshot.val() + 1;
  }
  update(ref(database, `/${postalcode}`), {
    delta: delta
  });
};

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

const processPropertyNumber = (unitNo: string, propertyType: number) => {
  if (!unitNo) return "";
  unitNo = unitNo.trim();
  if (propertyType === TERRITORY_TYPES.PRIVATE) {
    return unitNo.toUpperCase();
  }
  return parseInt(unitNo).toString();
};

const isValidPostal = (postalCode: string) => {
  if (!postalCode) return false;

  if (isNaN(Number(postalCode))) return false;

  if (postalCode.length < MINIMUM_POSTAL_LENGTH) return false;

  if (SPECIAL_CHARACTERS.test(postalCode)) return false;

  return true;
};

const isValidPostalSequence = (
  sequence: string,
  postalType = TERRITORY_TYPES.PRIVATE
) => {
  if (!sequence) return false;
  const units = sequence.split(",");
  if (units.length === 0) return false;
  for (let index = 0; index < units.length; index++) {
    const unitValue = units[index].trim();
    // check if unit is blank after trimming
    if (!unitValue) return false;
    // check if there are special chars
    if (SPECIAL_CHARACTERS.test(unitValue)) return false;
    if (postalType === TERRITORY_TYPES.PUBLIC) {
      // if public, check if unit is numeric only
      if (!NUMERIC_CHARACTERS.test(unitValue)) return false;
    }
  }
  return true;
};

const LinkTypeDescription = (linkType: number) => {
  let linkDescription = "";
  switch (linkType) {
    case LINK_TYPES.PERSONAL:
      linkDescription = "Personal";
      break;
    case LINK_TYPES.ASSIGNMENT:
      linkDescription = "Assign";
      break;
    default:
      linkDescription = "View";
  }
  return linkDescription;
};

const LinkDateFormatter = Intl.DateTimeFormat("en", {
  timeStyle: "short",
  dateStyle: "medium"
});

const setNotification = async (
  type: number,
  congregation: string,
  postal: string,
  fromUser: string
) => {
  await pollingVoidFunction(() =>
    set(ref(database, `notifications/${postal}-${type}`), {
      congregation: congregation,
      type: type,
      postalCode: postal,
      fromUser: fromUser
    })
  );
};

export {
  getLanguageDisplayByCode,
  ZeroPad,
  assignmentMessage,
  getMaxUnitLength,
  getCompletedPercent,
  addHours,
  errorMessage,
  errorHandler,
  parseHHLanguages,
  processHHLanguages,
  pollingQueryFunction,
  pollingVoidFunction,
  checkTraceLangStatus,
  checkTraceRaceStatus,
  checkCongregationExpireHours,
  processLinkCounts,
  triggerPostalCodeListeners,
  processAddressData,
  processPropertyNumber,
  isValidPostal,
  SetPollerInterval,
  isValidPostalSequence,
  LinkTypeDescription,
  LinkDateFormatter,
  processCompletedPercentage,
  checkCongregationMaxTries,
  setNotification
};
