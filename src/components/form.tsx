import {
  Form,
  ToggleButtonGroup,
  ToggleButton,
  Button,
  Modal,
  Spinner,
  InputGroup,
  Container
} from "react-bootstrap";
import RangeSlider from "react-bootstrap-range-slider";
import {
  FloorProps,
  FooterProps,
  FormProps,
  InstructionsProps,
  SubmitBtnProps,
  TitleProps,
  UserRoleProps
} from "../utils/interface";

import Calendar from "react-calendar";
import {
  USER_ACCESS_LEVELS,
  HOUSEHOLD_TYPES,
  MIN_START_FLOOR,
  MAX_TOP_FLOOR,
  HOUSEHOLD_LANGUAGES,
  STATUS_CODES,
  NOT_HOME_STATUS_CODES,
  TERRITORY_TYPES,
  WIKI_CATEGORIES
} from "../utils/constants";
import { ComponentAuthorizer, HelpButton } from "./navigation";

const ModalFooter = ({
  propertyPostal,
  handleClick,
  handleDelete,
  type,
  //Default to conductor access lvl so that individual slips can be writable.
  userAccessLevel = USER_ACCESS_LEVELS.CONDUCTOR.CODE,
  requiredAcLForSave = USER_ACCESS_LEVELS.CONDUCTOR.CODE,
  isSaving = false,
  submitLabel = "Save",
  disableSubmitBtn = false
}: FooterProps) => {
  const encodedPropertyPostal = encodeURIComponent(propertyPostal as string);
  return (
    <Modal.Footer className="justify-content-around">
      {type && type === TERRITORY_TYPES.PRIVATE ? (
        <>
          <ComponentAuthorizer
            requiredPermission={USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE}
            userPermission={userAccessLevel}
          >
            <Button variant="secondary" onClick={handleDelete}>
              Delete Property
            </Button>
          </ComponentAuthorizer>
          {propertyPostal && (
            <Button
              variant="secondary"
              onClick={() => {
                window.open(
                  `http://maps.google.com.sg/maps?q=${encodedPropertyPostal}`,
                  "_blank"
                );
              }}
            >
              Direction
            </Button>
          )}
        </>
      ) : (
        <></>
      )}
      <Button variant="secondary" onClick={handleClick}>
        Close
      </Button>
      <ComponentAuthorizer
        requiredPermission={
          requiredAcLForSave
            ? requiredAcLForSave
            : USER_ACCESS_LEVELS.CONDUCTOR.CODE
        }
        userPermission={userAccessLevel}
      >
        <ModalSubmitButton
          isSaving={isSaving}
          btnLabel={submitLabel}
          disabled={disableSubmitBtn}
        />
      </ComponentAuthorizer>
    </Modal.Footer>
  );
};

const ModalSubmitButton = ({
  isSaving = false,
  btnLabel = "Save",
  disabled = false
}: SubmitBtnProps) => {
  return (
    <Button type="submit" variant="primary" disabled={isSaving || disabled}>
      {isSaving && (
        <Spinner as="span" animation="border" size="sm" aria-hidden="true" />
      )}{" "}
      {btnLabel}
    </Button>
  );
};

const HHType = () => (
  <>
    <option value={HOUSEHOLD_TYPES.CHINESE}>Chinese</option>
    <option value={HOUSEHOLD_TYPES.MALAY}>Malay</option>
    <option value={HOUSEHOLD_TYPES.INDIAN}>Indian</option>
    <option value={HOUSEHOLD_TYPES.FILIPINO}>Filipino</option>
    <option value={HOUSEHOLD_TYPES.INDONESIAN}>Indonesian</option>
    <option value={HOUSEHOLD_TYPES.BURMESE}>Burmese</option>
    <option value={HOUSEHOLD_TYPES.THAI}>Thai</option>
    <option value={HOUSEHOLD_TYPES.VIETNAMESE}>Vietnamese</option>
    <option value={HOUSEHOLD_TYPES.OTHER}>Others</option>
  </>
);

