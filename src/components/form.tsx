import {
  Form,
  ToggleButtonGroup,
  ToggleButton,
  Button,
  Modal,
  Spinner
} from "react-bootstrap";
import { FooterProps, FormProps } from "./interface";
import { HOUSEHOLD_TYPES, STATUS_CODES } from "./util";

const ModalFooter = ({ handleClick, isSaving = false }: FooterProps) => {
  return (
    <Modal.Footer className="justify-content-around">
      <Button variant="secondary" onClick={handleClick}>
        Close
      </Button>
      <Button type="submit" variant="primary">
        {isSaving && (
          <>
            <Spinner
              as="span"
              animation="border"
              size="sm"
              aria-hidden="true"
            />{" "}
          </>
        )}
        Save
      </Button>
    </Modal.Footer>
  );
};

const HHType = () => (
  <>
    <option value={HOUSEHOLD_TYPES.CHINESE}>Chinese</option>
    <option value={HOUSEHOLD_TYPES.MUSLIM}>Muslim</option>
    <option value={HOUSEHOLD_TYPES.TAMIL}>Tamil</option>
    <option value={HOUSEHOLD_TYPES.INDONESIAN}>Indonesian</option>
    <option value={HOUSEHOLD_TYPES.BURMESE}>Burmese</option>
    <option value={HOUSEHOLD_TYPES.SIGN_LANGUAGE}>Sign Language</option>
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
  ModalFooter
};
