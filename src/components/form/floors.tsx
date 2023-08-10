import { Form } from "react-bootstrap";
import RangeSlider from "react-bootstrap-range-slider";
import { MIN_START_FLOOR, MAX_TOP_FLOOR } from "../../utils/constants";
import { FloorProps } from "../../utils/interface";

const FloorField = ({ handleChange, changeValue }: FloorProps) => {
  return (
    <Form.Group className="mb-3" controlId="formBasicFloorRange">
      <Form.Label>No. of floors</Form.Label>
      <RangeSlider
        min={MIN_START_FLOOR}
        max={MAX_TOP_FLOOR}
        value={changeValue}
        onChange={handleChange}
      />
    </Form.Group>
  );
};

export default FloorField;
