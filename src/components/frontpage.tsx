import { Container, Image } from "react-bootstrap";

const FrontPage = () => (
  <Container className="d-flex align-items-center justify-content-center vh-100">
    <Image
      width={"60%"}
      alt="Ministry Mapper small logo"
      fluid
      src={`${process.env.PUBLIC_URL}/logo.png`}
    ></Image>
    <button
      onClick={() => {
        throw Error("Testing Sentry IO In Staging");
      }}
    >
      test error
    </button>
  </Container>
);

export default FrontPage;
