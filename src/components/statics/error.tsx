import React from "react";
import { Container, Card, Button } from "react-bootstrap";
import { useRouteError } from "react-router-dom";

interface ErrorPageProps {
  onRetry?: () => void;
}

const GenericErrorPage: React.FC<ErrorPageProps> = ({ onRetry }) => {
  const error = useRouteError() as Error;
  const title = "An Error Occurred";
  const message = "We are sorry, something went wrong.";

  return (
    <Container className="container-main">
      <Card className="card-main">
        <Card.Img
          alt="Ministry Mapper logo"
          className="mm-logo"
          src="/android-chrome-192x192.png"
        />
        <Card.Body>
          <Card.Title className="text-center">{title}</Card.Title>
          <Card.Text className="text-center">{message}</Card.Text>
          {error && (
            <Card.Text className="text-center">
              <small>{error.message}</small>
            </Card.Text>
          )}
          {onRetry && (
            <div className="text-center">
              <Button onClick={onRetry}>Retry</Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default GenericErrorPage;
