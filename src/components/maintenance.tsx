import { Button, Card, Container } from "react-bootstrap";

const MaintenanceMode = () => (
  <Container className="d-flex align-items-center justify-content-center vh-100">
    <Card style={{ width: "15rem" }} className="border-0">
      <Card.Img
        variant="top"
        src={`${process.env.PUBLIC_URL}/android-chrome-192x192.png`}
      />
      <Card.Body>
        <Card.Title className="text-center">
          Ministry Mapper is currently down for maintenance. 🚧
        </Card.Title>
        <Card.Text>
          We expect to be back online in a shortwhile. Thank you for your
          patience.
        </Card.Text>
      </Card.Body>
    </Card>
  </Container>
);

export default MaintenanceMode;
