import { Button } from "react-bootstrap";
import { SignInDifferentProps } from "../../utils/interface";

const UseAnotherButton = ({ handleClick }: SignInDifferentProps) => (
  <Button variant="secondary" onClick={handleClick}>
    Use Another Account
  </Button>
);

export default UseAnotherButton;
