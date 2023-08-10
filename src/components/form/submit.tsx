import { Button, Spinner } from "react-bootstrap";
import { SubmitBtnProps } from "../../utils/interface";

const ModalSubmitButton = ({
  isSaving = false,
  btnLabel = "Save",
  disabled = false
}: SubmitBtnProps) => {
  return (
    <Button type="submit" variant="primary" disabled={isSaving || disabled}>
      {isSaving && (
        <Spinner as="span" animation="border" size="sm" aria-hidden="true" />
      )}{" "}
      {btnLabel}
    </Button>
  );
};

export default ModalSubmitButton;
