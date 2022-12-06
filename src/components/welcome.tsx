import { Card, Container } from "react-bootstrap";
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

export default Welcome;
