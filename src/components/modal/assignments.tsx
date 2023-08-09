import NiceModal, { useModal, bootstrapDialog } from "@ebay/nice-modal-react";
import { remove, ref } from "firebase/database";
import { Modal, ListGroup, Button } from "react-bootstrap";
import {
  WIKI_CATEGORIES,
  LINK_SELECTOR_VIEWPORT_HEIGHT,
  USER_ACCESS_LEVELS
} from "../../utils/constants";
import {
  LinkTypeDescription,
  LinkDateFormatter,
  pollingVoidFunction,
  triggerPostalCodeListeners
} from "../../utils/helpers";
import { LinkSession } from "../../utils/policies";
import ModalFooter from "../form/footer";
import HelpButton from "../navigation/help";
import { database } from "../../firebase";
import { useEffect, useState } from "react";

const GetAssignments = NiceModal.create(
  ({ assignments }: { assignments: LinkSession[] }) => {
    const modal = useModal();

    const [currentAssignments, setCurrentAssignments] =
      useState<LinkSession[]>(assignments);

    useEffect(() => {
      if (currentAssignments.length === 0) {
        modal.hide();
      }
    }, [currentAssignments]);

    return (
      <Modal {...bootstrapDialog(modal)}>
        <Modal.Header>
          <Modal.Title>Assignments</Modal.Title>
          <HelpButton link={WIKI_CATEGORIES.GET_ASSIGNMENTS} />
        </Modal.Header>
        <Modal.Body>
          <ListGroup
            style={{
              height: LINK_SELECTOR_VIEWPORT_HEIGHT,
              overflow: "auto"
            }}
          >
            {currentAssignments.map((assignment) => {
              return (
                <ListGroup.Item
                  key={`assignment-${assignment.key}`}
                  className="d-flex justify-content-between align-items-center"
                >
                  <div className="ms-2 me-auto">
                    <div className="fluid-text fw-bold">
                      <a
                        href={`${assignment.postalCode}/${assignment.congregation}/${assignment.key}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {assignment.name}
                      </a>
                    </div>
                    <div className="fluid-text">
                      {LinkTypeDescription(assignment.linkType)}
                    </div>
                    {assignment.publisherName && (
                      <div className="fluid-text">
                        Publisher : {assignment.publisherName}
                      </div>
                    )}
                    <div className="fluid-text">
                      Created Dt :{" "}
                      {LinkDateFormatter.format(
                        new Date(assignment.tokenCreatetime)
                      )}
                    </div>
                    <div className="fluid-text">
                      Expiry Dt :{" "}
                      {LinkDateFormatter.format(
                        new Date(assignment.tokenEndtime)
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline-warning"
                    className="me-1"
                    onClick={async (event) => {
                      const { linkid, postal } = event.currentTarget.dataset;
                      await pollingVoidFunction(() =>
                        remove(ref(database, `links/${linkid}`))
                      );
                      await triggerPostalCodeListeners(`${postal}`);
                      setCurrentAssignments((currentAssignments) =>
                        currentAssignments.filter(
                          (assignment) => assignment.key !== linkid
                        )
                      );
                    }}
                    data-linkid={assignment.key}
                    data-postal={assignment.postalCode}
                  >
                    🗑️
                  </Button>
                </ListGroup.Item>
              );
            })}
          </ListGroup>
        </Modal.Body>
        <ModalFooter
          handleClick={() => modal.hide()}
          userAccessLevel={USER_ACCESS_LEVELS.READ_ONLY.CODE}
        />
      </Modal>
    );
  }
);

export default GetAssignments;
