import { Container, Card } from "react-bootstrap";
import { SignInDifferentProps } from "../../utils/interface";
import UseAnotherButton from "../navigation/useanother";

const UnauthorizedPage = ({ handleClick, name }: SignInDifferentProps) => (
  <Container className="container-main">
    <Card className="card-main">
      <Card.Img
        alt="Ministry Mapper logo"
        className="mm-logo"
        src="/android-chrome-192x192.png"
      />
      <Card.Body>
        <Card.Title className="text-center">
          401 Unauthorized Access 🔐
        </Card.Title>
        <Card.Text className="text-justify">
          We are sorry {name}! You are not authorised to access this page.
        </Card.Text>
      </Card.Body>
      <UseAnotherButton handleClick={handleClick} />
    </Card>
  </Container>
);

export default UnauthorizedPage;
