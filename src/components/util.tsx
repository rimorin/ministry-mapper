import { Modal, ToggleButton } from "react-bootstrap";

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

const HHType = () => (
  <>
    <option value="cn">Chinese</option>
    <option value="tm">Tamil</option>
    <option value="in">Indonesian</option>
    <option value="bm">Burmese</option>
    <option value="ml">Muslim</option>
    <option value="sl">Sign Language</option>
    <option value="ot">Others</option>
  </>
);

interface TitleProp {
  floor: String;
  unit: String;
  postal?: String;
}

const ModalUnitTitle = ({ unit, floor, postal }: TitleProp) => {
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

export {
  compareSortObjects,
  HHType,
  ZeroPad,
  ModalUnitTitle,
  assignmentMessage,
  STATUS_CODES,
  MUTABLE_CODES
};