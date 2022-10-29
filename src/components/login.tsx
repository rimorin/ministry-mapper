import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Card, Form, Button, Container, Spinner } from "react-bootstrap";
import { auth } from "../firebase";
import { LoginProps } from "./interface";
import { FirebaseError } from "firebase/app";
import { errorHandler, errorMessage } from "./util";
import { useRollbar } from "@rollbar/react";

const Login = ({ loginType }: LoginProps) => {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [validated, setValidated] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
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

  return (
    <Container
      fluid
      className="d-flex align-items-center justify-content-center vh-100"
    >
      <Card style={{ width: "80%" }}>
        <Card.Header className="text-center">{loginType} Login</Card.Header>
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
                onChange={(e) => setLoginPassword(e.target.value)}
              />
              <Form.Control.Feedback type="invalid">
                Please enter password.
              </Form.Control.Feedback>
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
  );
};

export default Login;
