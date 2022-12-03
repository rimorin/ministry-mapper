import { render, screen } from "@testing-library/react";
import FrontPage from "./components/frontpage";
import MaintenanceMode from "./components/maintenance";
import NotFoundPage from "./components/notfoundpage";
import UnauthorizedPage from "./components/unauthorisedpage";
import InvalidPage from "./components/invalidpage";
import Welcome from "./components/welcome";
import {
  HOUSEHOLD_LANGUAGES,
  HOUSEHOLD_TYPES,
  Legend,
  NOT_HOME_STATUS_CODES,
  STATUS_CODES
} from "./components/util";
import Loader from "./components/loader";
import Login from "./components/login";
import {
  GenericTextAreaField,
  HHLangField,
  HHNotHomeField,
  HHStatusField,
  HHTypeField
} from "./components/form";
import UnitStatus from "./components/unit";
import { Provider } from "@rollbar/react";
import { LanguagePolicy, RacePolicy } from "./components/policies";

const mockRollbarConfig = {
  accessToken: "",
  captureUncaught: true,
  captureUnhandledRejections: true,
  payload: {
    client: {
      javascript: {
        code_version: "1.0.0",
        source_map_enabled: true
      }
    }
  }
};

// Mock provider for components that requires rollbar hooks
const rollbarRender = (ui: any) => {
  return render(<Provider config={mockRollbarConfig}>{ui}</Provider>);
};

test("renders frontpage", () => {
  render(<FrontPage />);
  expect(screen.getByRole("img")).toBeInTheDocument();
});

test("renders maintenance", () => {
  render(<MaintenanceMode />);
  expect(screen.getByRole("img")).toBeInTheDocument();
  expect(
    screen.getByText("Ministry Mapper is currently down for maintenance. 🚧")
  ).toBeInTheDocument();
  expect(
    screen.getByText(
      "We expect to be back online in a shortwhile. Thank you for your patience."
    )
  ).toBeInTheDocument();
});

test("renders not found page", () => {
  render(<NotFoundPage />);
  expect(screen.getByRole("img")).toBeInTheDocument();
  expect(screen.getByText("404 Page Not Found 🚫")).toBeInTheDocument();
  expect(
    screen.getByText("We are sorry, the page you requested could not be found.")
  ).toBeInTheDocument();
});

test("renders unauthorised page", () => {
  render(<UnauthorizedPage />);
  expect(screen.getByRole("img")).toBeInTheDocument();
  expect(screen.getByText("401 Unauthorized Access 🔐")).toBeInTheDocument();
  expect(
    screen.getByText(
      "We are sorry, you are not authorised to access this page."
    )
  ).toBeInTheDocument();
});

test("renders invalid page", () => {
  render(<InvalidPage />);
  expect(screen.getByRole("img")).toBeInTheDocument();
  expect(screen.getByText("This link has expired ⌛")).toBeInTheDocument();
});

test("renders admin welcome page", () => {
  render(<Welcome />);
  expect(screen.getByRole("img")).toBeInTheDocument();
  expect(
    screen.getByText(
      "Please select a territory from the above listing to begin."
    )
  ).toBeInTheDocument();
  expect(screen.getByText("Welcome To Ministry Mapper")).toBeInTheDocument();
});

test("renders loading indicator", () => {
  render(<Loader />);
  expect(screen.getByRole("status")).toBeInTheDocument();
});

test("renders login screen", () => {
  rollbarRender(<Login />);
  expect(screen.getByText("Login")).toBeInTheDocument();
  expect(screen.getByText("Clear")).toBeInTheDocument();
  expect(screen.getByText("Email Address")).toBeInTheDocument();
  expect(screen.getByText("Password")).toBeInTheDocument();
});

