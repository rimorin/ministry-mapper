import { useState } from "react";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword
} from "firebase/auth";
import { Card, Form, Button, Container, Spinner, Modal } from "react-bootstrap";
import { auth } from "../firebase";
import { FirebaseError } from "firebase/app";
import { useRollbar } from "@rollbar/react";
import { errorHandler, errorMessage } from "../utils/helpers";

const Login = () => {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [validated, setValidated] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const rollbar = useRollbar();

  const loginInWithEmailAndPassword = async (
    email: string,
    password: string
  ) => {
    try {
      setIsLogin(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setValidated(false);
      errorHandler(errorMessage((err as FirebaseError).code), rollbar);
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

  const handleForgotPassword = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      setIsSending(true);
      const { value } = event.currentTarget.email;
      await sendPasswordResetEmail(auth, value);
      toggleForgotPassword();
      rollbar.info(`User attempting to reset password! Email: ${value}`);
      alert(`Password reset email sent to ${value}.`);
    } catch (error) {
      errorHandler(errorMessage((error as FirebaseError).code), rollbar);
    } finally {
      setIsSending(false);
    }
  };

  const toggleForgotPassword = () => setIsForgotPassword(!isForgotPassword);

  return (
    <>
      <Container
        fluid
        className="d-flex align-items-center justify-content-center vh-100"
      >
        <Card style={{ width: "80%" }}>
          <Card.Header className="text-center">Login</Card.Header>
          <Card.Body>
            <Form noValidate validated={validated} onSubmit={handleLoginSubmit}>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Email Address</Form.Label>
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
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Password"
                  value={loginPassword}
                  required
                  onChange={(event) => setLoginPassword(event.target.value)}
                />
                <Form.Control.Feedback type="invalid">
                  Please enter password.
                </Form.Control.Feedback>
                <div className="text-end">
                  <Form.Text
                    onClick={toggleForgotPassword}
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
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        aria-hidden="true"
                      />{" "}
                    </>
                  )}
                  Login
                </Button>
                <Button
                  className="mx-2"
                  variant="outline-primary"
                  type="reset"
                  onClick={(e) => {
                    setLoginPassword("");
                    setLoginEmail("");
                    setValidated(false);
                  }}
                >
                  Clear
                </Button>
              </Form.Group>
            </Form>
          </Card.Body>
        </Card>
      </Container>
      <Modal show={isForgotPassword}>
        <Modal.Header>
          <Modal.Title>Forgot Password ?</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleForgotPassword}>
          <Modal.Body>
            <p>We will email a link to reset your password.</p>
            <Form.Group className="mb-3" controlId="formBasicResetEmail">
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter Login Email"
                required
              />
              <Form.Control.Feedback type="invalid">
                Please enter a valid email.
              </Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="justify-content-around">
            <Button variant="secondary" onClick={toggleForgotPassword}>
              Close
            </Button>
            <Button type="submit" variant="primary">
              {isSending && (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    aria-hidden="true"
                  />{" "}
                </>
              )}
              Send
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default Login;
