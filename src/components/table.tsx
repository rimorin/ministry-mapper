import { memo } from "react";
import { Badge, Button, Card, Col, Image, Row, Table } from "react-bootstrap";
import {
  DEFAULT_FLOOR_PADDING,
  STATUS_CODES,
  HOUSEHOLD_TYPES,
  USER_ACCESS_LEVELS,
  DEFAULT_UNIT_DNC_MS_TIME,
  TERRITORY_TYPES
} from "../utils/constants";
import { ZeroPad } from "../utils/helpers";
import {
  unitProps,
  nothomeProps,
  floorHeaderProp,
  tableHeaderProp,
  territoryTableProps,
  territoryLandedProps
} from "../utils/interface";
import envelopeImage from "../assets/envelope.svg";
import { ComponentAuthorizer } from "./navigation";

const TableHeader = memo(({ floors, maxUnitNumber = 2 }: tableHeaderProp) => {
  return (
    <>
      <thead className="sticky-top-cell">
        <tr>
          <th scope="col" className="text-center align-middle sticky-left-cell">
            lvl/unit
          </th>
          {floors &&
            floors[0].units.map((item, index) => (
              <th
                key={`${index}-${item.number}`}
                scope="col"
                className="text-center align-middle"
              >
                {ZeroPad(item.number, maxUnitNumber)}
              </th>
            ))}
        </tr>
      </thead>
    </>
  );
});

const FloorHeader = memo(({ index, floor }: floorHeaderProp) => (
  <th
    className="sticky-left-cell text-center align-middle"
    key={`${index}-${floor}`}
    scope="row"
  >
    {ZeroPad(floor, DEFAULT_FLOOR_PADDING)}
  </th>
));

const UnitStatus = memo((props: unitProps) => {
  const householdRace = props.type;
  const note = props.note;
  const currentStatus = props.status;
  const nhcount = props.nhcount;
  const languages = props.languages;
  const isTrackRace = props.trackRace || false;
  const isTrackLanguages = props.trackLanguages || false;
  let status = "";

  if (currentStatus === STATUS_CODES.INVALID) {
    return <>✖️</>;
  }
  if (currentStatus === STATUS_CODES.DONE) {
    status = "✅ ";
  }

  if (currentStatus === STATUS_CODES.DO_NOT_CALL) {
    status = "🚫 ";
  }

  return (
    <>
      {currentStatus !== STATUS_CODES.NOT_HOME && <>{status}</>}
      {currentStatus === STATUS_CODES.NOT_HOME && (
        <NotHomeIcon nhcount={nhcount} classProp={"me-1"} />
      )}
      {note && <>🗒️ </>}
      {isTrackRace && householdRace !== HOUSEHOLD_TYPES.CHINESE && (
        <Badge bg="secondary" className="me-1" pill>
          {householdRace}
        </Badge>
      )}
      {isTrackLanguages && languages && <span>{languages.toUpperCase()}</span>}
    </>
  );
});

const NotHomeIcon = memo(({ nhcount, classProp }: nothomeProps) => {
  let containerClass = "container-nothome";
  if (classProp) containerClass += ` ${classProp}`;
  return (
    <span className={containerClass}>
      <Image fluid src={envelopeImage} className="nothome-envelope" />
      {nhcount && <div className="badge-nothome">{nhcount}</div>}
    </span>
  );
});

const PublisherTerritoryTable = ({
  postalCode,
  floors,
  maxUnitNumberLength,
  completedPercent,
  policy,
  trackRace,
  trackLanguages,
  territoryType,
  handleUnitStatusUpdate
}: territoryTableProps) => {
  if (territoryType === TERRITORY_TYPES.PRIVATE) {
    return (
      <PrivateTerritoryTable
        isAdmin={false}
        postalCode={postalCode}
        houses={floors[0]}
        policy={policy}
        completedPercent={completedPercent}
        trackLanguages={trackLanguages}
        trackRace={trackRace}
        handleHouseUpdate={handleUnitStatusUpdate}
      />
    );
  }
  return (
    <PublicTerritoryTable
      postalCode={postalCode}
      floors={floors}
      maxUnitNumberLength={maxUnitNumberLength}
      policy={policy}
      completedPercent={completedPercent}
      trackLanguages={trackLanguages}
      trackRace={trackRace}
      handleUnitStatusUpdate={handleUnitStatusUpdate}
    />
  );
};

