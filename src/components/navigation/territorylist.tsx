import { memo } from "react";
import { Offcanvas, ListGroup } from "react-bootstrap";
import { TERRITORY_SELECTOR_VIEWPORT_HEIGHT } from "../../utils/constants";
import { TerritoryListingProps } from "../../utils/interface";
import AggregationBadge from "./aggrbadge";

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
                  eventKey={element.code}
                  active={selectedTerritory === element.code}
                  className="d-flex justify-content-between align-items-start"
                >
                  <>
                    {element.code} - {element.name}
                  </>
                  <AggregationBadge
                    aggregate={element.aggregates}
                    width="3rem"
                  />
                </ListGroup.Item>
              ))}
          </ListGroup>
        </Offcanvas.Body>
      </Offcanvas>
    );
  }
);

export default TerritoryListing;
