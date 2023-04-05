import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile
} from "firebase/auth";
import {
  Form,
  Button,
  Container,
  Spinner,
  Modal,
  Fade,
  Navbar
} from "react-bootstrap";
import { auth } from "../firebase";
import { FirebaseError } from "firebase/app";
import { useRollbar } from "@rollbar/react";
import { errorHandler, errorMessage } from "../utils/helpers";
import PasswordChecklist from "react-password-checklist";
import {
  MINIMUM_PASSWORD_LENGTH,
  MINISTRY_MAPPER_INFORMATION_PAGE,
  PASSWORD_POLICY
} from "../utils/constants";
import { NavBarBranding } from "../components/navigation";
import { FrontLogo } from "../components/static";

const FrontPage = () => {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [cloginPassword, setCloginPassword] = useState("");
  const [isLoginPasswordOk, setIsLoginPasswordOk] = useState(false);
  const [name, setName] = useState("");
  const [validated, setValidated] = useState(false);
  const [isCreate, setIsCreate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const rollbar = useRollbar();

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
      rollbar.info(`New User Created! Email: ${loginEmail}, Name: ${name}`);
      await sendEmailVerification(credentials.user);
      alert(
        "Account created! Please check your email for verification procedures."
      );
      setIsCreate(false);
    } catch (err) {
      setValidated(false);
      errorHandler(errorMessage((err as FirebaseError).code), rollbar);
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

  const toggleCreationForm = () => {
    setIsCreate(!isCreate);
  };

  return (
    <Fade appear={true} in={true}>
      <>
        <Navbar bg="light" expand="sm">
          <Container fluid>
            <NavBarBranding naming="" />
            <div>
              <Button
                className="m-1"
                size="sm"
                variant="outline-primary"
                onClick={() => window.open(MINISTRY_MAPPER_INFORMATION_PAGE)}
              >
                About
              </Button>
              <Button
                className="m-1"
                size="sm"
                variant="outline-primary"
                onClick={() => {
                  resetCreationForm();
                  toggleCreationForm();
                }}
              >
                Create Account
              </Button>
            </div>
          </Container>
        </Navbar>
        <FrontLogo />
        <Modal show={isCreate}>
          <Modal.Header>
            <Modal.Title>Create Account</Modal.Title>
          </Modal.Header>
          <Form noValidate validated={validated} onSubmit={handleCreateSubmit}>
            <Modal.Body>
              <Form.Group className="mb-3" controlId="formBasicName">
                <Form.Label>User Name</Form.Label>
                <Form.Control
                  type="name"
                  placeholder="Enter Name"
                  value={name}
                  required
                  onChange={(e) => setName(e.target.value)}
                />
              </Form.Group>
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
                  value={loginPassword}
                  required
                  onChange={(event) => setLoginPassword(event.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicConfirmPassword">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  value={cloginPassword}
                  onChange={(event) => setCloginPassword(event.target.value)}
                  required
                />
              </Form.Group>
              <PasswordChecklist
                rules={PASSWORD_POLICY}
                minLength={MINIMUM_PASSWORD_LENGTH}
                value={loginPassword}
                valueAgain={cloginPassword}
                onChange={(isValid) => setIsLoginPasswordOk(isValid)}
              />
            </Modal.Body>
            <Modal.Footer className="justify-content-around">
              <Button
                variant="outline-primary"
                className={`m-2 ${!isLoginPasswordOk && "disabled"}`}
                type="submit"
              >
                {isCreating && (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      aria-hidden="true"
                    />{" "}
                  </>
                )}
                Create
              </Button>
              <Button
                className="mx-2"
                variant="outline-primary"
                type="reset"
                onClick={() => resetCreationForm()}
              >
                Clear
              </Button>
              <Button
                className="mx-2"
                variant="outline-primary"
                type="button"
                onClick={() => toggleCreationForm()}
              >
                Cancel
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </>
    </Fade>
  );
};

export default FrontPage;
