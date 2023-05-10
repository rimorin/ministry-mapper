import {
  ListGroup,
  Navbar,
  Offcanvas,
  Popover,
  Table,
  ProgressBar,
  Badge,
  Spinner,
  Button,
  Container,
  Fade,
  Card
} from "react-bootstrap";
import {
  BrandingProps,
  LegendProps,
  TerritoryListingProps,
  aggregateProp,
  AuthorizerProp,
  territoryHeaderProp,
  backToTopProp,
  SignInDifferentProps,
  VerificationProps,
  HelpButtonProps
} from "../utils/interface";
import Countdown from "react-countdown";
import { memo } from "react";
import { NotHomeIcon } from "./table";
import { TERRITORY_SELECTOR_VIEWPORT_HEIGHT } from "../utils/constants";
import { ReactComponent as TopArrowImage } from "../assets/top-arrow.svg";
import { ReactComponent as QuestionImage } from "../assets/question.svg";

const ComponentAuthorizer = ({
  requiredPermission,
  userPermission,
  children
}: AuthorizerProp) => {
  if (!userPermission) return <></>;
  const isUnAuthorized = userPermission < requiredPermission;
  if (isUnAuthorized) {
    return <></>;
  }
  return children;
};

const ExpiryTimePopover = (endtime: number) => {
  return (
    <Popover id="expiry-time-popover-basic">
      <Popover.Header as="h3" className="text-center">
        Expiry Details
      </Popover.Header>
      <Popover.Body>
        Territory slip will expire in{" "}
        <Countdown
          date={endtime}
          daysInHours={true}
          intervalDelay={100}
          precision={3}
          renderer={(props) => {
            const daysDisplay = props.days !== 0 ? <>{props.days}d </> : <></>;
            const hoursDisplay =
              props.hours !== 0 ? <>{props.hours}h </> : <></>;
            const minsDisplay =
              props.minutes !== 0 ? <>{props.minutes}m </> : <></>;
            return (
              <>
                {daysDisplay}
                {hoursDisplay}
                {minsDisplay}
                {props.formatted.seconds}s
              </>
            );
          }}
        />
      </Popover.Body>
    </Popover>
  );
};

const NavBarBranding = memo(({ naming }: BrandingProps) => {
  return (
    <Navbar.Brand className="brand-wrap">
      <img
        alt=""
        src={`${process.env.PUBLIC_URL}/favicon-32x32.png`}
        width="32"
        height="32"
        className="d-inline-block align-top"
      />{" "}
      <Navbar.Text className="fluid-bolding fluid-text">{naming}</Navbar.Text>
    </Navbar.Brand>
  );
});

const EnvironmentIndicator = memo(() => {
  if (process.env.REACT_APP_ROLLBAR_ENVIRONMENT?.startsWith("production"))
    return <></>;
  return (
    <ProgressBar
      now={100}
      animated
      style={{
        borderRadius: 0,
        position: "sticky",
        top: 0,
        fontWeight: "bold",
        zIndex: 1000
      }}
      label={`${process.env.REACT_APP_ROLLBAR_ENVIRONMENT} environment`}
    />
  );
});

const Legend = memo(({ showLegend, hideFunction }: LegendProps) => {
  return (
    <Offcanvas show={showLegend} onHide={hideFunction}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Legend</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Table>
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-center align-middle">✅</td>
              <td>Spoke to householder or Wrote Letter.</td>
            </tr>
            <tr>
              <td className="text-center align-middle">🚫</td>
              <td>Do not call or write letter.</td>
            </tr>
            <tr>
              <td className="text-center align-middle">
                <NotHomeIcon />
              </td>
              <td>
                Householder is not at home. Option to write a letter after a few
                tries.
              </td>
            </tr>
            <tr>
              <td className="text-center align-middle">✖️</td>
              <td>Unit doesn&#39;t exist for some reason.</td>
            </tr>
            <tr>
              <td className="text-center align-middle">🗒️</td>
              <td>Optional information about the unit. Avoid personal data.</td>
            </tr>
          </tbody>
        </Table>
      </Offcanvas.Body>
    </Offcanvas>
  );
});

