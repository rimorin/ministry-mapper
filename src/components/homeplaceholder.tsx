import { Container, Navbar, Placeholder, Table } from "react-bootstrap";

const HomePlaceHolder = () => {
  return (
    <>
      <Navbar bg="light" expand="sm">
        <Container fluid>
          <Navbar.Brand>
            <img
              alt=""
              src={`${process.env.PUBLIC_URL}/favicon-32x32.png`}
              width="32"
              height="32"
              className="d-inline-block align-top"
            />{" "}
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse
            id="basic-navbar-nav"
            className="justify-content-end mt-1"
          >
            <Placeholder
              animation="wave"
              bg="secondary"
              className="d-inline-block border border-dark"
              style={{ width: "100%", minHeight: "2em" }}
            ></Placeholder>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Table bordered striped responsive>
        <thead>
          <tr>
            <th
              style={{ width: "10%" }}
              scope="col"
              className="text-center align-middle"
            >
              lvl/unit
            </th>
            <th scope="col" className="text-center align-middle">
              <Placeholder
                animation="wave"
                bg="secondary"
                className="d-inline-block border border-dark"
                style={{ width: "100%", minHeight: "2em" }}
              ></Placeholder>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ width: "10%" }} className="text-center align-middle">
              <Placeholder
                animation="wave"
                bg="secondary"
                className="d-inline-block border border-dark"
                style={{ width: "100%", minHeight: "2em" }}
              ></Placeholder>
            </td>
            <td className="text-center align-middle">
              <Placeholder
                animation="wave"
                bg="secondary"
                className="d-inline-block border border-dark"
                style={{ width: "100%", minHeight: "2em" }}
              ></Placeholder>
            </td>
          </tr>
          {[...Array(8)].map((x, index) => (
            <tr key={`tr-${index}`}>
              <td style={{ width: "10%" }} className="text-center align-middle">
                <Placeholder
                  animation="wave"
                  bg="secondary"
                  className="d-inline-block border border-dark"
                  style={{ width: "100%", minHeight: "2em" }}
                ></Placeholder>
              </td>
              <td className="text-center align-middle">
                <Placeholder
                  animation="wave"
                  bg="secondary"
                  className="d-inline-block border border-dark"
                  style={{ width: "100%", minHeight: "2em" }}
                ></Placeholder>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};

export default HomePlaceHolder;
