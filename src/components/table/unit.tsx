import { memo } from "react";
import { Badge } from "react-bootstrap";
import {
  DEFAULT_CONGREGATION_OPTION_IS_MULTIPLE,
  DEFAULT_MULTPLE_OPTION_DELIMITER,
  STATUS_CODES
} from "../../utils/constants";
import { unitProps } from "../../utils/interface";
import NotHomeIcon from "./nothome";

const UnitStatus = memo((props: unitProps) => {
  const householdType = props.type;
  const note = props.note;
  const currentStatus = props.status;
  const nhcount = props.nhcount;
  const defaultOption = props.defaultOption || "";
  const isMultiSelect =
    props.optionMultiSelect || DEFAULT_CONGREGATION_OPTION_IS_MULTIPLE;
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

  const getHouseholdBadge = (
    householdType: string,
    isMultiSelect: boolean,
    defaultOption: string
  ) => {
    if (isMultiSelect) {
      const multHouseholdTypes = householdType
        .split(DEFAULT_MULTPLE_OPTION_DELIMITER)
        .filter((type) => type !== defaultOption)
        .join(DEFAULT_MULTPLE_OPTION_DELIMITER);
      return (
        <Badge bg="secondary" className="me-1" pill>
          {multHouseholdTypes}
        </Badge>
      );
    }
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
      {getHouseholdBadge(householdType, isMultiSelect, defaultOption)}
    </>
  );
});

export default UnitStatus;
