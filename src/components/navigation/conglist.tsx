import { memo } from "react";
import { Offcanvas, ListGroup } from "react-bootstrap";
import { CongregationListingProps } from "../../utils/interface";
import UserRoleBadge from "./rolebadge";

const CongListing = memo(
  ({
    showListing,
    hideFunction,
    currentCongCode,
    handleSelect,
    congregations
  }: CongregationListingProps) => {
    const currentCongregations = congregations
      ? congregations.filter((element) => element.code !== currentCongCode)
      : [];
    return (
      <Offcanvas
        placement={"bottom"}
        show={showListing}
        onHide={hideFunction}
        style={{
          minHeight: `${53 * currentCongregations.length}px`
        }}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Select Congregation</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <ListGroup onSelect={handleSelect}>
            {currentCongregations &&
              currentCongregations.map((element) => (
                <ListGroup.Item
                  action
                  key={`list-group-item-${element.code}`}
                  eventKey={element.code}
                >
                  <div
                    style={{ justifyContent: "space-between", display: "flex" }}
                  >
                    <span className="fw-bold">{element.name}</span>
                    <span>
                      <UserRoleBadge role={element.access} />
                    </span>
                  </div>
                </ListGroup.Item>
              ))}
          </ListGroup>
        </Offcanvas.Body>
      </Offcanvas>
    );
  }
);

export default CongListing;