test("renders form householder status", () => {
  render(<HHStatusField changeValue={STATUS_CODES.DO_NOT_CALL} />);
  expect(screen.getByText("Done")).toBeInTheDocument();
  expect(screen.getByText("DNC")).toBeInTheDocument();
  expect(screen.getByText("Invalid")).toBeInTheDocument();
  expect(screen.getByText("Not Home")).toBeInTheDocument();
});

test("renders form householder type", () => {
  render(<HHTypeField changeValue={HOUSEHOLD_TYPES.CHINESE} />);
  expect(screen.getByText("Household")).toBeInTheDocument();
  expect(screen.getByText("Chinese")).toBeInTheDocument();
  expect(screen.getByText("Malay")).toBeInTheDocument();
  expect(screen.getByText("Indian")).toBeInTheDocument();
  expect(screen.getByText("Indonesian")).toBeInTheDocument();
  expect(screen.getByText("Burmese")).toBeInTheDocument();
  expect(screen.getByText("Filipino")).toBeInTheDocument();
  expect(screen.getByText("Thai")).toBeInTheDocument();
  expect(screen.getByText("Vietnamese")).toBeInTheDocument();
  expect(screen.getByText("Others")).toBeInTheDocument();
});

test("renders form householder not home count", () => {
  render(<HHNotHomeField changeValue={NOT_HOME_STATUS_CODES.DEFAULT} />);
  expect(screen.getByText("Number of tries")).toBeInTheDocument();
  expect(screen.getByText("1st")).toBeInTheDocument();
  expect(screen.getByText("2nd")).toBeInTheDocument();
  expect(screen.getByText("3rd")).toBeInTheDocument();
});

test("renders form householder languages", () => {
  render(<HHLangField changeValues={[]} />);
  expect(screen.getByText("Languages")).toBeInTheDocument();
  expect(screen.getByText("Chinese")).toBeInTheDocument();
  expect(screen.getByText("Malay")).toBeInTheDocument();
  expect(screen.getByText("Tamil")).toBeInTheDocument();
  expect(screen.getByText("Burmese")).toBeInTheDocument();
  expect(screen.getByText("English")).toBeInTheDocument();
});

test("renders form householder note", () => {
  const testNotes = "I am testing notes";
  render(
    <GenericTextAreaField
      label="Notes"
      name="notes"
      placeholder="Optional non-personal information. Eg, Renovation, Foreclosed, Friends, etc."
      changeValue={testNotes}
    />
  );
  expect(screen.getByText("Notes")).toBeInTheDocument();
  expect(screen.getByText(testNotes)).toBeInTheDocument();
});

test("renders form feedback", () => {
  const testFB = "I am testing feedback";
  render(<GenericTextAreaField name="feedback" changeValue={testFB} />);
  expect(screen.getByText(testFB)).toBeInTheDocument();
});

test("renders note status", () => {
  const testNote = "I am testing notes";
  render(
    <UnitStatus
      type={HOUSEHOLD_TYPES.CHINESE}
      note={testNote}
      status={STATUS_CODES.DEFAULT}
    />
  );
  expect(screen.getByText("🗒️")).toBeInTheDocument();
});

test("renders not home status", () => {
  render(
    <UnitStatus
      type={HOUSEHOLD_TYPES.CHINESE}
      note={""}
      nhcount={NOT_HOME_STATUS_CODES.DEFAULT}
      status={STATUS_CODES.NOT_HOME}
    />
  );
  expect(screen.getByText("1")).toBeInTheDocument();
});

test("renders done status", () => {
  render(
    <UnitStatus
      type={HOUSEHOLD_TYPES.CHINESE}
      note={""}
      status={STATUS_CODES.DONE}
    />
  );
  expect(screen.getByText("✅")).toBeInTheDocument();
});

test("renders dnc status", () => {
  render(
    <UnitStatus
      type={HOUSEHOLD_TYPES.CHINESE}
      note={""}
      status={STATUS_CODES.DO_NOT_CALL}
    />
  );
  expect(screen.getByText("🚫")).toBeInTheDocument();
});

