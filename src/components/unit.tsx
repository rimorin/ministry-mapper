import { Badge } from "react-bootstrap";
import { unitProps } from "./interface";
import { STATUS_CODES } from "./util";

const UnitStatus = (props: unitProps) => {
  const hhTypes = props.type;
  const note = props.note;
  const currentStatus = props.status;
  const nhcount = props.nhcount;
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
      {hhTypes !== "" && (
        <Badge bg="secondary" pill>
          {hhTypes}
        </Badge>
      )}
    </>
  );
};

export default UnitStatus;
