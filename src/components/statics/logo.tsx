import { memo } from "react";
import { Container, Image } from "react-bootstrap";

const FrontLogo = memo(() => (
  <Container className="container-main">
    <Image
      width={"60%"}
      alt="Ministry Mapper small logo"
      fluid
      src={`${process.env.PUBLIC_URL}/logo.png`}
    ></Image>
  </Container>
));

export default FrontLogo;
