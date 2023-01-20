import "../css/common.css";
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
import { FloorProps, FooterProps, FormProps } from "./interface";
import {
  ComponentAuthorizer,
  HOUSEHOLD_LANGUAGES,
  HOUSEHOLD_TYPES,
  MAX_TOP_FLOOR,
  MIN_START_FLOOR,
  NOT_HOME_STATUS_CODES,
  STATUS_CODES,
  USER_ACCESS_LEVELS
} from "./util";

import Calendar from "react-calendar";

const ModalFooter = ({
  handleClick,
  //Default to conductor access lvl so that individual slips can be writable.
  userAccessLevel = USER_ACCESS_LEVELS.CONDUCTOR,
  isSaving = false
}: FooterProps) => {
  return (
    <Modal.Footer className="justify-content-around">
      <Button variant="secondary" onClick={handleClick}>
        Close
      </Button>
      <ComponentAuthorizer
        requiredPermission={USER_ACCESS_LEVELS.CONDUCTOR}
        userPermission={userAccessLevel}
      >
        <Button type="submit" variant="primary">
          {isSaving && (
            <Spinner
              as="span"
              animation="border"
              size="sm"
              aria-hidden="true"
            />
          )}{" "}
          Save
        </Button>
      </ComponentAuthorizer>
    </Modal.Footer>
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

const GenericTextField = ({
  handleChange,
  changeValue,
  name,
  label,
  required = false,
  placeholder = ""
}: FormProps) => {
  return (
    <Form.Group className="mb-3" controlId={`basicForm${name}Text`}>
      <Form.Label>{label}</Form.Label>
      <Form.Control
        onChange={handleChange}
        name={name}
        value={changeValue}
        required={required}
        placeholder={placeholder}
      />
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
  required = false
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

const HHStatusField = ({ handleChange, changeValue }: FormProps) => {
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
        onChange={handleChange}
      >
        <ToggleButton
          id="status-tb-0"
          variant="outline-dark"
          value={STATUS_CODES.DEFAULT}
          className="fluid-text"
        >
          Not Done
        </ToggleButton>
        <ToggleButton
          id="status-tb-1"
          variant="outline-success"
          value={STATUS_CODES.DONE}
          className="fluid-text"
        >
          Done
        </ToggleButton>
        <ToggleButton
          id="status-tb-2"
          variant="outline-secondary"
          value={STATUS_CODES.NOT_HOME}
          className="fluid-text"
        >
          Not Home
        </ToggleButton>
        <ToggleButton
          id="status-tb-4"
          variant="outline-danger"
          value={STATUS_CODES.DO_NOT_CALL}
          className="fluid-text"
        >
          DNC
        </ToggleButton>
        <ToggleButton
          id="status-tb-5"
          variant="outline-info"
          value={STATUS_CODES.INVALID}
          className="fluid-text"
        >
          Invalid
        </ToggleButton>
      </ToggleButtonGroup>
    </Form.Group>
  );
};

const HHNotHomeField = ({ handleChange, changeValue }: FormProps) => {
  return (
    <Form.Group className="mb-1" controlId="formBasicNtHomebtnCheckbox">
      <Form.Label>Number of tries</Form.Label>
      <InputGroup className="justify-content-center">
        <ToggleButtonGroup
          name="nhcount"
          type="radio"
          value={changeValue}
          className="mb-3 group-wrap"
          onChange={handleChange}
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

export {
  HHType,
  HHTypeField,
  HHStatusField,
  AdminLinkField,
  HHNotHomeField,
  DncDateField,
  HHLangField,
  FloorField,
  GenericTextField,
  GenericTextAreaField,
  ModalFooter
};
