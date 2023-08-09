import { Form } from "react-bootstrap";
import { FormProps } from "../../utils/interface";

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

export default GenericTextAreaField;
