import { FC, ReactNode } from "react";
import { Container } from "react-bootstrap";
import VersionDisplay from "../navigation/versiondisplay";
interface MainMiddlewareProps {
  children: ReactNode;
}

const MainMiddleware: FC<MainMiddlewareProps> = ({ children }) => {
  return (
    <Container className="pt-2" fluid>
      {children}
      <VersionDisplay />
    </Container>
  );
};

export default MainMiddleware;
