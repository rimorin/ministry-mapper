import { memo } from "react";
import { Badge } from "react-bootstrap";
import { STATUS_CODES } from "../../utils/constants";
import { unitProps } from "../../utils/interface";
import NotHomeIcon from "./nothome";

const UnitStatus = memo((props: unitProps) => {
  const householdType = props.type;
  const note = props.note;
  const currentStatus = props.status;
  const nhcount = props.nhcount;
  const defaultOption = props.defaultOption || "";
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

  const getHouseholdBadge = (householdType: string, defaultOption: string) => {
    if (householdType === defaultOption) {
      return <></>;
    }
    return (
      <Badge bg="secondary" className="me-1" pill>
        {householdType}
      </Badge>
    );
  };

  return (
    <>
      {currentStatus !== STATUS_CODES.NOT_HOME && <>{status}</>}
      {currentStatus === STATUS_CODES.NOT_HOME && (
        <NotHomeIcon nhcount={nhcount} classProp={"me-1"} />
      )}
      {note && <>🗒️ </>}
      {getHouseholdBadge(householdType, defaultOption)}
    </>
  );
});

export default UnitStatus;
