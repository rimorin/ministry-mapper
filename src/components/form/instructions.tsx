import { Button } from "react-bootstrap";
import { USER_ACCESS_LEVELS } from "../../utils/constants";
import { InstructionsProps } from "../../utils/interface";

const InstructionsButton = ({
  instructions,
  userAcl,
  handleSave
}: InstructionsProps) => {
  if (userAcl !== USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE && !instructions)
    return <></>;
  return (
    <Button
      size="sm"
      variant="outline-primary"
      className="m-1"
      onClick={handleSave}
    >
      <span
        className={
          instructions && userAcl !== USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE
            ? "blinking"
            : ""
        }
      >
        Instructions
      </span>
    </Button>
  );
};

export default InstructionsButton;
