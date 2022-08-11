import { unitProps } from "./interface";
import { STATUS_CODES } from "./util";

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

  if (currentStatus === STATUS_CODES.NOT_HOME) {
    status = "❓ ";
  }

  if (currentStatus === STATUS_CODES.STILL_NOT_HOME) {
    status = "📬 ";
  }

  if (note) {
    status += "🗒️ ";
  }

  if (otherType !== "cn") {
    status += otherType;
  }

  return <div>{status}</div>;
};

export default UnitStatus;
