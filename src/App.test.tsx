import { render, screen } from "@testing-library/react";
// import Login from "./pages/login";
import GenericTextAreaField from "./components/form/textarea";
import HHNotHomeField from "./components/form/nothome";
import HHStatusField from "./components/form/status";
// import { Provider } from "@rollbar/react";
import Legend from "./components/navigation/legend";
import UnauthorizedPage from "./components/statics/unauth";
// import FrontLogo from "./components/statics/logo";
import MaintenanceMode from "./components/statics/maintenance";
import NotFoundPage from "./components/statics/notfound";
import InvalidPage from "./components/statics/invalidpage";
import Welcome from "./components/statics/welcome";
import Loader from "./components/statics/loader";
import { STATUS_CODES, NOT_HOME_STATUS_CODES } from "./utils/constants";

// const mockRollbarConfig = {
//   accessToken: "",
//   captureUncaught: true,
//   captureUnhandledRejections: true,
//   payload: {
//     client: {
//       javascript: {
//         code_version: "1.0.0",
//         source_map_enabled: true
//       }
//     }
//   }
// };

// Mock provider for components that requires rollbar hooks
// const rollbarRender = (ui: JSX.Element) => {
//   return render(<Provider config={mockRollbarConfig}>{ui}</Provider>);
// };

// test("renders frontpage", () => {
//   render(<FrontLogo />);
//   expect(screen.getByRole("img")).toBeInTheDocument();
// });

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
  const unauthName = "test";
  render(<UnauthorizedPage name={unauthName} />);
  expect(screen.getByRole("img")).toBeInTheDocument();
  expect(screen.getByText("401 Unauthorized Access 🔐")).toBeInTheDocument();
  expect(
    screen.getByText(
      `We are sorry ${unauthName}! You are not authorised to access this system.`
    )
  ).toBeInTheDocument();
});

test("renders invalid page", () => {
  render(<InvalidPage />);
  expect(screen.getByRole("img")).toBeInTheDocument();
  expect(screen.getByText("This link has expired ⌛")).toBeInTheDocument();
});

test("renders admin welcome page", () => {
  render(<Welcome name="" />);
  expect(screen.getByRole("img")).toBeInTheDocument();
  expect(
    screen.getByText("Please select a territory from the above listing.")
  ).toBeInTheDocument();
  expect(screen.getByText("Welcome To Ministry Mapper")).toBeInTheDocument();
});

test("renders admin welcome page with name", () => {
  const name = "JE";
  render(<Welcome name={name} />);
  expect(screen.getByRole("img")).toBeInTheDocument();
  expect(
    screen.getByText("Please select a territory from the above listing.")
  ).toBeInTheDocument();
  expect(screen.getByText(`Welcome ${name}`)).toBeInTheDocument();
});

test("renders loading indicator", () => {
  render(<Loader />);
  expect(screen.getByRole("status")).toBeInTheDocument();
});

// test("renders login screen", () => {
//   rollbarRender(<Login />);
//   expect(screen.getAllByText("Login")[0]).toBeInTheDocument();
//   expect(screen.getAllByText("Login")[1]).toBeInTheDocument();
//   expect(screen.getByText("Clear")).toBeInTheDocument();
//   expect(screen.getByText("Email Address")).toBeInTheDocument();
//   expect(screen.getByText("Password")).toBeInTheDocument();
// });

test("renders form householder status", () => {
  render(<HHStatusField changeValue={STATUS_CODES.DO_NOT_CALL} />);
  expect(screen.getByText("Done")).toBeInTheDocument();
  expect(screen.getByText("DNC")).toBeInTheDocument();
  expect(screen.getByText("Invalid")).toBeInTheDocument();
  expect(screen.getByText("Not Home")).toBeInTheDocument();
});

test("renders form householder not home count", () => {
  render(<HHNotHomeField changeValue={NOT_HOME_STATUS_CODES.DEFAULT} />);
  expect(screen.getByText("Number of tries")).toBeInTheDocument();
  expect(screen.getByText("1st")).toBeInTheDocument();
  expect(screen.getByText("2nd")).toBeInTheDocument();
  expect(screen.getByText("3rd")).toBeInTheDocument();
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
