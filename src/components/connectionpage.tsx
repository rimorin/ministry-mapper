import { Card, Container } from "react-bootstrap";

const ConnectionPage = () => (
  <Container className="d-flex align-items-center justify-content-center vh-100">
    <Card>
      <Card.Header className="text-center">Connection Problem 📡</Card.Header>
      <Card.Body>
        <Card.Text className="text-justify">
          Please check your internet connection or try refreshing this page.
        </Card.Text>
      </Card.Body>
    </Card>
  </Container>
);

export default ConnectionPage;
