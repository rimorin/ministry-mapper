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
  ref
} from "firebase/database";
import {
  ListGroup,
  Modal,
  Navbar,
  Offcanvas,
  Popover,
  Table,
  Image,
  ProgressBar
} from "react-bootstrap";
import Rollbar from "rollbar";
import { database } from "../firebase";
import {
  Policy,
  TitleProps,
  BrandingProps,
  LegendProps,
  floorDetails,
  TerritoryListingProps,
  unitDetails,
  nothomeprops,
  AuthorizerProp
} from "./interface";
import { LinkSession, LinkCounts } from "./policies";
import Countdown from "react-countdown";
import envelopeImage from "../assets/envelope.svg";

const errorHandler = (error: any, rollbar: Rollbar, showAlert = true) => {
  rollbar.error(error);
  if (showAlert) {
    alert(error);
  }
};

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
  CREATE_ADDRESS: 4,
  CREATE_TERRITORY: 5,
  ADD_UNIT: 6,
  RENAME_ADDRESS_NAME: 7,
  UPDATE_UNIT: 8,
  PROFILE: 9
};

const LINK_TYPES = {
  VIEW: 0,
  ASSIGNMENT: 1,
  PERSONAL: 2
};

const DEFAULT_FLOOR_PADDING = 2;
// 24 hours
const DEFAULT_SELF_DESTRUCT_HOURS = 24;
// 4 Weeks for personal slips
const FOUR_WKS_PERSONAL_SLIP_DESTRUCT_HOURS = 24 * 7 * 4;
// One wk
const ONE_WK_PERSONAL_SLIP_DESTRUCT_HOURS = 24 * 7;
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

const UNSUPPORTED_BROWSER_MSG = "Browser doesn't support this feature.";

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

const getCompletedPercent = (policy: Policy, floors: floorDetails[]) => {
  let totalUnits = 0;
  let completedUnits = 0;

  floors.forEach((element) => {
    element.units.forEach((uElement) => {
      const isCountable = policy.isCountable(uElement);

      if (isCountable) totalUnits++;
      if (policy.isCompleted(uElement)) {
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

const ComponentAuthorizer = ({
  requiredPermission,
  userPermission,
  children
}: AuthorizerProp) => {
  if (!userPermission) return <></>;
  const isUnAuthorized = userPermission < requiredPermission;
  if (isUnAuthorized) {
    return <></>;
  }
  return children;
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
        dnctime: unitValues.dnctime || null,
        sequence: unitValues.sequence
      });
    });
    dataList.unshift({ floor: floor, units: unitsDetails });
  }
  return dataList;
};

const processLinkCounts = async (postal: String) => {
  const postalCode = postal as string;
  // need to add to rules for links: ".indexOn": "postalCode",
  const linksSnapshot = await pollingFunction(() =>
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
  var counts = new LinkCounts();
  linksSnapshot.forEach((rec: any) => {
    var link = rec.val() as LinkSession;
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
  var delta = 0;
  if (deltaSnapshot.exists()) {
    delta = deltaSnapshot.val() + 1;
  }
  update(ref(database, `/${postalcode}`), {
    delta: delta
  });
};

const NavBarBranding = ({ naming }: BrandingProps) => {
  return (
    <Navbar.Brand className="brand-wrap">
      <img
        alt=""
        src={`${process.env.PUBLIC_URL}/favicon-32x32.png`}
        width="32"
        height="32"
        className="d-inline-block align-top"
      />{" "}
      <Navbar.Text className="fluid-branding">{naming}</Navbar.Text>
    </Navbar.Brand>
  );
};

const EnvironmentIndicator = () => {
  if (process.env.REACT_APP_ROLLBAR_ENVIRONMENT === "production") return <></>;
  return (
    <ProgressBar
      now={100}
      animated
      style={{
        borderRadius: 0,
        position: "sticky",
        top: 0,
        fontWeight: "bold",
        zIndex: 1000
      }}
      label={`${process.env.REACT_APP_ROLLBAR_ENVIRONMENT} environment`}
    />
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
            <td className="text-center align-middle">
              <NotHomeIcon />
            </td>
            <td>
              Householder is not at home. Option to write a letter after a few
              tries.
            </td>
          </tr>
          <tr>
            <td className="text-center align-middle">✖️</td>
            <td>Unit doesn't exist for some reason.</td>
          </tr>
          <tr>
            <td className="text-center align-middle">🗒️</td>
            <td>Optional information about the unit. Avoid personal data.</td>
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
  TAGALOG: { CODE: "tg", DISPLAY: "Tagalog" },
  INDONESIAN: { CODE: "id", DISPLAY: "Indonesian" },
  MALAY: { CODE: "m", DISPLAY: "Malay" }
};

const UA_DEVICE_MAKES = {
  HUAWEI: "Huawei"
};

const NotHomeIcon = ({ nhcount, classProp }: nothomeprops) => {
  let containerClass = "container-nothome";
  if (classProp) containerClass += ` ${classProp}`;
  return (
    <span className={containerClass}>
      <Image fluid src={envelopeImage} className="nothome-envelope" />
      {nhcount && <div className="badge-nothome">{nhcount}</div>}
    </span>
  );
};

const getLanguageDisplayByCode = (code: string): string => {
  let display: string = "";
  if (code !== undefined) {
    const keys = Object.keys(HOUSEHOLD_LANGUAGES);
    keys.every((key) => {
      let language = Reflect.get(HOUSEHOLD_LANGUAGES, key);
      if (language.CODE.toLowerCase() === code.toLowerCase()) {
        display = language.DISPLAY;
        return false;
      }
      return true;
    });
  }
  return display;
};

export {
  getLanguageDisplayByCode,
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
  processLinkCounts,
  triggerPostalCodeListeners,
  processAddressData,
  ExpiryTimePopover,
  NotHomeIcon,
  UA_DEVICE_MAKES,
  UNSUPPORTED_BROWSER_MSG,
  STATUS_CODES,
  MUTABLE_CODES,
  DEFAULT_FLOOR_PADDING,
  DEFAULT_SELF_DESTRUCT_HOURS,
  FOUR_WKS_PERSONAL_SLIP_DESTRUCT_HOURS,
  ONE_WK_PERSONAL_SLIP_DESTRUCT_HOURS,
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
  ComponentAuthorizer,
  EnvironmentIndicator
};
