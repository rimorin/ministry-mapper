import { Container, Spinner } from "react-bootstrap";

const Loader = () => (
  <Container
    className="d-flex align-items-center justify-content-center vh-100"
    fluid
  >
    <Spinner variant="primary" role="status" />
  </Container>
);

export default Loader;
