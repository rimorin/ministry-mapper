import { Form } from "react-bootstrap";
import { FormProps } from "../../utils/interface";

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

export default GenericInputField;
