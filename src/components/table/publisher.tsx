import { Row, Col, Card } from "react-bootstrap";
import { TERRITORY_TYPES } from "../../utils/constants";
import {
  territoryTableProps,
  territoryLandedProps
} from "../../utils/interface";
// import { UnitStatus } from "../table";
import UnitStatus from "../table/unit";
import PublicTerritoryTable from "./public";

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
                  className="fluid-bolding fluid-text"
                >
                  {element.number}
                </Card.Header>
                <div
                  className={`landed-unit fluid-bolding fluid-text ${policy?.getUnitColor(
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

export default PublisherTerritoryTable;
