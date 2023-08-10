import {
  Form,
  Container,
  ToggleButtonGroup,
  ToggleButton
} from "react-bootstrap";
import { HOUSEHOLD_LANGUAGES } from "../../utils/constants";
import { FormProps } from "../../utils/interface";

const HHLangField = ({ handleChangeValues, changeValues }: FormProps) => {
  return (
    <Form.Group controlId="formBasicCheckbox">
      <Form.Label>Languages</Form.Label>
      <Container className="text-center">
        <ToggleButtonGroup
          name="type"
          type="checkbox"
          value={changeValues}
          onChange={handleChangeValues}
          size="sm"
          className="mb-1 group-wrap"
        >
          <ToggleButton
            id="type-cb-0"
            variant="outline-primary"
            value={HOUSEHOLD_LANGUAGES.ENGLISH.CODE}
          >
            {HOUSEHOLD_LANGUAGES.ENGLISH.DISPLAY}
          </ToggleButton>
          <ToggleButton
            id="type-cb-2"
            variant="outline-primary"
            value={HOUSEHOLD_LANGUAGES.CHINESE.CODE}
          >
            {HOUSEHOLD_LANGUAGES.CHINESE.DISPLAY}
          </ToggleButton>
          <ToggleButton
            id="type-cb-3"
            variant="outline-primary"
            value={HOUSEHOLD_LANGUAGES.TAMIL.CODE}
          >
            {HOUSEHOLD_LANGUAGES.TAMIL.DISPLAY}
          </ToggleButton>
          <ToggleButton
            id="type-cb-4"
            variant="outline-primary"
            value={HOUSEHOLD_LANGUAGES.BURMESE.CODE}
          >
            {HOUSEHOLD_LANGUAGES.BURMESE.DISPLAY}
          </ToggleButton>
          <ToggleButton
            id="type-cb-1"
            variant="outline-primary"
            value={HOUSEHOLD_LANGUAGES.MALAY.CODE}
          >
            {HOUSEHOLD_LANGUAGES.MALAY.DISPLAY}
          </ToggleButton>
          <ToggleButton
            id="type-cb-5"
            variant="outline-primary"
            value={HOUSEHOLD_LANGUAGES.TAGALOG.CODE}
          >
            {HOUSEHOLD_LANGUAGES.TAGALOG.DISPLAY}
          </ToggleButton>
          <ToggleButton
            id="type-cb-6"
            variant="outline-primary"
            value={HOUSEHOLD_LANGUAGES.INDONESIAN.CODE}
          >
            {HOUSEHOLD_LANGUAGES.INDONESIAN.DISPLAY}
          </ToggleButton>
        </ToggleButtonGroup>
      </Container>
    </Form.Group>
  );
};

export default HHLangField;
