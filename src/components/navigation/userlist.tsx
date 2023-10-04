import { memo } from "react";
import { Offcanvas, ListGroup } from "react-bootstrap";
import { TERRITORY_SELECTOR_VIEWPORT_HEIGHT } from "../../utils/constants";
import { UserListingProps } from "../../utils/interface";
import UserRoleBadge from "./rolebadge";

const UserListing = memo(
  ({
    showListing,
    hideFunction,
    currentUid,
    handleSelect,
    users
  }: UserListingProps) => {
    const currentCongUsers = users
      ? users.filter((element) => element.uid !== currentUid)
      : undefined;
    return (
      <Offcanvas
        placement={"bottom"}
        show={showListing}
        onHide={hideFunction}
        style={{ height: TERRITORY_SELECTOR_VIEWPORT_HEIGHT }}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Select Users</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <ListGroup onSelect={handleSelect}>
            {currentCongUsers &&
              currentCongUsers.map((element) => (
                <ListGroup.Item
                  action
                  key={`list-group-item-${element.uid}`}
                  eventKey={element.uid}
                >
                  <div
                    style={{ justifyContent: "space-between", display: "flex" }}
                  >
                    <span className="fw-bold">{element.name}</span>
                    <span>
                      <UserRoleBadge role={element.role} />
                    </span>
                  </div>
                  <div className="me-auto">{element.email}</div>
                </ListGroup.Item>
              ))}
          </ListGroup>
        </Offcanvas.Body>
      </Offcanvas>
    );
  }
);

export default UserListing;
