import { useContext, useEffect, useState } from "react";
import { Button, Container, Navbar } from "react-bootstrap";
import { MINISTRY_MAPPER_WIKI_PAGE } from "../utils/constants";
import NavBarBranding from "../components/navigation/branding";
import SignupComponent from "./signup";
import LoginComponent from "./signin";
import { StateContext } from "../components/utils/context";
import ForgotComponent from "./forgot";
import { auth } from "../firebase";
import { User } from "firebase/auth";
import { useRollbar } from "@rollbar/react";
import VerificationPage from "../components/navigation/verification";
import Admin from "./admin";
import Loader from "../components/statics/loader";
import { usePostHog } from "posthog-js/react";
const { VITE_ABOUT_URL } = import.meta.env;

const AboutURL = (VITE_ABOUT_URL || MINISTRY_MAPPER_WIKI_PAGE) as string;

const FrontPage = () => {
  const context = useContext(StateContext);
  const [loginUser, setLoginUser] = useState<User | null>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { frontPageMode } = context;
  const rollbar = useRollbar();
  const posthog = usePostHog();

  useEffect(() => {
    setIsLoading(true);
    auth.onAuthStateChanged(async (user) => {
      setLoginUser(user);
      setIsLoading(false);
      if (user) {
        const claims = await user.getIdTokenResult();
        const congregationAcl = claims.claims["congregations"] || {};
        rollbar.configure({
          payload: {
            person: {
              id: user.uid,
              name: user.displayName,
              email: user.email as string,
              verified: user.emailVerified,
              claims: congregationAcl
            }
          }
        });
      }
    });
  }, []);

  if (isLoading) return <Loader />;

  if (loginUser && !loginUser.emailVerified) {
    rollbar.info(
      `Unverified user attempting to access the system!! Email: ${loginUser.email}, Name: ${loginUser.displayName}`
    );
    return <VerificationPage user={loginUser} />;
  }

  if (loginUser) {
    return <Admin user={loginUser} />;
  }

  let componentToRender;
  switch (frontPageMode) {
    case "forgot":
      componentToRender = <ForgotComponent />;
      break;
    case "signup":
      componentToRender = <SignupComponent />;
      break;
    default:
      componentToRender = <LoginComponent />;
  }

  return (
    <>
      <div className="d-flex flex-column" style={{ minHeight: "99vh" }}>
        <Navbar bg="light">
          <Container fluid>
            <NavBarBranding naming="" />
            <div>
              <Button
                className="m-1"
                size="sm"
                variant="outline-primary"
                onClick={() => {
                  posthog?.capture("about_button_clicked");
                  window.open(AboutURL);
                }}
              >
                About
              </Button>
            </div>
          </Container>
        </Navbar>
        <Container
          fluid
          className="d-flex align-items-center justify-content-center"
          style={{ flexGrow: 1 }}
        >
          {componentToRender}
        </Container>
      </div>
    </>
  );
};

export default FrontPage;
