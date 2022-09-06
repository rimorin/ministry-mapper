import { Badge } from "react-bootstrap";
import { unitProps } from "./interface";
import { HOUSEHOLD_TYPES, STATUS_CODES } from "./util";

const UnitStatus = (props: unitProps) => {
  const otherType = props.type;
  const note = props.note;
  const currentStatus = props.status;
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
    status = "📬 ";
  }

  if (note) {
    status += "🗒️ ";
  }

  return (
    <>
      {status}
      {otherType !== HOUSEHOLD_TYPES.CHINESE && (
        <Badge bg="secondary" pill>
          {otherType}
        </Badge>
      )}
    </>
  );
};

export default UnitStatus;
