import { Modal, Navbar } from "react-bootstrap";
import { TitleProps, BrandingProps } from "./interface";

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

const ModalUnitTitle = ({ unit, floor, postal }: TitleProps) => {
  let titleString = `# ${ZeroPad(floor, 2)} - ${unit}`;

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

export {
  compareSortObjects,
  ZeroPad,
  ModalUnitTitle,
  assignmentMessage,
  NavBarBranding,
  STATUS_CODES,
  MUTABLE_CODES,
  LOGIN_TYPE_CODES
};
