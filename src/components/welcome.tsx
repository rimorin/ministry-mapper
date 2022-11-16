import { Card, Container } from "react-bootstrap";
import { LOGIN_TYPE_CODES } from "./util";

const Welcome = ({ loginType = LOGIN_TYPE_CODES.CONDUCTOR }) => {
  let message =
    "Please select a territory from the above listing to begin assigning slips to the publishers.";

  if (loginType === LOGIN_TYPE_CODES.ADMIN) {
    message =
      "Please select a territory from the above listing to begin administration.";
  }
  return (
    <Container className="container-main" style={{ height: "80vh" }}>
      <Card className="border-0 align-items-center">
        <Card.Img
          alt="Ministry Mapper main logo"
          className="mm-main-image"
          src={`${process.env.PUBLIC_URL}/logo.png`}
        />
        <Card.Body>
          <Card.Title className="text-center">
            Welcome To Ministry Mapper
          </Card.Title>
          <Card.Text className="text-justify">{message}</Card.Text>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Welcome;
