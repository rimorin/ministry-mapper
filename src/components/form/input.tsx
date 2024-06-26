import { Form } from "react-bootstrap";
import { FormProps } from "../../utils/interface";

const GenericInputField = ({
  handleChange,
  handleClick,
  changeValue,
  name,
  label,
  required = false,
  placeholder = "",
  information = "",
  inputType = "string",
  readOnly = false,
  focus = false
}: FormProps) => {
  return (
    <Form.Group className="mb-3" controlId={`basicForm${name}Text`}>
      <Form.Label>{label}</Form.Label>
      <Form.Control
        type={inputType}
        onChange={handleChange}
        onClick={handleClick}
        name={name}
        value={changeValue}
        required={required}
        placeholder={placeholder}
        readOnly={readOnly}
        // autofocus does not work for ios safari
        autoFocus={focus}
      />
      {information && <Form.Text muted>{information}</Form.Text>}
    </Form.Group>
  );
};

export default GenericInputField;
