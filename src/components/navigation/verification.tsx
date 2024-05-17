import { Container, Card } from "react-bootstrap";
import { VerificationProps } from "../../utils/interface";
import UseAnotherButton from "./useanother";

const VerificationPage = ({
  handleClick,
  handleResendMail,
  name
}: VerificationProps) => (
  <Container className="container-main">
    <Card className="card-main">
      <Card.Img
        alt="Ministry Mapper logo"
        className="mm-logo"
        src="/android-chrome-192x192.png"
      />
      <Card.Body>
        <Card.Title className="text-center">
          We are sorry {name}! Please verify your email account before
          proceeding 🪪
        </Card.Title>
      </Card.Body>
      <>
        <span
          className="resend-text fluid-bolding fluid-text"
          onClick={handleResendMail}
        >
          Didn&#39;t receive verification email?
        </span>
      </>
      <>
        <UseAnotherButton handleClick={handleClick} />
      </>
    </Card>
  </Container>
);

export default VerificationPage;
