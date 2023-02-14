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
  OverlayTrigger,
  Container
} from "react-bootstrap";
import {
  BrandingProps,
  LegendProps,
  TerritoryListingProps,
  aggregateProp,
  ExpiryButtonProp,
  AuthorizerProp,
  territoryHeaderProp
} from "../utils/interface";
import Countdown from "react-countdown";
import { memo } from "react";
import { NotHomeIcon } from "./table";
import { TERRITORY_SELECTOR_VIEWPORT_HEIGHT } from "../utils/constants";

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

const ExpiryButton = memo(({ endtime }: ExpiryButtonProp) => {
  return (
    <OverlayTrigger
      trigger="click"
      placement="auto"
      overlay={ExpiryTimePopover(endtime)}
      rootClose={true}
    >
      <Button className="me-2 mb-1 fluid-button">Time</Button>
    </OverlayTrigger>
  );
});

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
      <Navbar.Text className="fluid-branding">{naming}</Navbar.Text>
    </Navbar.Brand>
  );
});

const EnvironmentIndicator = memo(() => {
  if (process.env.REACT_APP_ROLLBAR_ENVIRONMENT === "production") return <></>;
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
              <td>Unit doesn't exist for some reason.</td>
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
    territories
  }: TerritoryListingProps) => {
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
            {territories &&
              territories.map((element) => (
                <ListGroup.Item
                  action
                  key={`listgroup-item-${element.code}`}
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
    <Container className="text-center bg-light py-2 fw-bolder text-success border-top">
      {name}
    </Container>
  );
});

export {
  NavBarBranding,
  Legend,
  TerritoryListing,
  ExpiryTimePopover,
  ExpiryButton,
  AggregationBadge,
  ComponentAuthorizer,
  EnvironmentIndicator,
  TerritoryHeader
};
