import { Form } from "react-bootstrap";
import { HouseholdProps } from "../../utils/interface";

const HouseholdField = ({
  handleChange,
  changeValue,
  options
}: HouseholdProps) => {
  return (
    <div className="mb-3">
      <div className="mb-2 inline-block">Household</div>
      <Form.Select
        aria-label="Household selection"
        onChange={handleChange}
        value={changeValue}
        required
      >
        {options &&
          options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
      </Form.Select>
    </div>
  );
};

export default HouseholdField;
