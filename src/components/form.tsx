import { Form, ToggleButtonGroup, ToggleButton } from "react-bootstrap";
import { FormProps } from "./interface";
import { STATUS_CODES } from "./util";

const HHType = () => (
  <>
    <option value="cn">Chinese</option>
    <option value="tm">Tamil</option>
    <option value="in">Indonesian</option>
    <option value="bm">Burmese</option>
    <option value="ml">Muslim</option>
    <option value="sl">Sign Language</option>
    <option value="ot">Others</option>
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
        placeholder="Optional non-personal information. Eg, Renovation, Friends, etc."
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
        {/* <ToggleButton
                    id="status-tb-3"
                    variant="outline-dark"
                    value={STATUS_CODES.STILL_NOT_HOME}
                  >
                    Still Nt 🏠
                  </ToggleButton> */}
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

export { HHType, NoteField, HHTypeField, HHStatusField, FeedbackField };