test("renders invalid status", () => {
  render(
    <UnitStatus
      type={HOUSEHOLD_TYPES.CHINESE}
      note={""}
      status={STATUS_CODES.INVALID}
    />
  );
  expect(screen.getByText("✖️")).toBeInTheDocument();
});

test("renders done status with notes", () => {
  const testNote = "I am testing notes";
  render(
    <UnitStatus
      type={HOUSEHOLD_TYPES.CHINESE}
      note={testNote}
      status={STATUS_CODES.DONE}
    />
  );
  expect(screen.getByText("🗒️", { exact: false })).toBeInTheDocument();
  expect(screen.getByText("✅", { exact: false })).toBeInTheDocument();
});

test("renders 2nd try not home status", () => {
  render(
    <UnitStatus
      type={HOUSEHOLD_TYPES.CHINESE}
      note=""
      nhcount={NOT_HOME_STATUS_CODES.SECOND_TRY}
      status={STATUS_CODES.NOT_HOME}
    />
  );
  expect(screen.getByText("2", { exact: false })).toBeInTheDocument();
  expect(
    screen.getByText(NOT_HOME_STATUS_CODES.SECOND_TRY, { exact: false })
  ).toBeInTheDocument();
});

test("renders 3rd try not home status", () => {
  render(
    <UnitStatus
      type={HOUSEHOLD_TYPES.CHINESE}
      note=""
      nhcount={NOT_HOME_STATUS_CODES.THIRD_TRY}
      status={STATUS_CODES.NOT_HOME}
    />
  );
  expect(screen.getByText("3", { exact: false })).toBeInTheDocument();
  expect(
    screen.getByText(NOT_HOME_STATUS_CODES.THIRD_TRY, { exact: false })
  ).toBeInTheDocument();
});

test("renders malay household", () => {
  render(
    <UnitStatus
      type={HOUSEHOLD_TYPES.MALAY}
      note=""
      status={STATUS_CODES.DEFAULT}
      trackRace={true}
    />
  );
  expect(screen.getByText(HOUSEHOLD_TYPES.MALAY)).toBeInTheDocument();
});

test("renders indian household", () => {
  render(
    <UnitStatus
      type={HOUSEHOLD_TYPES.INDIAN}
      note=""
      status={STATUS_CODES.DEFAULT}
      trackRace={true}
    />
  );
  expect(screen.getByText(HOUSEHOLD_TYPES.INDIAN)).toBeInTheDocument();
});

test("renders burmese household", () => {
  render(
    <UnitStatus
      type={HOUSEHOLD_TYPES.BURMESE}
      note=""
      status={STATUS_CODES.DEFAULT}
      trackRace={true}
    />
  );
  expect(screen.getByText(HOUSEHOLD_TYPES.BURMESE)).toBeInTheDocument();
});

test("renders filipino household", () => {
  render(
    <UnitStatus
      type={HOUSEHOLD_TYPES.FILIPINO}
      note=""
      status={STATUS_CODES.DEFAULT}
      trackRace={true}
    />
  );
  expect(screen.getByText(HOUSEHOLD_TYPES.FILIPINO)).toBeInTheDocument();
});

test("renders indonesian household", () => {
  render(
    <UnitStatus
      type={HOUSEHOLD_TYPES.INDONESIAN}
      note=""
      status={STATUS_CODES.DEFAULT}
      trackRace={true}
    />
  );
  expect(screen.getByText(HOUSEHOLD_TYPES.INDONESIAN)).toBeInTheDocument();
});

test("renders thai household", () => {
  render(
    <UnitStatus
      type={HOUSEHOLD_TYPES.THAI}
      note=""
      status={STATUS_CODES.DEFAULT}
      trackRace={true}
    />
  );
  expect(screen.getByText(HOUSEHOLD_TYPES.THAI)).toBeInTheDocument();
});

