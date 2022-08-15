import { Button, Card, Container } from "react-bootstrap";

const MaintenanceMode = () => (
  <Container className="d-flex align-items-center justify-content-center vh-100">
    <Card className="border-0 align-items-center">
      <Card.Img
        style={{ width: "10rem" }}
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
