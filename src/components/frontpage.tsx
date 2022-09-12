import { Container, Image } from "react-bootstrap";

const FrontPage = () => (
  <Container className="d-flex align-items-center justify-content-center vh-100">
    <Image
      width={"60%"}
      alt="Ministry Mapper small logo"
      fluid
      src={`${process.env.PUBLIC_URL}/logo.png`}
    ></Image>
  </Container>
);

export default FrontPage;