test("renders vietnamese household", () => {
  render(
    <UnitStatus
      type={HOUSEHOLD_TYPES.VIETNAMESE}
      note=""
      status={STATUS_CODES.DEFAULT}
      trackRace={true}
    />
  );
  expect(screen.getByText(HOUSEHOLD_TYPES.VIETNAMESE)).toBeInTheDocument();
});

test("renders languages household", () => {
  const langs = [
    HOUSEHOLD_LANGUAGES.CHINESE,
    HOUSEHOLD_LANGUAGES.ENGLISH,
    HOUSEHOLD_LANGUAGES.BURMESE,
    HOUSEHOLD_LANGUAGES.TAMIL,
    HOUSEHOLD_LANGUAGES.MALAY
  ].join();
  render(
    <UnitStatus
      type={HOUSEHOLD_TYPES.CHINESE}
      note=""
      status={STATUS_CODES.DEFAULT}
      trackLanguages={true}
      languages={langs}
    />
  );
  expect(screen.getByText(langs.toUpperCase())).toBeInTheDocument();
});

test("renders languages household with done status and notes", () => {
  const langs = [
    HOUSEHOLD_LANGUAGES.CHINESE,
    HOUSEHOLD_LANGUAGES.ENGLISH,
    HOUSEHOLD_LANGUAGES.BURMESE,
    HOUSEHOLD_LANGUAGES.TAMIL,
    HOUSEHOLD_LANGUAGES.MALAY
  ].join();
  render(
    <UnitStatus
      type={HOUSEHOLD_TYPES.CHINESE}
      note="test"
      status={STATUS_CODES.DONE}
      trackLanguages={true}
      languages={langs}
    />
  );
  expect(screen.getByText(langs.toUpperCase())).toBeInTheDocument();
  expect(screen.getByText("🗒️", { exact: false })).toBeInTheDocument();
  expect(screen.getByText("✅", { exact: false })).toBeInTheDocument();
});

test("renders slip legend", () => {
  render(<Legend showLegend={true} />);
  expect(screen.getByText("Legend")).toBeInTheDocument();
  expect(screen.getByText("✅")).toBeInTheDocument();
  expect(screen.getByText("🚫")).toBeInTheDocument();
  expect(screen.getByText("🗒️")).toBeInTheDocument();
  expect(screen.getByText("✖️")).toBeInTheDocument();
  const svgImg = screen.getByRole("img");
  expect(svgImg).toBeInTheDocument();
  expect(svgImg).toHaveClass("nothome-envelope img-fluid");
});

test("language policy countable empty", () => {
  const policy = new LanguagePolicy();
  const unit = {
    number: "",
    note: "",
    type: "",
    status: STATUS_CODES.DEFAULT,
    nhcount: "",
    languages: "",
    dnctime: 0
  };
  expect(policy.isCountable(unit)).toBe(true);
});

test("language policy countable e", () => {
  const policy = new LanguagePolicy();
  const unit = {
    number: "",
    note: "",
    type: "",
    status: STATUS_CODES.DEFAULT,
    nhcount: "",
    languages: HOUSEHOLD_LANGUAGES.ENGLISH.CODE,
    dnctime: 0
  };
  expect(policy.isCountable(unit)).toBe(true);
});

test("language policy countable c", () => {
  const policy = new LanguagePolicy();
  const unit = {
    number: "",
    note: "",
    type: "",
    status: STATUS_CODES.DEFAULT,
    nhcount: "",
    languages: HOUSEHOLD_LANGUAGES.CHINESE.CODE,
    dnctime: 0
  };
  expect(policy.isCountable(unit)).toBe(false);
});

test("language policy countable e done", () => {
  const policy = new LanguagePolicy();
  const unit = {
    number: "",
    note: "",
    type: "",
    status: STATUS_CODES.DONE,
    nhcount: "",
    languages: HOUSEHOLD_LANGUAGES.ENGLISH.CODE,
    dnctime: 0
  };
  expect(policy.isCountable(unit)).toBe(true);
});

