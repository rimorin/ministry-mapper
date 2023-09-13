import { memo } from "react";
import { Container, Card } from "react-bootstrap";

const Offline = memo(() => (
  <Container className="container-main">
    <Card className="card-main">
      <Card.Img
        alt="Ministry Mapper logo"
        className="mm-logo"
        src={`/android-chrome-192x192.png`}
      />
      <Card.Body>
        <Card.Title className="text-center">
          Your device appears to be offline. 📴
        </Card.Title>
        <Card.Text className="text-justify">
          There maybe a problem with your internet connection. This could be due
          to a weak signal or a problem with your internet service provider.
          Ministry Mapper will resume once your device is back online.
        </Card.Text>
      </Card.Body>
    </Card>
  </Container>
));

export default Offline;