const TerritoryListing = memo(
  ({
    showListing,
    hideFunction,
    selectedTerritory,
    handleSelect,
    territories,
    hideSelectedTerritory = false
  }: TerritoryListingProps) => {
    const currentTerritories = territories
      ? hideSelectedTerritory
        ? territories.filter((element) => element.code !== selectedTerritory)
        : territories
      : undefined;
    return (
      <Offcanvas
        placement={"bottom"}
        show={showListing}
        onHide={hideFunction}
        style={{ height: TERRITORY_SELECTOR_VIEWPORT_HEIGHT }}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Select Territory</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <ListGroup onSelect={handleSelect}>
            {currentTerritories &&
              currentTerritories.map((element) => (
                <ListGroup.Item
                  action
                  key={`list-group-item-${element.code}`}
                  eventKey={`${element.code}`}
                  active={selectedTerritory === element.code}
                >
                  {element.code} - {element.name}
                </ListGroup.Item>
              ))}
          </ListGroup>
        </Offcanvas.Body>
      </Offcanvas>
    );
  }
);

const AggregationBadge = memo(
  ({ aggregate = 0, isDataFetched }: aggregateProp) => {
    let badgeStyle = "";
    let statusColor = "success";
    if (aggregate > 70 && aggregate <= 90) {
      statusColor = "warning";
      badgeStyle = "aggregate-dark-text";
    }
    if (aggregate > 90) statusColor = "danger";
    return (
      <span style={{ marginRight: "0.25rem" }}>
        {isDataFetched ? (
          <Badge pill bg={statusColor} className={badgeStyle}>
            {aggregate}%
          </Badge>
        ) : (
          <Spinner as="span" animation="border" size="sm" aria-hidden="true" />
        )}
      </span>
    );
  }
);

const TerritoryHeader = memo(({ name }: territoryHeaderProp) => {
  if (!name) return <></>;
  return (
    <Container
      fluid
      className="text-center bg-light py-2 fw-bolder text-success border-top"
    >
      {name}
    </Container>
  );
});

const BackToTopButton = memo(({ showButton }: backToTopProp) => (
  <Fade in={showButton}>
    <div
      onClick={() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      }}
      className="back-to-top"
    >
      <TopArrowImage />
    </div>
  </Fade>
));

const UseAnotherButton = ({ handleClick }: SignInDifferentProps) => (
  <Button variant="secondary" onClick={handleClick}>
    Use Another Account
  </Button>
);

const UnauthorizedPage = ({ handleClick, name }: SignInDifferentProps) => (
  <Container className="container-main">
    <Card className="card-main">
      <Card.Img
        alt="Ministry Mapper logo"
        className="mm-logo"
        src={`${process.env.PUBLIC_URL}/android-chrome-192x192.png`}
      />
      <Card.Body>
        <Card.Title className="text-center">
          401 Unauthorized Access 🔐
        </Card.Title>
        <Card.Text className="text-justify">
          We are sorry {name}! You are not authorised to access this page.
        </Card.Text>
      </Card.Body>
      <UseAnotherButton handleClick={handleClick} />
    </Card>
  </Container>
);

const VerificationPage = ({
  handleClick,
  handleResendMail,
  name
}: VerificationProps) => (
  <Container className="container-main">
    <Fade appear={true} in={true}>
      <Card className="card-main">
        <Card.Img
          alt="Ministry Mapper logo"
          className="mm-logo"
          src={`${process.env.PUBLIC_URL}/android-chrome-192x192.png`}
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
    </Fade>
  </Container>
);

const HelpButton = memo(
  ({ link, isWarningButton = false }: HelpButtonProps) => (
    <QuestionImage
      className={`help-button ${isWarningButton ? "warning-help-button" : ""}`}
      onClick={() => window.open(link)}
    />
  )
);

export {
  NavBarBranding,
  Legend,
  TerritoryListing,
  ExpiryTimePopover,
  AggregationBadge,
  ComponentAuthorizer,
  EnvironmentIndicator,
  TerritoryHeader,
  BackToTopButton,
  UnauthorizedPage,
  VerificationPage,
  HelpButton
};