const PrivateTerritoryTable = ({
  isAdmin,
  houses,
  completedPercent,
  policy,
  trackRace,
  trackLanguages,
  handleHouseUpdate
}: territoryLandedProps) => (
  <div className={`${isAdmin ? "" : "sticky-body"} p-2`}>
    <Row xs={4} className="g-1">
      {houses &&
        houses.units.map((element, index) => (
          <Col key={`house-column-${index}`}>
            <Card bg="light" text="dark">
              <Card.Body
                style={{
                  padding: "0",
                  textAlign: "center"
                }}
                onClick={handleHouseUpdate}
                data-unitno={element.number}
                data-floor={houses.floor}
                data-hhtype={element.type}
                data-hhnote={element.note}
                data-hhstatus={element.status}
                data-nhcount={element.nhcount}
                data-languages={element.languages}
                data-dnctime={element.dnctime}
                data-sequence={element.sequence}
              >
                <Card.Header
                  style={{ padding: "0.10rem" }}
                  className="fluid-branding"
                >
                  {element.number}
                </Card.Header>
                <div
                  className={`landed-unit fluid-branding ${policy?.getUnitColor(
                    element,
                    completedPercent.completedValue
                  )}`}
                  style={{ padding: "0.3rem 0" }}
                >
                  <UnitStatus
                    type={element.type}
                    note={element.note}
                    status={element.status}
                    nhcount={element.nhcount}
                    languages={element.languages}
                    trackRace={trackRace}
                    trackLanguages={trackLanguages}
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
    </Row>
  </div>
);

const PublicTerritoryTable = ({
  postalCode,
  floors,
  maxUnitNumberLength,
  completedPercent,
  policy,
  trackRace,
  trackLanguages,
  handleUnitStatusUpdate
}: territoryTableProps) => (
  <div className="sticky-body">
    <Table
      bordered
      striped
      hover
      className="sticky-table"
      key={`table-${postalCode}`}
    >
      <TableHeader floors={floors} maxUnitNumber={maxUnitNumberLength} />
      <tbody>
        {floors &&
          floors.map((item, index) => (
            <tr key={`row-${index}`}>
              <FloorHeader index={index} floor={item.floor} />
              {item.units.map((element) => (
                <td
                  className={`text-center align-middle inline-cell ${policy?.getUnitColor(
                    element,
                    completedPercent.completedValue
                  )}`}
                  onClick={handleUnitStatusUpdate}
                  data-floor={item.floor}
                  data-unitno={element.number}
                  key={`${item.floor}-${element.number}`}
                >
                  <UnitStatus
                    type={element.type}
                    note={element.note}
                    status={element.status}
                    nhcount={element.nhcount}
                    languages={element.languages}
                    trackRace={trackRace}
                    trackLanguages={trackLanguages}
                  />
                </td>
              ))}
            </tr>
          ))}
      </tbody>
    </Table>
  </div>
);

const AdminTable = ({
  postalCode,
  floors,
  maxUnitNumberLength,
  completedPercent,
  policy,
  trackRace,
  trackLanguages,
  adminUnitHeaderStyle,
  handleUnitNoUpdate,
  handleUnitStatusUpdate,
  handleFloorDelete,
  userAccessLevel,
  territoryType
}: territoryTableProps) => {
  if (territoryType === TERRITORY_TYPES.PRIVATE) {
    return (
      <PrivateTerritoryTable
        isAdmin={true}
        postalCode={postalCode}
        houses={floors[0]}
        policy={policy}
        completedPercent={completedPercent}
        trackLanguages={trackLanguages}
        trackRace={trackRace}
        handleHouseUpdate={handleUnitStatusUpdate}
      />
    );
  }
  return (
    <Table
      key={`table-${postalCode}`}
      bordered
      striped
      hover
      responsive="sm"
      className="sticky-table"
    >
      <thead>
        <tr>
          <th scope="col" className="text-center align-middle sticky-left-cell">
            lvl/unit
          </th>
          {floors &&
            floors[0].units.map((item, index) => {
              return (
                <th
                  key={`${index}-${item.number}`}
                  scope="col"
                  className={`${adminUnitHeaderStyle}text-center align-middle`}
                  onClick={handleUnitNoUpdate}
                  data-length={floors[0].units.length}
                  data-sequence={item.sequence}
                  data-unitno={item.number}
                >
                  {ZeroPad(item.number, maxUnitNumberLength)}
                </th>
              );
            })}
        </tr>
      </thead>
      <tbody key={`tbody-${postalCode}`}>
        {floors &&
          floors.map((floorElement, floorIndex) => (
            <tr key={`row-${floorIndex}`}>
              <th
                className="text-center inline-cell sticky-left-cell"
                key={`floor-${floorIndex}`}
                scope="row"
              >
                <ComponentAuthorizer
                  requiredPermission={USER_ACCESS_LEVELS.TERRITORY_SERVANT}
                  userPermission={userAccessLevel}
                >
                  <Button
                    size="sm"
                    variant="outline-warning"
                    className="me-1"
                    onClick={handleFloorDelete}
                    data-floor={floorElement.floor}
                  >
                    🗑️
                  </Button>
                </ComponentAuthorizer>
                {`${ZeroPad(floorElement.floor, DEFAULT_FLOOR_PADDING)}`}
              </th>
              {floorElement.units.map((detailsElement, index) => (
                <td
                  align="center"
                  className={`inline-cell ${policy?.getUnitColor(
                    detailsElement,
                    completedPercent.completedValue
                  )}`}
                  onClick={handleUnitStatusUpdate}
                  key={`${index}-${detailsElement.number}`}
                  data-floor={floorElement.floor}
                  data-unitno={detailsElement.number}
                  data-hhtype={detailsElement.type}
                  data-hhnote={detailsElement.note}
                  data-hhstatus={detailsElement.status}
                  data-nhcount={detailsElement.nhcount}
                  data-languages={detailsElement.languages}
                  data-dnctime={
                    detailsElement.dnctime || DEFAULT_UNIT_DNC_MS_TIME
                  }
                >
                  <UnitStatus
                    key={`unit-${index}-${detailsElement.number}`}
                    type={detailsElement.type}
                    note={detailsElement.note}
                    status={detailsElement.status}
                    nhcount={detailsElement.nhcount}
                    languages={detailsElement.languages}
                    trackRace={trackRace}
                    trackLanguages={trackLanguages}
                  />
                </td>
              ))}
            </tr>
          ))}
      </tbody>
    </Table>
  );
};
export {
  TableHeader,
  FloorHeader,
  UnitStatus,
  NotHomeIcon,
  AdminTable,
  PublisherTerritoryTable
};
