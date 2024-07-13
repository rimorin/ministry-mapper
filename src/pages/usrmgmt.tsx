import {
  Navbar,
  Container,
  Button,
  Form,
  FloatingLabel,
  Spinner
} from "react-bootstrap";
import { useLocation } from "react-router-dom";
import {
  Auth,
  applyActionCode,
  confirmPasswordReset,
  verifyPasswordResetCode
} from "firebase/auth";
import { auth as fbAuth } from "../firebase";
import { useEffect, useState } from "react";
import Loader from "../components/statics/loader";
import NavBarBranding from "../components/navigation/branding";
import { PASSWORD_POLICY, MINIMUM_PASSWORD_LENGTH } from "../utils/constants";
import PasswordChecklist from "react-password-checklist";
import { FirebaseError } from "firebase/app";
import { usePostHog } from "posthog-js/react";

const MODE_RESET_PASSWORD = "resetPassword";
const MODE_VERIFY_EMAIL = "verifyEmail";

const UserManagementComponent = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [validated, setValidated] = useState(false);
  const [message, setMessage] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [cloginPassword, setCloginPassword] = useState("");
  const [isLoginPasswordOk, setIsLoginPasswordOk] = useState(false);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const posthog = usePostHog();

  const mode = searchParams.get("mode") || "";
  const oobCode = searchParams.get("oobCode") || "";

  async function handleResetPassword(
    auth: Auth,
    actionCode: string
  ): Promise<void> {
    try {
      setIsResetting(true);
      await verifyPasswordResetCode(auth, actionCode);
      await confirmPasswordReset(auth, actionCode, loginPassword);
      posthog?.capture("password_reset");
      setMessage("Your password has been successfully reset.");
    } catch (error) {
      setMessage((error as FirebaseError).message);
    } finally {
      setIsResetting(false);
    }
  }

  async function handleVerifyEmail(
    auth: Auth,
    actionCode: string
  ): Promise<void> {
    try {
      setIsProcessing(true);
      await applyActionCode(auth, actionCode);
      posthog?.capture("email_verification");
      setMessage("Your email address has been verified.");
    } catch (error) {
      setMessage((error as FirebaseError).message);
    } finally {
      setIsProcessing(false);
    }
  }

  const resetCreationForm = () => {
    setLoginPassword("");
    setCloginPassword("");
    setValidated(false);
  };

  useEffect(() => {
    if (mode === MODE_VERIFY_EMAIL) {
      handleVerifyEmail(fbAuth, oobCode);
    }
  }, []);

  let managementComponent;
  switch (mode) {
    case MODE_RESET_PASSWORD:
      managementComponent = (
        <>
          <Form
            noValidate
            validated={validated}
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              handleResetPassword(fbAuth, oobCode);
            }}
            className="responsive-width"
          >
            <Form.Group className="mb-3 text-center">
              <h1>Reset Password</h1>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <FloatingLabel controlId="formBasicPassword" label="Password">
                <Form.Control
                  type="password"
                  placeholder="Password"
                  value={loginPassword}
                  required
                  onChange={(event) => setLoginPassword(event.target.value)}
                />
              </FloatingLabel>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicConfirmPassword">
              <FloatingLabel
                controlId="formBasicConfirmPassword"
                label="Confirm Password"
              >
                <Form.Control
                  type="password"
                  placeholder="Confirm Password"
                  value={cloginPassword}
                  onChange={(event) => setCloginPassword(event.target.value)}
                  required
                />
              </FloatingLabel>
            </Form.Group>
            <Form.Group className="mb-3">
              <PasswordChecklist
                rules={PASSWORD_POLICY}
                minLength={MINIMUM_PASSWORD_LENGTH}
                value={loginPassword}
                valueAgain={cloginPassword}
                onChange={(isValid) => setIsLoginPasswordOk(isValid)}
              />
            </Form.Group>
            <Form.Group className="text-center" controlId="formBasicButton">
              <Button
                variant="primary"
                type="submit"
                disabled={!isLoginPasswordOk}
              >
                {isResetting && (
                  <>
                    <Spinner size="sm" />{" "}
                  </>
                )}
                Submit
              </Button>
              <Button
                className="mx-2"
                variant="outline-primary"
                type="reset"
                onClick={() => resetCreationForm()}
              >
                Clear
              </Button>
            </Form.Group>
          </Form>
        </>
      );
      break;
    default:
      managementComponent = <div>Invalid Request</div>;
  }

  if (message) {
    managementComponent = (
      <div
        className="d-flex flex-column justify-content-between"
        style={{ height: "100%" }}
      >
        <div className="fluid-bolding mb-3">{message}</div>
      </div>
    );
  }

  if (isProcessing) return <Loader />;
  return (
    <>
      <div className="d-flex flex-column" style={{ minHeight: "99vh" }}>
        <Navbar bg="light">
          <Container fluid>
            <NavBarBranding naming="" />
          </Container>
        </Navbar>
        <Container
          fluid
          className="d-flex align-items-center justify-content-center"
          style={{ flexGrow: 1 }}
        >
          {managementComponent}
        </Container>
      </div>
    </>
  );
};

export default UserManagementComponent;
