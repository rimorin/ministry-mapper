import { memo } from "react";
import { Container, Image } from "react-bootstrap";
import imgUrl from "/logo.png";

const FrontLogo = memo(() => (
  <Container className="container-main">
    <Image
      width={"60%"}
      alt="Ministry Mapper small logo"
      fluid
      src={imgUrl}
    ></Image>
  </Container>
));

export default FrontLogo;
