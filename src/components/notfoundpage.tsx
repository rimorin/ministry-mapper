import { Card, Container } from "react-bootstrap";
import "../css/main.css";
const NotFoundPage = () => (
  <Container className="d-flex align-items-center justify-content-center vh-100">
    <Card className="border-0 align-items-center" style={{ width: "80%" }}>
      <Card.Img
        alt="Ministry Mapper logo"
        className="mm-logo"
        src={`${process.env.PUBLIC_URL}/android-chrome-192x192.png`}
      />
      <Card.Body>
        <Card.Title className="text-center">404 Page Not Found 🚫</Card.Title>
        <Card.Text className="text-justify">
          We are sorry, the page you requested could not be found.
        </Card.Text>
      </Card.Body>
    </Card>
  </Container>
);

export default NotFoundPage;
