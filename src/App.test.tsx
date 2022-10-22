import React from "react";
import { render, screen } from "@testing-library/react";
import FrontPage from "./components/frontpage";
import MaintenanceMode from "./components/maintenance";
import NotFoundPage from "./components/notfoundpage";
import UnauthorizedPage from "./components/unauthorisedpage";
import InvalidPage from "./components/invalidpage";
import Welcome from "./components/welcome";
import {
  HOUSEHOLD_TYPES,
  LOGIN_TYPE_CODES,
  STATUS_CODES
} from "./components/util";
import Loader from "./components/loader";
import Login from "./components/login";
import {
  GenericTextAreaField,
  HHLangField,
  HHStatusField,
  HHTypeField
} from "./components/form";
import UnitStatus from "./components/unit";

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
  render(<Welcome loginType={LOGIN_TYPE_CODES.ADMIN} />);
  expect(screen.getByRole("img")).toBeInTheDocument();
  expect(
    screen.getByText(
      "Please select a territory from the above listing to begin administration."
    )
  ).toBeInTheDocument();
  expect(screen.getByText("Welcome To Ministry Mapper")).toBeInTheDocument();
});

test("renders conductor welcome page", () => {
  render(<Welcome />);
  expect(screen.getByRole("img")).toBeInTheDocument();
  expect(
    screen.getByText(
      "Please select a territory from the above listing to begin assigning slips to the publishers."
    )
  ).toBeInTheDocument();
  expect(screen.getByText("Welcome To Ministry Mapper")).toBeInTheDocument();
});

test("renders loading indicator", () => {
  render(<Loader />);
  expect(screen.getByRole("status")).toBeInTheDocument();
});

test("renders admin login screen", () => {
  const headerText = "Admin";
  render(<Login loginType={headerText} />);
  expect(screen.getByText(`${headerText} Login`)).toBeInTheDocument();
  expect(screen.getByText("Login")).toBeInTheDocument();
  expect(screen.getByText("Clear")).toBeInTheDocument();
  expect(screen.getByText("Email Address")).toBeInTheDocument();
  expect(screen.getByText("Password")).toBeInTheDocument();
});

test("renders conductor login screen", () => {
  const headerText = "Conductor";
  render(<Login loginType={headerText} />);
  expect(screen.getByText(`${headerText} Login`)).toBeInTheDocument();
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
      status={STATUS_CODES.NOT_HOME}
    />
  );
  expect(screen.getByText("📬")).toBeInTheDocument();
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
