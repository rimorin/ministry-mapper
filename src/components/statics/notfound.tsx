import { Container, Card } from "react-bootstrap";

const NotFoundPage = () => (
  <Container className="container-main">
    <Card className="card-main">
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
