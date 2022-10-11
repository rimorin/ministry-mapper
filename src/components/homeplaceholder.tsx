import { Container, Navbar, Placeholder, Spinner } from "react-bootstrap";

const HomePlaceHolder = () => {
  return (
    <>
      <Navbar bg="light" expand="sm">
        <Container fluid>
          <Navbar.Brand>
            <Spinner animation="border" size="sm" />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse
            id="basic-navbar-nav"
            className="justify-content-end mt-1"
          >
            <Placeholder.Button
              animation="wave"
              variant="primary"
              className="me-2"
              style={{ width: "5em", height: "2.4em" }}
            />
            <Placeholder.Button
              animation="wave"
              variant="primary"
              className="me-2"
              style={{ width: "5em", height: "2.4em" }}
            />
            <Placeholder.Button
              animation="wave"
              variant="primary"
              className="me-2"
              style={{ width: "5em", height: "2.4em" }}
            />
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Placeholder animation="wave">
        <Placeholder bg="primary" xs={12} />
      </Placeholder>
    </>
  );
};

export default HomePlaceHolder;
