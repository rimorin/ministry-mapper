import { Form } from "react-bootstrap";
import { HouseholdProps } from "../../utils/interface";
import Select from "react-select";

const HouseholdField = ({
  handleChange,
  changeValue,
  options
}: HouseholdProps) => {
  return (
    <Form.Group className="mb-3" controlId="formBasicSelect">
      <Form.Label>Household</Form.Label>
      <Select
        options={options}
        onChange={handleChange}
        defaultValue={options.filter((option) => option.value === changeValue)}
        isSearchable={false}
        required
      />
    </Form.Group>
  );
};

export default HouseholdField;