test("language policy countable e not home", () => {
  const policy = new LanguagePolicy();
  const unit = {
    number: "",
    note: "",
    type: "",
    status: STATUS_CODES.NOT_HOME,
    nhcount: "",
    languages: HOUSEHOLD_LANGUAGES.ENGLISH.CODE,
    dnctime: 0
  };
  expect(policy.isCountable(unit)).toBe(true);
});

test("language policy countable e dnc", () => {
  const policy = new LanguagePolicy();
  const unit = {
    number: "",
    note: "",
    type: "",
    status: STATUS_CODES.DO_NOT_CALL,
    nhcount: "",
    languages: HOUSEHOLD_LANGUAGES.ENGLISH.CODE,
    dnctime: 0
  };
  expect(policy.isCountable(unit)).toBe(false);
});

test("language policy countable e invalid", () => {
  const policy = new LanguagePolicy();
  const unit = {
    number: "",
    note: "",
    type: "",
    status: STATUS_CODES.INVALID,
    nhcount: "",
    languages: HOUSEHOLD_LANGUAGES.ENGLISH.CODE,
    dnctime: 0
  };
  expect(policy.isCountable(unit)).toBe(false);
});

test("language policy completed empty", () => {
  const policy = new LanguagePolicy();
  const unit = {
    number: "",
    note: "",
    type: "",
    status: STATUS_CODES.DEFAULT,
    nhcount: "",
    languages: "",
    dnctime: 0
  };
  expect(policy.isCompleted(unit)).toBe(false);
});

test("language policy completed done", () => {
  const policy = new LanguagePolicy();
  const unit = {
    number: "",
    note: "",
    type: "",
    status: STATUS_CODES.DONE,
    nhcount: "",
    languages: "",
    dnctime: 0
  };
  expect(policy.isCompleted(unit)).toBe(true);
});

test("language policy completed not home 1", () => {
  const policy = new LanguagePolicy();
  const unit = {
    number: "",
    note: "",
    type: "",
    status: STATUS_CODES.NOT_HOME,
    nhcount: NOT_HOME_STATUS_CODES.DEFAULT,
    languages: "",
    dnctime: 0
  };
  expect(policy.isCompleted(unit)).toBe(false);
});

test("language policy completed not home 2", () => {
  const policy = new LanguagePolicy();
  const unit = {
    number: "",
    note: "",
    type: "",
    status: STATUS_CODES.NOT_HOME,
    nhcount: NOT_HOME_STATUS_CODES.SECOND_TRY,
    languages: "",
    dnctime: 0
  };
  expect(policy.isCompleted(unit)).toBe(true);
});

test("language policy completed not home 3", () => {
  const policy = new LanguagePolicy();
  const unit = {
    number: "",
    note: "",
    type: "",
    status: STATUS_CODES.NOT_HOME,
    nhcount: NOT_HOME_STATUS_CODES.THIRD_TRY,
    languages: "",
    dnctime: 0
  };
  expect(policy.isCompleted(unit)).toBe(true);
});

test("language policy completed empty e", () => {
  const policy = new LanguagePolicy();
  const unit = {
    number: "",
    note: "",
    type: "",
    status: STATUS_CODES.DEFAULT,
    nhcount: "",
    languages: HOUSEHOLD_LANGUAGES.ENGLISH.CODE,
    dnctime: 0
  };
  expect(policy.isCompleted(unit)).toBe(false);
});

test("language policy completed done e", () => {
  const policy = new LanguagePolicy();
  const unit = {
    number: "",
    note: "",
    type: "",
    status: STATUS_CODES.DONE,
    nhcount: "",
    languages: HOUSEHOLD_LANGUAGES.ENGLISH.CODE,
    dnctime: 0
  };
  expect(policy.isCompleted(unit)).toBe(true);
});

