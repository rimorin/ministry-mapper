import { useContext, useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile
} from "firebase/auth";
import { Form, Button, Spinner, FloatingLabel } from "react-bootstrap";
import PasswordChecklist from "react-password-checklist";
import { auth } from "../firebase";
import { FirebaseError } from "firebase/app";
import { useRollbar } from "@rollbar/react";
import errorHandler from "../utils/helpers/errorhandler";
import errorMessage from "../utils/helpers/errormsg";
import { PASSWORD_POLICY, MINIMUM_PASSWORD_LENGTH } from "../utils/constants";
import { StateContext } from "../components/utils/context";
import { usePostHog } from "posthog-js/react";
const { VITE_PRIVACY_URL, VITE_TERMS_URL } = import.meta.env;

const SignupComponent = () => {
  const [validated, setValidated] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [cloginPassword, setCloginPassword] = useState("");
  const [isLoginPasswordOk, setIsLoginPasswordOk] = useState(false);
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const rollbar = useRollbar();
  const posthog = usePostHog();

  const { setFrontPageMode } = useContext(StateContext);
  const privacyUrl = VITE_PRIVACY_URL;
  const termsUrl = VITE_TERMS_URL;

  const handleCreateSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();
    setValidated(true);
    if (form.checkValidity() === false) {
      return;
    }
    setIsCreating(true);
    try {
      const credentials = await createUserWithEmailAndPassword(
        auth,
        loginEmail,
        loginPassword
      );
      await updateProfile(credentials.user, {
        displayName: name
      });
      posthog?.capture("signup", {
        email: loginEmail,
        name
      });
      rollbar.info(`New User Created! Email: ${loginEmail}, Name: ${name}`);
      await sendEmailVerification(credentials.user);
      alert(
        "Account created! Please check your email for verification procedures."
      );
    } catch (err) {
      setValidated(false);
      errorHandler(errorMessage(err as FirebaseError), rollbar);
    } finally {
      setIsCreating(false);
    }
  };

  const resetCreationForm = () => {
    setLoginPassword("");
    setLoginEmail("");
    setName("");
    setCloginPassword("");
    setValidated(false);
  };
  return (
    <>
      <Form
        noValidate
        validated={validated}
        onSubmit={handleCreateSubmit}
        className="responsive-width"
      >
        <Form.Group className="mb-3 text-center">
          <h1>Sign Up</h1>
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicName">
          <FloatingLabel controlId="formBasicName" label="User Name">
            <Form.Control
              type="name"
              placeholder="Enter Name"
              value={name}
              required
              onChange={(e) => setName(e.target.value)}
            />
          </FloatingLabel>
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <FloatingLabel controlId="formBasicEmail" label="Email Address">
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={loginEmail}
              required
              onChange={(e) => setLoginEmail(e.target.value)}
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
        <Form.Group className="text-center mb-3">
          <p>
            By signing up, you agree to our{" "}
            <a href={privacyUrl} target="_blank" rel="noopener noreferrer">
              privacy policy
            </a>{" "}
            and our{" "}
            <a href={termsUrl} target="_blank" rel="noopener noreferrer">
              terms of service
            </a>
            .
          </p>
        </Form.Group>
        <Form.Group className="text-center" controlId="formBasicButton">
          <Button
            variant="outline-primary"
            className={`m-2 ${!isLoginPasswordOk && "disabled"}`}
            type="submit"
          >
            {isCreating && (
              <>
                <Spinner size="sm" />{" "}
              </>
            )}
            Sign Up
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

export default SignupComponent;
