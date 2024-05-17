import { memo } from "react";
import { Container, Card } from "react-bootstrap";

const InvalidPage = memo(() => (
  <Container className="container-main">
    <Card className="card-main">
      <Card.Img
        alt="Ministry Mapper logo"
        className="mm-logo"
        src="/android-chrome-192x192.png"
      />
      <Card.Body>
        <Card.Title className="text-center">
          This link has expired ⌛
        </Card.Title>
      </Card.Body>
    </Card>
  </Container>
));

export default InvalidPage;