test("language policy completed e not home 1", () => {
  const policy = new LanguagePolicy();
  const unit = {
    number: "",
    note: "",
    type: "",
    status: STATUS_CODES.NOT_HOME,
    nhcount: NOT_HOME_STATUS_CODES.DEFAULT,
    languages: HOUSEHOLD_LANGUAGES.ENGLISH.CODE,
    dnctime: 0
  };
  expect(policy.isCompleted(unit)).toBe(false);
});

test("language policy completed e not home 2", () => {
  const policy = new LanguagePolicy();
  const unit = {
    number: "",
    note: "",
    type: "",
    status: STATUS_CODES.NOT_HOME,
    nhcount: NOT_HOME_STATUS_CODES.SECOND_TRY,
    languages: HOUSEHOLD_LANGUAGES.ENGLISH.CODE,
    dnctime: 0
  };
  expect(policy.isCompleted(unit)).toBe(true);
});

test("language policy completed e not home 3", () => {
  const policy = new LanguagePolicy();
  const unit = {
    number: "",
    note: "",
    type: "",
    status: STATUS_CODES.NOT_HOME,
    nhcount: NOT_HOME_STATUS_CODES.THIRD_TRY,
    languages: HOUSEHOLD_LANGUAGES.ENGLISH.CODE,
    dnctime: 0
  };
  expect(policy.isCompleted(unit)).toBe(true);
});

test("language policy completed empty c", () => {
  const policy = new LanguagePolicy();
  const unit = {
    number: "",
    note: "",
    type: "",
    status: STATUS_CODES.DEFAULT,
    nhcount: "",
    languages: HOUSEHOLD_LANGUAGES.CHINESE.CODE,
    dnctime: 0
  };
  expect(policy.isCompleted(unit)).toBe(false);
});

test("language policy completed done c", () => {
  const policy = new LanguagePolicy();
  const unit = {
    number: "",
    note: "",
    type: "",
    status: STATUS_CODES.DONE,
    nhcount: "",
    languages: HOUSEHOLD_LANGUAGES.CHINESE.CODE,
    dnctime: 0
  };
  expect(policy.isCompleted(unit)).toBe(false);
});

test("language policy completed c not home 1", () => {
  const policy = new LanguagePolicy();
  const unit = {
    number: "",
    note: "",
    type: "",
    status: STATUS_CODES.NOT_HOME,
    nhcount: NOT_HOME_STATUS_CODES.DEFAULT,
    languages: HOUSEHOLD_LANGUAGES.CHINESE.CODE,
    dnctime: 0
  };
  expect(policy.isCompleted(unit)).toBe(false);
});

test("language policy completed c not home 2", () => {
  const policy = new LanguagePolicy();
  const unit = {
    number: "",
    note: "",
    type: "",
    status: STATUS_CODES.NOT_HOME,
    nhcount: NOT_HOME_STATUS_CODES.SECOND_TRY,
    languages: HOUSEHOLD_LANGUAGES.CHINESE.CODE,
    dnctime: 0
  };
  expect(policy.isCompleted(unit)).toBe(false);
});

test("language policy completed c not home 3", () => {
  const policy = new LanguagePolicy();
  const unit = {
    number: "",
    note: "",
    type: "",
    status: STATUS_CODES.NOT_HOME,
    nhcount: NOT_HOME_STATUS_CODES.THIRD_TRY,
    languages: HOUSEHOLD_LANGUAGES.CHINESE.CODE,
    dnctime: 0
  };
  expect(policy.isCompleted(unit)).toBe(false);
});

test("race policy empty", () => {
  const policy = new RacePolicy();
  const unit = {
    number: "",
    note: "",
    type: HOUSEHOLD_TYPES.CHINESE,
    status: STATUS_CODES.DEFAULT,
    nhcount: NOT_HOME_STATUS_CODES.DEFAULT,
    languages: "",
    dnctime: 0
  };
  expect(policy.isCountable(unit)).toBe(true);
});

