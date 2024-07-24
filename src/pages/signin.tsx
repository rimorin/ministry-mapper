import { useContext, useRef, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Form, Button, Spinner, FloatingLabel } from "react-bootstrap";
import { auth } from "../firebase";
import { FirebaseError } from "firebase/app";
import { useRollbar } from "@rollbar/react";
import errorHandler from "../utils/helpers/errorhandler";
import errorMessage from "../utils/helpers/errormsg";
import { StateContext } from "../components/utils/context";
import { usePostHog } from "posthog-js/react";

const LoginComponent = () => {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [validated, setValidated] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const rollbar = useRollbar();
  const formRef = useRef<HTMLInputElement>(null);
  const posthog = usePostHog();

  const { setFrontPageMode } = useContext(StateContext);

  const loginInWithEmailAndPassword = async (
    email: string,
    password: string
  ) => {
    try {
      setIsLogin(true);
      await signInWithEmailAndPassword(auth, email, password);
      posthog?.capture("login", {
        email
      });
    } catch (err) {
      setValidated(false);
      errorHandler(errorMessage(err as FirebaseError), rollbar);
    } finally {
      setIsLogin(false);
    }
  };

  const handleLoginSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();
    setValidated(true);
    if (form.checkValidity() === false) {
      return;
    }
    loginInWithEmailAndPassword(loginEmail, loginPassword);
  };

  return (
    <>
      <Form
        noValidate
        validated={validated}
        onSubmit={handleLoginSubmit}
        className="responsive-width"
      >
        <Form.Group className="mb-3 text-center">
          <h1>Sign in</h1>
        </Form.Group>
        <Form.Group className="my-3" controlId="formBasicEmail">
          <FloatingLabel controlId="formBasicEmail" label="Email address">
            <Form.Control
              ref={formRef}
              type="email"
              placeholder="Enter email"
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
          <Form.Control.Feedback>Looks Good!</Form.Control.Feedback>
          <Form.Control.Feedback type="invalid">
            Please enter password.
          </Form.Control.Feedback>
          <div className="text-end">
            <Form.Text
              onClick={() => setFrontPageMode("forgot")}
              className="forgot-password"
              muted
            >
              Forgot Password?
            </Form.Text>
          </div>
        </Form.Group>
        <Form.Group className="text-center" controlId="formBasicButton">
          <Button variant="outline-primary" className="m-2" type="submit">
            {isLogin && (
              <>
                <Spinner size="sm" />{" "}
              </>
            )}
            Sign In
          </Button>
          <Button
            className="mx-2"
            variant="outline-primary"
            type="reset"
            onClick={() => {
              setLoginPassword("");
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
            Dont have an account?{" "}
            <span
              style={{ cursor: "pointer", color: "blue" }}
              onClick={() => setFrontPageMode("signup")}
            >
              Sign Up
            </span>
          </p>
        </Form.Group>
      </Form>
    </>
  );
};

export default LoginComponent;
