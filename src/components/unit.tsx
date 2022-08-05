import { unitProps } from "./interface";

const UnitStatus = (props: unitProps) => {
  const isDone = props.isDone;
  const isDnc = props.isDnc;
  const otherType = props.type;
  const note = props.note;
  const isInvalid = props.isInvalid;
  let status = "";

  if (isInvalid) {
    return <div>🚫</div>
  }
  if (isDone) {
    status = "✅ ";
  }

  if (isDnc) {
    status = "❌ ";
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
