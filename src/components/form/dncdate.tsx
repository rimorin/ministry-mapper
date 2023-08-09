import { Form } from "react-bootstrap";
import Calendar from "react-calendar";
import { FormProps } from "../../utils/interface";

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

export default DncDateField;
