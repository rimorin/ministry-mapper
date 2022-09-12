import { Card, Container } from "react-bootstrap";

const ConnectionPage = () => (
  <Container className="d-flex align-items-center justify-content-center vh-100">
    <Card className="border-0 align-items-center" style={{ width: "80%" }}>
      <Card.Img
        alt="Ministry Mapper logo"
        style={{ width: "30%" }}
        src={`${process.env.PUBLIC_URL}/android-chrome-192x192.png`}
      />
      <Card.Body>
        <Card.Title className="text-center">Connection Problem 📡</Card.Title>
        <Card.Text className="text-justify">
          Please check your internet connection or try refreshing this page.
        </Card.Text>
      </Card.Body>
    </Card>
  </Container>
);

export default ConnectionPage;
