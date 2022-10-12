import { Card, Container, Fade } from "react-bootstrap";

const InvalidPage = () => (
  <Container className="d-flex align-items-center justify-content-center vh-100">
    <Fade appear={true} in={true}>
      <Card className="border-0 align-items-center" style={{ width: "80%" }}>
        <Card.Img
          alt="Ministry Mapper logo"
          style={{ width: "30%" }}
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
