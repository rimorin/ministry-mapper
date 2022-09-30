import {
  Form,
  ToggleButtonGroup,
  ToggleButton,
  Button,
  Modal,
  Spinner,
  InputGroup
} from "react-bootstrap";
import RangeSlider from "react-bootstrap-range-slider";
import { FloorProps, FooterProps, FormProps } from "./interface";
import {
  HOUSEHOLD_TYPES,
  MAX_TOP_FLOOR,
  MIN_START_FLOOR,
  NOT_HOME_STATUS_CODES,
  STATUS_CODES
} from "./util";

const ModalFooter = ({ handleClick, isSaving = false }: FooterProps) => {
  return (
    <Modal.Footer className="justify-content-around">
      <Button variant="secondary" onClick={handleClick}>
        Close
      </Button>
      <Button type="submit" variant="primary">
        {isSaving && (
          <Spinner as="span" animation="border" size="sm" aria-hidden="true" />
        )}{" "}
        Save
      </Button>
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

const NoteField = ({ handleChange, changeValue }: FormProps) => {
  return (
    <Form.Group className="mb-3" controlId="formBasicTextArea">
      <Form.Label>Notes</Form.Label>
      <Form.Control
        onChange={handleChange}
        name="note"
        as="textarea"
        rows={3}
        aria-label="With textarea"
        placeholder="Optional non-personal information. Eg, Renovation, Foreclosed, Friends, etc."
        value={changeValue}
      />
    </Form.Group>
  );
};

const PostalField = ({ handleChange, changeValue }: FormProps) => {
  return (
    <Form.Group className="mb-3" controlId="formBasicPostalText">
      <Form.Label>Postal Code</Form.Label>
      <Form.Control
        onChange={handleChange}
        name="postalcode"
        value={changeValue}
      />
    </Form.Group>
  );
};

const NameField = ({ handleChange, changeValue }: FormProps) => {
  return (
    <Form.Group className="mb-3" controlId="formBasicNameText">
      <Form.Label>Block Name</Form.Label>
      <Form.Control onChange={handleChange} name="name" value={changeValue} />
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

const UnitsField = ({ handleChange, changeValue }: FormProps) => {
  return (
    <Form.Group className="mb-3" controlId="formBasicUnitTextArea">
      <Form.Label>Unit Sequence</Form.Label>
      <Form.Control
        onChange={handleChange}
        name="units"
        as="textarea"
        rows={3}
        aria-label="With textarea"
        placeholder="Unit sequence with comma seperator. For eg, 301,303,305 ..."
        value={changeValue}
      />
    </Form.Group>
  );
};

const FeedbackField = ({ handleChange, changeValue }: FormProps) => {
  return (
    <Form.Group className="mb-3" controlId="formBasicFeedbackTextArea">
      <Form.Control
        onChange={handleChange}
        name="feedback"
        as="textarea"
        rows={5}
        aria-label="With textarea"
        value={changeValue}
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

const HHStatusField = ({ handleChange, changeValue }: FormProps) => {
  return (
    <Form.Group className="mb-3" controlId="formBasicStatusbtnCheckbox">
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
        >
          Not Done
        </ToggleButton>
        <ToggleButton
          id="status-tb-1"
          variant="outline-success"
          value={STATUS_CODES.DONE}
        >
          Done
        </ToggleButton>
        <ToggleButton
          id="status-tb-2"
          variant="outline-secondary"
          value={STATUS_CODES.NOT_HOME}
        >
          Not Home
        </ToggleButton>
        <ToggleButton
          id="status-tb-4"
          variant="outline-danger"
          value={STATUS_CODES.DO_NOT_CALL}
        >
          DNC
        </ToggleButton>
        <ToggleButton
          id="status-tb-5"
          variant="outline-info"
          value={STATUS_CODES.INVALID}
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
          className="mb-3"
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
      />
    </Form.Group>
  );
};

export {
  HHType,
  NoteField,
  HHTypeField,
  HHStatusField,
  FeedbackField,
  AdminLinkField,
  HHNotHomeField,
  NameField,
  FloorField,
  UnitsField,
  PostalField,
  ModalFooter
};
