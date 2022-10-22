import { Badge } from "react-bootstrap";
import { unitProps } from "./interface";
import { HOUSEHOLD_TYPES, STATUS_CODES } from "./util";

const UnitStatus = (props: unitProps) => {
  const otherType = props.type;
  const note = props.note;
  const currentStatus = props.status;
  const nhcount = props.nhcount;
  const languages = props.languages;
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
      {otherType !== HOUSEHOLD_TYPES.CHINESE && (
        <Badge bg="secondary" className="me-1" pill>
          {otherType}
        </Badge>
      )}
      {languages && (
        <Badge bg="secondary" className="me-1" pill>
          {languages}
        </Badge>
      )}
    </>
  );
};

export default UnitStatus;
