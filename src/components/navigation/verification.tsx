import { Container, Card, Spinner } from "react-bootstrap";
import { VerificationProps } from "../../utils/interface";
import UseAnotherButton from "./useanother";
import { sendEmailVerification, signOut } from "firebase/auth";
import { useCallback, useState } from "react";
import { auth } from "../../firebase";
import { FirebaseError } from "firebase/app";
import errorHandler from "../../utils/helpers/errorhandler";
import errorMessage from "../../utils/helpers/errormsg";
import { useRollbar } from "@rollbar/react";

const VerificationPage = ({ user }: VerificationProps) => {
  const [isSending, setIsSending] = useState(false);
  const rollbar = useRollbar();
  const handleResendMail = useCallback(async () => {
    setIsSending(true);
    try {
      await sendEmailVerification(user);
      alert(
        "Resent verification email! Please check your inbox or spam folder."
      );
    } catch (error) {
      errorHandler(errorMessage(error as FirebaseError), rollbar, true);
    } finally {
      setIsSending(false);
    }
  }, [user]);

  const handleClick = useCallback(() => {
    signOut(auth);
  }, []);

  return (
    <Container className="container-main">
      <Card className="card-main">
        <Card.Img
          alt="Ministry Mapper logo"
          className="mm-logo"
          src="/android-chrome-192x192.png"
        />
        <Card.Body>
          <Card.Title className="text-center">
            We are sorry {user.displayName}! Please verify your email account
            before proceeding 🪪
          </Card.Title>
        </Card.Body>
        <>
          <span
            className="resend-text fluid-bolding fluid-text"
            onClick={handleResendMail}
          >
            Didn&#39;t receive verification email ?{" "}
            {isSending && (
              <Spinner
                size="sm"
                style={{
                  marginLeft: "5px"
                }}
              />
            )}
          </span>
        </>
        <>
          <UseAnotherButton handleClick={handleClick} />
        </>
      </Card>
    </Container>
  );
};

export default VerificationPage;
