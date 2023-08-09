import { Form, ToggleButtonGroup, ToggleButton } from "react-bootstrap";
import { USER_ACCESS_LEVELS } from "../../utils/constants";
import { UserRoleProps } from "../../utils/interface";

const UserRoleField = ({
  handleRoleChange,
  role,
  isUpdate = true
}: UserRoleProps) => {
  return (
    <Form.Group
      className="mb-1 text-center"
      controlId="formBasicRolebtnCheckbox"
    >
      <ToggleButtonGroup
        name="status"
        type="radio"
        value={role}
        className="mb-3"
        onChange={handleRoleChange}
      >
        {isUpdate && (
          <ToggleButton
            id="status-tb-0"
            variant="outline-danger"
            value={USER_ACCESS_LEVELS.NO_ACCESS.CODE}
            className="fluid-button"
          >
            {USER_ACCESS_LEVELS.NO_ACCESS.DISPLAY}
          </ToggleButton>
        )}
        <ToggleButton
          id="status-tb-1"
          variant="outline-secondary"
          value={USER_ACCESS_LEVELS.READ_ONLY.CODE}
          className="fluid-button"
        >
          {USER_ACCESS_LEVELS.READ_ONLY.DISPLAY}
        </ToggleButton>
        <ToggleButton
          id="status-tb-2"
          variant="outline-success"
          value={USER_ACCESS_LEVELS.CONDUCTOR.CODE}
          className="fluid-button"
        >
          {USER_ACCESS_LEVELS.CONDUCTOR.DISPLAY}
        </ToggleButton>
        <ToggleButton
          id="status-tb-4"
          variant="outline-primary"
          value={USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE}
          className="fluid-button"
        >
          {USER_ACCESS_LEVELS.TERRITORY_SERVANT.DISPLAY}
        </ToggleButton>
      </ToggleButtonGroup>
    </Form.Group>
  );
};

export default UserRoleField;
