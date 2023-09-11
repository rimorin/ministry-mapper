import Calendar from "react-calendar";
import { FormProps } from "../../utils/interface";

const DncDateField = ({ handleDateChange, changeDate }: FormProps) => {
  const dateValue = changeDate ? new Date(changeDate) : new Date();
  return (
    <div className="mb-1">
      <div className="mb-2 inline-block">Date of DNC</div>
      <Calendar
        onChange={handleDateChange}
        className="w-100 mb-3"
        value={dateValue}
      />
    </div>
  );
};

export default DncDateField;
