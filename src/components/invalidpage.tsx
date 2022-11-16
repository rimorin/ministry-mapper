import { Card, Container, Fade } from "react-bootstrap";
import "../css/main.css";
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

export default InvalidPage;
