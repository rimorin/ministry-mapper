import { memo } from "react";
import { Container, Card } from "react-bootstrap";

const Offline = memo(() => (
  <Container className="container-main">
    <Card className="card-main">
      <Card.Body>
        <Card.Title className="text-center">
          Your device appears to be offline. 🚫 📶
        </Card.Title>
        <Card.Text className="text-justify">
          This could be due to a network issue or you are in an area with poor
          network coverage. Please check your network connection. Ministry
          Mapper will be back online once your device is connected to the
          internet.
        </Card.Text>
      </Card.Body>
    </Card>
  </Container>
));

export default Offline;