const GenericInputField = ({
  handleChange,
  changeValue,
  name,
  label,
  required = false,
  placeholder = "",
  information = "",
  inputType = "string",
  readOnly = false
}: FormProps) => {
  return (
    <Form.Group className="mb-3" controlId={`basicForm${name}Text`}>
      <Form.Label>{label}</Form.Label>
      <Form.Control
        type={inputType}
        onChange={handleChange}
        name={name}
        value={changeValue}
        required={required}
        placeholder={placeholder}
        readOnly={readOnly}
      />
      {information && <Form.Text muted>{information}</Form.Text>}
    </Form.Group>
  );
};

const FloorField = ({ handleChange, changeValue }: FloorProps) => {
  return (
    <Form.Group className="mb-3" controlId="formBasicFloorRange">
      <Form.Label>No. of floors</Form.Label>
      <RangeSlider
        min={MIN_START_FLOOR}
        max={MAX_TOP_FLOOR}
        value={changeValue}
        onChange={handleChange}
      />
    </Form.Group>
  );
};

const GenericTextAreaField = ({
  handleChange,
  changeValue,
  label,
  name,
  placeholder,
  rows = 3,
  required = false,
  readOnly = false
}: FormProps) => {
  return (
    <Form.Group className="mb-3" controlId={`formBasic${name}TextAreaField`}>
      {label && <Form.Label>{label}</Form.Label>}
      <Form.Control
        onChange={handleChange}
        name={name}
        as="textarea"
        rows={rows}
        placeholder={placeholder}
        value={changeValue}
        required={required}
        readOnly={readOnly}
      />
    </Form.Group>
  );
};

const HHTypeField = ({ handleChange, changeValue }: FormProps) => {
  return (
    <Form.Group className="mb-3" controlId="formBasicSelect">
      <Form.Label>Household</Form.Label>
      <Form.Select
        onChange={handleChange}
        name="type"
        aria-label="Default select example"
        value={changeValue}
      >
        <HHType />
      </Form.Select>
    </Form.Group>
  );
};

const HHLangField = ({ handleChangeValues, changeValues }: FormProps) => {
  return (
    <Form.Group controlId="formBasicCheckbox">
      <Form.Label>Languages</Form.Label>
      <Container className="text-center">
        <ToggleButtonGroup
          name="type"
          type="checkbox"
          value={changeValues}
          onChange={handleChangeValues}
          size="sm"
          className="mb-1 group-wrap"
        >
          <ToggleButton
            id="type-cb-0"
            variant="outline-primary"
            value={HOUSEHOLD_LANGUAGES.ENGLISH.CODE}
          >
            {HOUSEHOLD_LANGUAGES.ENGLISH.DISPLAY}
          </ToggleButton>
          <ToggleButton
            id="type-cb-2"
            variant="outline-primary"
            value={HOUSEHOLD_LANGUAGES.CHINESE.CODE}
          >
            {HOUSEHOLD_LANGUAGES.CHINESE.DISPLAY}
          </ToggleButton>
          <ToggleButton
            id="type-cb-3"
            variant="outline-primary"
            value={HOUSEHOLD_LANGUAGES.TAMIL.CODE}
          >
            {HOUSEHOLD_LANGUAGES.TAMIL.DISPLAY}
          </ToggleButton>
          <ToggleButton
            id="type-cb-4"
            variant="outline-primary"
            value={HOUSEHOLD_LANGUAGES.BURMESE.CODE}
          >
            {HOUSEHOLD_LANGUAGES.BURMESE.DISPLAY}
          </ToggleButton>
          <ToggleButton
            id="type-cb-1"
            variant="outline-primary"
            value={HOUSEHOLD_LANGUAGES.MALAY.CODE}
          >
            {HOUSEHOLD_LANGUAGES.MALAY.DISPLAY}
          </ToggleButton>
          <ToggleButton
            id="type-cb-5"
            variant="outline-primary"
            value={HOUSEHOLD_LANGUAGES.TAGALOG.CODE}
          >
            {HOUSEHOLD_LANGUAGES.TAGALOG.DISPLAY}
          </ToggleButton>
          <ToggleButton
            id="type-cb-6"
            variant="outline-primary"
            value={HOUSEHOLD_LANGUAGES.INDONESIAN.CODE}
          >
            {HOUSEHOLD_LANGUAGES.INDONESIAN.DISPLAY}
          </ToggleButton>
        </ToggleButtonGroup>
      </Container>
    </Form.Group>
  );
};

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

