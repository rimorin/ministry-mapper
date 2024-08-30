import { Row, Col, Card } from "react-bootstrap";
import { territoryLandedProps } from "../../utils/interface";
import UnitStatus from "./unit";
import { DEFAULT_AGGREGATES } from "../../utils/constants";

const PrivateTerritoryTable = ({
  isAdmin,
  houses,
  aggregates,
  policy: hhpolicy,
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
                  className={`landed-unit fluid-bolding fluid-text ${hhpolicy?.getUnitColor(
                    element,
                    aggregates?.value || DEFAULT_AGGREGATES.value
                  )}`}
                  style={{ padding: "0.3rem 0" }}
                >
                  <UnitStatus
                    type={element.type}
                    note={element.note}
                    status={element.status}
                    nhcount={element.nhcount}
                    defaultOption={hhpolicy?.defaultType}
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
    </Row>
  </div>
);

export default PrivateTerritoryTable;