test("race policy c done", () => {
  const policy = new RacePolicy();
  const unit = {
    number: "",
    note: "",
    type: HOUSEHOLD_TYPES.CHINESE,
    status: STATUS_CODES.DONE,
    nhcount: NOT_HOME_STATUS_CODES.DEFAULT,
    languages: "",
    dnctime: 0
  };
  expect(policy.isCountable(unit)).toBe(true);
});

test("race policy c not home", () => {
  const policy = new RacePolicy();
  const unit = {
    number: "",
    note: "",
    type: HOUSEHOLD_TYPES.CHINESE,
    status: STATUS_CODES.NOT_HOME,
    nhcount: NOT_HOME_STATUS_CODES.DEFAULT,
    languages: "",
    dnctime: 0
  };
  expect(policy.isCountable(unit)).toBe(true);
});

test("race policy c dnc", () => {
  const policy = new RacePolicy();
  const unit = {
    number: "",
    note: "",
    type: HOUSEHOLD_TYPES.CHINESE,
    status: STATUS_CODES.DO_NOT_CALL,
    nhcount: NOT_HOME_STATUS_CODES.DEFAULT,
    languages: "",
    dnctime: 0
  };
  expect(policy.isCountable(unit)).toBe(false);
});

test("race policy c invalid", () => {
  const policy = new RacePolicy();
  const unit = {
    number: "",
    note: "",
    type: HOUSEHOLD_TYPES.CHINESE,
    status: STATUS_CODES.INVALID,
    nhcount: NOT_HOME_STATUS_CODES.DEFAULT,
    languages: "",
    dnctime: 0
  };
  expect(policy.isCountable(unit)).toBe(false);
});

test("race policy m empty", () => {
  const policy = new RacePolicy();
  const unit = {
    number: "",
    note: "",
    type: HOUSEHOLD_TYPES.MALAY,
    status: STATUS_CODES.DEFAULT,
    nhcount: NOT_HOME_STATUS_CODES.DEFAULT,
    languages: "",
    dnctime: 0
  };
  expect(policy.isCountable(unit)).toBe(false);
});

test("race policy m done", () => {
  const policy = new RacePolicy();
  const unit = {
    number: "",
    note: "",
    type: HOUSEHOLD_TYPES.MALAY,
    status: STATUS_CODES.DONE,
    nhcount: NOT_HOME_STATUS_CODES.DEFAULT,
    languages: "",
    dnctime: 0
  };
  expect(policy.isCountable(unit)).toBe(false);
});

test("race policy m not home", () => {
  const policy = new RacePolicy();
  const unit = {
    number: "",
    note: "",
    type: HOUSEHOLD_TYPES.MALAY,
    status: STATUS_CODES.NOT_HOME,
    nhcount: NOT_HOME_STATUS_CODES.DEFAULT,
    languages: "",
    dnctime: 0
  };
  expect(policy.isCountable(unit)).toBe(false);
});

test("race policy m dnc", () => {
  const policy = new RacePolicy();
  const unit = {
    number: "",
    note: "",
    type: HOUSEHOLD_TYPES.MALAY,
    status: STATUS_CODES.DO_NOT_CALL,
    nhcount: NOT_HOME_STATUS_CODES.DEFAULT,
    languages: "",
    dnctime: 0
  };
  expect(policy.isCountable(unit)).toBe(false);
});

test("race policy m invalid", () => {
  const policy = new RacePolicy();
  const unit = {
    number: "",
    note: "",
    type: HOUSEHOLD_TYPES.MALAY,
    status: STATUS_CODES.INVALID,
    nhcount: NOT_HOME_STATUS_CODES.DEFAULT,
    languages: "",
    dnctime: 0
  };
  expect(policy.isCountable(unit)).toBe(false);
});