const HHNotHomeField = ({ handleGroupChange, changeValue }: FormProps) => {
  return (
    <Form.Group className="mb-1" controlId="formBasicNtHomebtnCheckbox">
      <Form.Label>Number of tries</Form.Label>
      <InputGroup className="justify-content-center">
        <ToggleButtonGroup
          name="nhcount"
          type="radio"
          value={changeValue}
          className="mb-3 group-wrap"
          onChange={handleGroupChange}
        >
          <ToggleButton
            id="nh-status-tb-0"
            variant="outline-secondary"
            value={NOT_HOME_STATUS_CODES.DEFAULT}
          >
            1st
          </ToggleButton>
          <ToggleButton
            id="nh-status-tb-1"
            variant="outline-secondary"
            value={NOT_HOME_STATUS_CODES.SECOND_TRY}
          >
            2nd
          </ToggleButton>
          <ToggleButton
            id="nh-status-tb-2"
            variant="outline-secondary"
            value={NOT_HOME_STATUS_CODES.THIRD_TRY}
          >
            3rd
          </ToggleButton>
          <ToggleButton
            id="nh-status-tb-3"
            variant="outline-secondary"
            value={NOT_HOME_STATUS_CODES.FOURTH_TRY}
          >
            4th
          </ToggleButton>
        </ToggleButtonGroup>
      </InputGroup>
    </Form.Group>
  );
};

const AdminLinkField = ({ handleChange, changeValue }: FormProps) => {
  return (
    <Form.Group className="mb-3" controlId="formLinkInput">
      <Form.Control
        onChange={handleChange}
        placeholder="Paste territory link here"
        aria-label="link"
        name="link"
        value={changeValue}
        required
      />
    </Form.Group>
  );
};

const DncDateField = ({ handleDateChange, changeDate }: FormProps) => {
  const dateValue = changeDate ? new Date(changeDate) : new Date();
  return (
    <Form.Group className="mb-1" controlId="formBasicDncCalendar">
      <Form.Label>Date of DNC</Form.Label>
      <Calendar
        onChange={handleDateChange}
        className="w-100 mb-3"
        value={dateValue}
      />
    </Form.Group>
  );
};

const ModalUnitTitle = ({
  unit,
  propertyPostal,
  floor,
  postal,
  name,
  type
}: TitleProps) => {
  let titleString = `# ${floor} - ${unit}`;

  if (postal) {
    titleString = `${postal}, ${titleString}`;
  }

  if (type === TERRITORY_TYPES.PRIVATE) {
    titleString = `${unit}, ${name}`;
    if (propertyPostal) {
      titleString = `${titleString}, ${propertyPostal}`;
    }
  }
  return (
    <Modal.Header>
      <Modal.Title>{titleString}</Modal.Title>
      <HelpButton link={WIKI_CATEGORIES.UPDATE_UNIT_STATUS} />
    </Modal.Header>
  );
};

const InstructionsButton = ({
  instructions,
  userAcl,
  handleSave
}: InstructionsProps) => {
  if (userAcl !== USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE && !instructions)
    return <></>;
  return (
    <Button
      size="sm"
      variant="outline-primary"
      className="m-1"
      onClick={handleSave}
    >
      <span
        className={
          instructions && userAcl !== USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE
            ? "blinking"
            : ""
        }
      >
        Instructions
      </span>
    </Button>
  );
};

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

export {
  HHType,
  HHTypeField,
  HHStatusField,
  AdminLinkField,
  HHNotHomeField,
  DncDateField,
  HHLangField,
  FloorField,
  GenericInputField,
  GenericTextAreaField,
  ModalFooter,
  ModalUnitTitle,
  InstructionsButton,
  ModalSubmitButton,
  UserRoleField
};
