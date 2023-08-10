import { Form } from "react-bootstrap";
import { FormProps } from "../../utils/interface";
import HHType from "./races";

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

export default HHTypeField;
