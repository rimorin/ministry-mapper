import { Modal, Navbar, Offcanvas, Table } from "react-bootstrap";
import {
  TitleProps,
  BrandingProps,
  LegendProps,
  floorDetails
} from "./interface";

const compareSortObjects = (a: any, b: any) => {
  const a_floor = Number(a.floor);
  const b_floor = Number(b.floor);
  if (a_floor < b_floor) {
    return 1;
  }
  if (a_floor > b_floor) {
    return -1;
  }
  return 0;
};

const STATUS_CODES = {
  DEFAULT: "-1",
  DONE: "1",
  NOT_HOME: "2",
  STILL_NOT_HOME: "3",
  DO_NOT_CALL: "4",
  INVALID: "5"
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

const DEFAULT_FLOOR_PADDING = 2;
const DEFAULT_SELF_DESTRUCT_HOURS = 4;

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

const addHours = (numOfHours: number, date = new Date()) => {
  date.setTime(date.getTime() + numOfHours * 60 * 60 * 1000);
  return date.getTime();
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
            <td>
              Spoke to householder, Wrote Letter or Tried again after initial
              call.
            </td>
          </tr>
          <tr>
            <td className="text-center align-middle">🚫</td>
            <td>Do not call or write letter.</td>
          </tr>
          <tr>
            <td className="text-center align-middle">📬</td>
            <td>
              Householder was not home at the initial call. Try visiting again
              another day or write letter, whichever comes first.
            </td>
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

export {
  compareSortObjects,
  ZeroPad,
  ModalUnitTitle,
  assignmentMessage,
  getMaxUnitLength,
  addHours,
  NavBarBranding,
  Legend,
  STATUS_CODES,
  MUTABLE_CODES,
  LOGIN_TYPE_CODES,
  DEFAULT_FLOOR_PADDING,
  DEFAULT_SELF_DESTRUCT_HOURS
};
