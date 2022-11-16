import { Card, Container } from "react-bootstrap";
import "../css/main.css";

const UnauthorizedPage = () => (
  <Container className="container-main">
    <Card className="card-main">
      <Card.Img
        alt="Ministry Mapper logo"
        className="mm-logo"
        src={`${process.env.PUBLIC_URL}/android-chrome-192x192.png`}
      />
      <Card.Body>
        <Card.Title className="text-center">
          401 Unauthorized Access 🔐
        </Card.Title>
        <Card.Text className="text-justify">
          We are sorry, you are not authorised to access this page.
        </Card.Text>
      </Card.Body>
    </Card>
  </Container>
);

export default UnauthorizedPage;
