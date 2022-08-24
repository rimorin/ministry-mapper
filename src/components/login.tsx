import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Card, Form, Button, Container } from "react-bootstrap";
import { auth } from "../firebase";
import Loader from "./loader";
import { LoginProps } from "./interface";

const Login = ({ loginType }: LoginProps) => {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [validated, setValidated] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

  const loginInWithEmailAndPassword = async (
    email: string,
    password: string
  ) => {
    try {
      setIsLogin(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      alert(err);
      setValidated(false);
    }
    setIsLogin(false);
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

  if (isLogin) {
    return <Loader />;
  }
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
              <Form.Label>Email address</Form.Label>
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
