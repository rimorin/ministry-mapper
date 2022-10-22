import { Badge } from "react-bootstrap";
import { unitProps } from "./interface";
import { HOUSEHOLD_TYPES, STATUS_CODES } from "./util";

const UnitStatus = (props: unitProps) => {
  const householdRace = props.type;
  const note = props.note;
  const currentStatus = props.status;
  const nhcount = props.nhcount;
  const languages = props.languages;
  const isTrackRace = props.trackRace || false;
  const isTrackLanguages = props.trackLanguages || false;
  let status = "";

  if (currentStatus === STATUS_CODES.INVALID) {
    return <div>✖️</div>;
  }
  if (currentStatus === STATUS_CODES.DONE) {
    status = "✅ ";
  }

  if (currentStatus === STATUS_CODES.DO_NOT_CALL) {
    status = "🚫 ";
  }

  if (
    currentStatus === STATUS_CODES.STILL_NOT_HOME ||
    currentStatus === STATUS_CODES.NOT_HOME
  ) {
    status = "📬";
  }

  return (
    <>
      {currentStatus !== STATUS_CODES.NOT_HOME && <>{status}</>}
      {currentStatus === STATUS_CODES.NOT_HOME && (
        <Badge bg="secondary" text="light" className="me-1">
          {status} {nhcount}
        </Badge>
      )}
      {note && <>🗒️ </>}
      {isTrackRace && householdRace !== HOUSEHOLD_TYPES.CHINESE && (
        <Badge bg="secondary" className="me-1" pill>
          {householdRace}
        </Badge>
      )}
      {isTrackLanguages && languages && (
        <Badge bg="secondary" className="me-1" pill>
          {languages}
        </Badge>
      )}
    </>
  );
};

export default UnitStatus;
