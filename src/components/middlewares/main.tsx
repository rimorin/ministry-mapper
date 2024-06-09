import { FC, ReactNode } from "react";
import { Container } from "react-bootstrap";
import VersionDisplay from "../navigation/versiondisplay";
import EnvironmentIndicator from "../navigation/environment";
interface MainMiddlewareProps {
  children: ReactNode;
}

const MainMiddleware: FC<MainMiddlewareProps> = ({ children }) => {
  return (
    <Container
      className="p-2"
      fluid
      style={{
        minHeight: "95vh"
      }}
    >
      <EnvironmentIndicator
        environment={import.meta.env.VITE_ROLLBAR_ENVIRONMENT}
      />
      {children}
      <VersionDisplay />
    </Container>
  );
};

export default MainMiddleware;
