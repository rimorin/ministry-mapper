import { memo } from "react";
import { Badge, Image } from "react-bootstrap";
import {
  DEFAULT_FLOOR_PADDING,
  STATUS_CODES,
  HOUSEHOLD_TYPES
} from "../utils/constants";
import { ZeroPad } from "../utils/helpers";
import {
  unitProps,
  nothomeProps,
  floorHeaderProp,
  tableHeaderProp
} from "../utils/interface";
import envelopeImage from "../assets/envelope.svg";

const TableHeader = memo(({ floors, maxUnitNumber = 2 }: tableHeaderProp) => {
  return (
    <>
      <thead className="sticky-top-cell">
        <tr>
          <th scope="col" className="text-center align-middle sticky-left-cell">
            lvl/unit
          </th>
          {floors &&
            floors[0].units.map((item, index) => (
              <th
                key={`${index}-${item.number}`}
                scope="col"
                className="text-center align-middle"
              >
                {ZeroPad(item.number, maxUnitNumber)}
              </th>
            ))}
        </tr>
      </thead>
    </>
  );
});

const FloorHeader = memo(({ index, floor }: floorHeaderProp) => (
  <th
    className="sticky-left-cell text-center align-middle"
    key={`${index}-${floor}`}
    scope="row"
  >
    {ZeroPad(floor, DEFAULT_FLOOR_PADDING)}
  </th>
));

const UnitStatus = memo((props: unitProps) => {
  const householdRace = props.type;
  const note = props.note;
  const currentStatus = props.status;
  const nhcount = props.nhcount;
  const languages = props.languages;
  const isTrackRace = props.trackRace || false;
  const isTrackLanguages = props.trackLanguages || false;
  let status = "";

  if (currentStatus === STATUS_CODES.INVALID) {
    return <>✖️</>;
  }
  if (currentStatus === STATUS_CODES.DONE) {
    status = "✅ ";
  }

  if (currentStatus === STATUS_CODES.DO_NOT_CALL) {
    status = "🚫 ";
  }

  return (
    <>
      {currentStatus !== STATUS_CODES.NOT_HOME && <>{status}</>}
      {currentStatus === STATUS_CODES.NOT_HOME && (
        <NotHomeIcon nhcount={nhcount} classProp={"me-1"} />
      )}
      {note && <>🗒️ </>}
      {isTrackRace && householdRace !== HOUSEHOLD_TYPES.CHINESE && (
        <Badge bg="secondary" className="me-1" pill>
          {householdRace}
        </Badge>
      )}
      {isTrackLanguages && languages && <span>{languages.toUpperCase()}</span>}
    </>
  );
});

const NotHomeIcon = memo(({ nhcount, classProp }: nothomeProps) => {
  let containerClass = "container-nothome";
  if (classProp) containerClass += ` ${classProp}`;
  return (
    <span className={containerClass}>
      <Image fluid src={envelopeImage} className="nothome-envelope" />
      {nhcount && <div className="badge-nothome">{nhcount}</div>}
    </span>
  );
});

export { TableHeader, FloorHeader, UnitStatus, NotHomeIcon };
