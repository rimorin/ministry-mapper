import { useContext, useRef, useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { Form, Button, Spinner, FloatingLabel } from "react-bootstrap";
import { auth } from "../firebase";
import { FirebaseError } from "firebase/app";
import { useRollbar } from "@rollbar/react";
import errorHandler from "../utils/helpers/errorhandler";
import errorMessage from "../utils/helpers/errormsg";
import { StateContext } from "../components/utils/context";

const ForgotComponent = () => {
  const [loginEmail, setLoginEmail] = useState("");
  const [validated, setValidated] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const rollbar = useRollbar();
  const formRef = useRef<HTMLInputElement>(null);

  const { setFrontPageMode } = useContext(StateContext);

  const handleForgotPassword = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();
    setValidated(true);
    if (form.checkValidity() === false) {
      return;
    }
    try {
      setIsProcessing(true);
      await sendPasswordResetEmail(auth, loginEmail);
      rollbar.info(`User attempting to reset password! Email: ${loginEmail}`);
      alert(`Password reset email sent to ${loginEmail}.`);
    } catch (error) {
      errorHandler(errorMessage(error as FirebaseError), rollbar);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Form
        noValidate
        validated={validated}
        onSubmit={handleForgotPassword}
        className="responsive-width"
      >
        <Form.Group className="mb-3 text-center">
          <h1>Forgotten your password ?</h1>
        </Form.Group>
        <Form.Group className="mb-3 text-center">
          <span>
            Enter your email address below and we will send you a link to reset
            your password.
          </span>
        </Form.Group>
        <Form.Group className="my-3" controlId="formBasicEmail">
          <FloatingLabel controlId="formBasicEmail" label="Email address">
            <Form.Control
              ref={formRef}
              type="email"
              placeholder="Email Address"
              value={loginEmail}
              required
              onChange={(e) => {
                setLoginEmail(e.target.value);
              }}
            />
            <Form.Control.Feedback type="invalid">
              Please enter a valid email.
            </Form.Control.Feedback>
          </FloatingLabel>
        </Form.Group>
        <Form.Group className="text-center" controlId="formBasicButton">
          <Button variant="outline-primary" className="m-2" type="submit">
            {isProcessing && (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  aria-hidden="true"
                />{" "}
              </>
            )}
            Continue
          </Button>
          <Button
            className="mx-2"
            variant="outline-primary"
            type="reset"
            onClick={() => {
              setLoginEmail("");
              setValidated(false);
            }}
          >
            Clear
          </Button>
        </Form.Group>
        <Form.Group className="text-center" controlId="formBasicButton">
          <hr />
          <p>
            Already have an account?{" "}
            <span
              style={{ cursor: "pointer", color: "blue" }}
              onClick={() => setFrontPageMode("login")}
            >
              Sign In
            </span>
          </p>
        </Form.Group>
      </Form>
    </>
  );
};

export default ForgotComponent;
