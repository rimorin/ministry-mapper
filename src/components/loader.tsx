import { Container, Spinner } from "react-bootstrap";

function Loader() {
  return (
    <Container
      className="d-flex align-items-center justify-content-center vh-100"
      fluid
    >
      <Spinner animation="border" variant="primary" role="status" />
    </Container>
  );
}

export default Loader;
