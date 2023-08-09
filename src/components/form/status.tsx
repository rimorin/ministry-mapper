import { Form, ToggleButtonGroup, ToggleButton } from "react-bootstrap";
import { STATUS_CODES } from "../../utils/constants";
import { FormProps } from "../../utils/interface";

const HHStatusField = ({ handleGroupChange, changeValue }: FormProps) => {
  return (
    <Form.Group
      className="mb-1 text-center"
      controlId="formBasicStatusbtnCheckbox"
    >
      <ToggleButtonGroup
        name="status"
        type="radio"
        value={changeValue}
        className="mb-3"
        onChange={handleGroupChange}
      >
        <ToggleButton
          id="status-tb-0"
          variant="outline-dark"
          value={STATUS_CODES.DEFAULT}
          className="fluid-button"
        >
          Not Done
        </ToggleButton>
        <ToggleButton
          id="status-tb-1"
          variant="outline-success"
          value={STATUS_CODES.DONE}
          className="fluid-button"
        >
          Done
        </ToggleButton>
        <ToggleButton
          id="status-tb-2"
          variant="outline-secondary"
          value={STATUS_CODES.NOT_HOME}
          className="fluid-button"
        >
          Not Home
        </ToggleButton>
        <ToggleButton
          id="status-tb-4"
          variant="outline-danger"
          value={STATUS_CODES.DO_NOT_CALL}
          className="fluid-button"
        >
          DNC
        </ToggleButton>
        <ToggleButton
          id="status-tb-5"
          variant="outline-info"
          value={STATUS_CODES.INVALID}
          className="fluid-button"
        >
          Invalid
        </ToggleButton>
      </ToggleButtonGroup>
    </Form.Group>
  );
};

export default HHStatusField;
