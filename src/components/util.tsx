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
  </>
);

export { compareSortObjects, HHType, STATUS_CODES, MUTABLE_CODES };
