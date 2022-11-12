import {
  child,
  get,
  goOffline,
  goOnline,
  orderByChild,
  query,
  ref
} from "firebase/database";
import {
  ListGroup,
  Modal,
  Navbar,
  Offcanvas,
  Popover,
  Table
} from "react-bootstrap";
import Rollbar from "rollbar";
import { database } from "../firebase";
import {
  TitleProps,
  BrandingProps,
  LegendProps,
  floorDetails,
  TerritoryListingProps,
  unitDetails
} from "./interface";
import Countdown from "react-countdown";

const errorHandler = (error: any, rollbar: Rollbar, showAlert = true) => {
  rollbar.error(error);
  if (showAlert) {
    alert(error);
  }
};

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
  THIRD_TRY: "3"
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

const LOGIN_TYPE_CODES = {
  CONDUCTOR: 1,
  ADMIN: 2
};

const ADMIN_MODAL_TYPES = {
  UNIT: 0,
  FEEDBACK: 1,
  LINK: 2,
  RENAME_TERRITORY: 3,
  CREATE_ADDRESS: 4,
  CREATE_TERRITORY: 5,
  ADD_UNIT: 6,
  RENAME_ADDRESS_NAME: 7
};

const DEFAULT_FLOOR_PADDING = 2;
// 24 hours
const DEFAULT_SELF_DESTRUCT_HOURS = 24;
// 4 Weeks for personal slips
const DEFAULT_PERSONAL_SLIP_DESTRUCT_HOURS = 24 * 7 * 4;
const MIN_PERCENTAGE_DISPLAY = 10;
const FIREBASE_AUTH_UNAUTHORISED_MSG =
  "Client doesn't have permission to access the desired data.";
// 5 secs
const RELOAD_CHECK_INTERVAL_MS = 5000;
// 10mins
const RELOAD_INACTIVITY_DURATION = 600000;
// 3 secs
const FIREBASE_FUNCTION_TIMEOUT = 3000;

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

const ModalUnitTitle = ({ unit, floor, postal }: TitleProps) => {
  let titleString = `# ${floor} - ${unit}`;

  if (postal) {
    titleString = `${postal}, ${titleString}`;
  }
  return (
    <Modal.Header>
      <Modal.Title>{titleString}</Modal.Title>
    </Modal.Header>
  );
};

const errorMessage = (code: String) => {
  if (code === "auth/too-many-requests")
    return "Device has been blocked temporarily. Please try again later.";
  if (code === "auth/user-disabled")
    return "Account disabled. Please contact support.";
  if (code === "auth/web-storage-unsupported")
    return "Your browser does not support web storage. Please enable it and try again";
  if (code === "auth/network-request-failed")
    return "Network error. Please either try again with a stable internet connection or contact support";
  return "Invalid Credentials";
};

const ZeroPad = (num: String, places: number) => num.padStart(places, "0");

const assignmentMessage = (address: String) => {
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

  floors[0].units.forEach((element) => {
    const lengthOfUnitNumber = `${element.number}`.length;
    if (maxUnitNumberLength < lengthOfUnitNumber) {
      maxUnitNumberLength = lengthOfUnitNumber;
    }
  });
  return maxUnitNumberLength;
};

const parseHHLanguages = (languages: String) => {
  if (!languages) return [];
  return languages.split(",");
};

const processHHLanguages = (languages: string[]) => {
  if (!languages) return "";

  return languages.join();
};

const getCompletedPercent = (floors: floorDetails[]) => {
  let totalUnits = 0;
  let completedUnits = 0;

  floors.forEach((element) => {
    element.units.forEach((uElement) => {
      const unitStatus = uElement.status.toString();
      const unitType = uElement.type;
      const unitNotHomeCount = uElement.nhcount;
      const isCountable =
        COUNTABLE_HOUSEHOLD_STATUS.includes(unitStatus) &&
        unitType !== HOUSEHOLD_TYPES.MALAY;

      if (isCountable) totalUnits++;
      if (
        unitStatus === STATUS_CODES.DONE ||
        (unitStatus === STATUS_CODES.NOT_HOME &&
          (unitNotHomeCount === NOT_HOME_STATUS_CODES.SECOND_TRY ||
            unitNotHomeCount === NOT_HOME_STATUS_CODES.THIRD_TRY))
      ) {
        completedUnits++;
      }
    });
  });
  const completedValue = Math.round((completedUnits / totalUnits) * 100);
  const completedDisplay =
    completedValue > MIN_PERCENTAGE_DISPLAY ? `${completedValue}%` : "";
  return { completedValue, completedDisplay };
};

const addHours = (numOfHours: number, date = new Date()) => {
  date.setTime(date.getTime() + numOfHours * 60 * 60 * 1000);
  return date.getTime();
};

const pollingFunction = async (
  callback: () => any,
  intervalMs = FIREBASE_FUNCTION_TIMEOUT
) => {
  const reconnectRtdbInterval = setInterval(() => {
    goOffline(database);
    goOnline(database);
  }, intervalMs);
  try {
    return await callback();
  } finally {
    clearInterval(reconnectRtdbInterval);
  }
};

const checkTraceRaceStatus = async (code: string) => {
  return await pollingFunction(() =>
    get(child(ref(database), `congregations/${code}/trackRace`))
  );
};

const checkTraceLangStatus = async (code: string) => {
  return await pollingFunction(() =>
    get(child(ref(database), `congregations/${code}/trackLanguages`))
  );
};

