import { memo } from "react";
import { Container, Card } from "react-bootstrap";
import imgUrl from "/logo.png";
import { WelcomeProps } from "../../utils/interface";

const Welcome = memo(({ name }: WelcomeProps) => {
  return (
    <Container className="container-main">
      <Card className="card-main" style={{ width: "100%" }}>
        <Card.Img
          alt="Ministry Mapper main logo"
          className="mm-main-image"
          src={imgUrl}
        />
        <Card.Body>
          <Card.Title className="text-center">
            Welcome {name || "To Ministry Mapper"}
          </Card.Title>
          <Card.Text className="text-justify">
            Please select a territory from the above listing.
          </Card.Text>
        </Card.Body>
      </Card>
    </Container>
  );
});

export default Welcome;
