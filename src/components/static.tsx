import { Container, Card, Image, Fade, Spinner } from "react-bootstrap";
const Welcome = () => {
  return (
    <Container className="container-main" style={{ height: "80vh" }}>
      <Card className="card-main" style={{ width: "100%" }}>
        <Card.Img
          alt="Ministry Mapper main logo"
          className="mm-main-image"
          src={`${process.env.PUBLIC_URL}/logo.png`}
        />
        <Card.Body>
          <Card.Title className="text-center">
            Welcome To Ministry Mapper
          </Card.Title>
          <Card.Text className="text-justify">
            Please select a territory from the above listing.
          </Card.Text>
        </Card.Body>
      </Card>
    </Container>
  );
};

const FrontPage = () => (
  <Container className="container-main">
    <Image
      width={"60%"}
      alt="Ministry Mapper small logo"
      fluid
      src={`${process.env.PUBLIC_URL}/logo.png`}
    ></Image>
  </Container>
);

const InvalidPage = () => (
  <Container className="container-main">
    <Fade appear={true} in={true}>
      <Card className="card-main">
        <Card.Img
          alt="Ministry Mapper logo"
          className="mm-logo"
          src={`${process.env.PUBLIC_URL}/android-chrome-192x192.png`}
        />
        <Card.Body>
          <Card.Title className="text-center">
            This link has expired ⌛
          </Card.Title>
        </Card.Body>
      </Card>
    </Fade>
  </Container>
);

const MaintenanceMode = () => (
  <Container className="container-main">
    <Card className="card-main">
      <Card.Img
        alt="Ministry Mapper logo"
        className="mm-logo"
        src={`${process.env.PUBLIC_URL}/android-chrome-192x192.png`}
      />
      <Card.Body>
        <Card.Title className="text-center">
          Ministry Mapper is currently down for maintenance. 🚧
        </Card.Title>
        <Card.Text className="text-justify">
          We expect to be back online in a shortwhile. Thank you for your
          patience.
        </Card.Text>
      </Card.Body>
    </Card>
  </Container>
);

const NotFoundPage = () => (
  <Container className="container-main">
    <Card className="card-main">
      <Card.Img
        alt="Ministry Mapper logo"
        className="mm-logo"
        src={`${process.env.PUBLIC_URL}/android-chrome-192x192.png`}
      />
      <Card.Body>
        <Card.Title className="text-center">404 Page Not Found 🚫</Card.Title>
        <Card.Text className="text-justify">
          We are sorry, the page you requested could not be found.
        </Card.Text>
      </Card.Body>
    </Card>
  </Container>
);

const UnauthorizedPage = () => (
  <Container className="container-main">
    <Card className="card-main">
      <Card.Img
        alt="Ministry Mapper logo"
        className="mm-logo"
        src={`${process.env.PUBLIC_URL}/android-chrome-192x192.png`}
      />
      <Card.Body>
        <Card.Title className="text-center">
          401 Unauthorized Access 🔐
        </Card.Title>
        <Card.Text className="text-justify">
          We are sorry, you are not authorised to access this page.
        </Card.Text>
      </Card.Body>
    </Card>
  </Container>
);

const Loader = () => (
  <Container
    className="d-flex align-items-center justify-content-center vh-100"
    fluid
  >
    <Spinner animation="border" variant="primary" role="status" />
  </Container>
);

export {
  Welcome,
  FrontPage,
  InvalidPage,
  MaintenanceMode,
  NotFoundPage,
  UnauthorizedPage,
  Loader
};