const ExpiryTimePopover = (endtime: number) => {
  return (
    <Popover id="expiry-time-popover-basic">
      <Popover.Header as="h3" className="text-center">
        Expiry Details
      </Popover.Header>
      <Popover.Body>
        Territory slip will expire in{" "}
        <Countdown
          date={endtime}
          daysInHours={true}
          intervalDelay={100}
          precision={3}
          renderer={(props) => {
            const daysDisplay = props.days !== 0 ? <>{props.days}d </> : <></>;
            const hoursDisplay =
              props.hours !== 0 ? <>{props.hours}h </> : <></>;
            const minsDisplay =
              props.minutes !== 0 ? <>{props.minutes}m </> : <></>;
            return (
              <div>
                {daysDisplay}
                {hoursDisplay}
                {minsDisplay}
                {props.formatted.seconds}s
              </div>
            );
          }}
        />
      </Popover.Body>
    </Popover>
  );
};

const processAddressData = async (postal: String, data: any) => {
  const dataList = [];
  for (const floor in data) {
    const unitsDetails: unitDetails[] = [];
    const addressSnapshot = await pollingFunction(() =>
      get(
        query(
          ref(database, `/${postal}/units/${floor}`),
          orderByChild("sequence")
        )
      )
    );
    addressSnapshot.forEach((element: any) => {
      const unitValues = element.val();
      const unitNumber = element.key;
      unitsDetails.push({
        number: unitNumber,
        note: unitValues.note,
        type: unitValues.type || "",
        status: unitValues.status,
        nhcount: unitValues.nhcount || NOT_HOME_STATUS_CODES.DEFAULT,
        languages: unitValues.languages || "",
        dnctime: unitValues.dnctime || null
      });
    });
    dataList.unshift({ floor: floor, units: unitsDetails });
  }
  return dataList;
};

const NavBarBranding = ({ naming }: BrandingProps) => {
  return (
    <Navbar.Brand>
      <img
        alt=""
        src={`${process.env.PUBLIC_URL}/favicon-32x32.png`}
        width="32"
        height="32"
        className="d-inline-block align-top"
      />{" "}
      {naming}
    </Navbar.Brand>
  );
};

const Legend = ({ showLegend, hideFunction }: LegendProps) => (
  <Offcanvas show={showLegend} onHide={hideFunction}>
    <Offcanvas.Header closeButton>
      <Offcanvas.Title>Legend</Offcanvas.Title>
    </Offcanvas.Header>
    <Offcanvas.Body>
      <Table>
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="text-center align-middle">✅</td>
            <td>Spoke to householder or Wrote Letter.</td>
          </tr>
          <tr>
            <td className="text-center align-middle">🚫</td>
            <td>Do not call or write letter.</td>
          </tr>
          <tr>
            <td className="text-center align-middle">📬</td>
            <td>Householder is not at home.</td>
          </tr>
          <tr>
            <td className="text-center align-middle">✖️</td>
            <td>Unit doesn't exist for some reason.</td>
          </tr>
          <tr>
            <td className="text-center align-middle">🗒️</td>
            <td>Optional information about the unit. No personal data.</td>
          </tr>
        </tbody>
      </Table>
    </Offcanvas.Body>
  </Offcanvas>
);

const TerritoryListing = ({
  showListing,
  hideFunction,
  selectedTerritory,
  handleSelect,
  territories
}: TerritoryListingProps) => (
  <Offcanvas
    placement={"bottom"}
    show={showListing}
    onHide={hideFunction}
    style={{ height: TERRITORY_SELECTOR_VIEWPORT_HEIGHT }}
  >
    <Offcanvas.Header closeButton>
      <Offcanvas.Title>Select Territory</Offcanvas.Title>
    </Offcanvas.Header>
    <Offcanvas.Body>
      <ListGroup onSelect={handleSelect}>
        {territories &&
          territories.map((element) => (
            <ListGroup.Item
              action
              key={`listgroup-item-${element.code}`}
              eventKey={`${element.code}`}
              active={selectedTerritory === element.code}
            >
              {element.code} - {element.name}
            </ListGroup.Item>
          ))}
      </ListGroup>
    </Offcanvas.Body>
  </Offcanvas>
);

const HOUSEHOLD_LANGUAGES = {
  ENGLISH: { CODE: "e", DISPLAY: "English" },
  CHINESE: { CODE: "c", DISPLAY: "Chinese" },
  BURMESE: { CODE: "b", DISPLAY: "Burmese" },
  TAMIL: { CODE: "t", DISPLAY: "Tamil" },
  MALAY: { CODE: "m", DISPLAY: "Malay" }
};

export {
  ZeroPad,
  ModalUnitTitle,
  assignmentMessage,
  getMaxUnitLength,
  getCompletedPercent,
  addHours,
  errorMessage,
  NavBarBranding,
  Legend,
  errorHandler,
  parseHHLanguages,
  processHHLanguages,
  TerritoryListing,
  pollingFunction,
  checkTraceLangStatus,
  checkTraceRaceStatus,
  processAddressData,
  ExpiryTimePopover,
  STATUS_CODES,
  MUTABLE_CODES,
  LOGIN_TYPE_CODES,
  DEFAULT_FLOOR_PADDING,
  DEFAULT_SELF_DESTRUCT_HOURS,
  DEFAULT_PERSONAL_SLIP_DESTRUCT_HOURS,
  HOUSEHOLD_TYPES,
  FIREBASE_AUTH_UNAUTHORISED_MSG,
  ADMIN_MODAL_TYPES,
  RELOAD_CHECK_INTERVAL_MS,
  RELOAD_INACTIVITY_DURATION,
  TERRITORY_VIEW_WINDOW_WELCOME_TEXT,
  NOT_HOME_STATUS_CODES,
  MIN_START_FLOOR,
  MAX_TOP_FLOOR,
  HOUSEHOLD_LANGUAGES
};
