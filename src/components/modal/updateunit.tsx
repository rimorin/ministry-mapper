import NiceModal, { useModal, bootstrapDialog } from "@ebay/nice-modal-react";
import { useRollbar } from "@rollbar/react";
import { update, ref } from "firebase/database";
import { useState, FormEvent, ChangeEvent } from "react";
import { Modal, Form, Button, Container, Card } from "react-bootstrap";
import { confirmAlert } from "react-confirm-alert";
import { database } from "../../firebase";
import { WIKI_CATEGORIES } from "../../utils/constants";
import pollingVoidFunction from "../../utils/helpers/pollingvoid";
import errorHandler from "../../utils/helpers/errorhandler";
import processPostalUnitNumber from "../../utils/helpers/processpostalno";
import { UpdateUnitModalProps, unitMaps } from "../../utils/interface";
import GenericInputField from "../form/input";
import ModalSubmitButton from "../form/submit";
import HelpButton from "../navigation/help";

const UpdateUnit = NiceModal.create(
  ({
    postalCode,
    unitNo,
    unitSequence,
    unitLength,
    unitDisplay,
    addressData
  }: UpdateUnitModalProps) => {
    const [unitSeq, setUnitSeq] = useState(unitSequence);
    const [isSaving, setIsSaving] = useState(false);
    const modal = useModal();
    const rollbar = useRollbar();

    const processPostalUnitSequence = async (
      postalCode: string,
      unitNumber: string,
      sequence: number | undefined
    ) => {
      if (!addressData) return;

      const unitUpdates: unitMaps = {};
      for (const index in addressData.floors) {
        const floorDetails = addressData.floors[index];
        floorDetails.units.forEach(() => {
          unitUpdates[
            `/${postalCode}/units/${floorDetails.floor}/${unitNumber}/sequence`
          ] = sequence === undefined ? {} : sequence;
        });
      }
      setIsSaving(true);
      try {
        await pollingVoidFunction(() => update(ref(database), unitUpdates));
        modal.hide();
      } catch (error) {
        errorHandler(error, rollbar);
      } finally {
        setIsSaving(false);
      }
    };

    const handleUpdateUnit = async (event: FormEvent<HTMLElement>) => {
      event.preventDefault();
      processPostalUnitSequence(postalCode, unitNo, unitSeq);
    };

    return (
      <Modal {...bootstrapDialog(modal)}>
        <Modal.Header>
          <Modal.Title>Unit {unitDisplay}</Modal.Title>
          <HelpButton link={WIKI_CATEGORIES.UPDATE_UNIT_NUMBER} />
        </Modal.Header>
        <Form onSubmit={handleUpdateUnit}>
          <Modal.Body>
            <GenericInputField
              inputType="number"
              label="Sequence Number"
              name="sequence"
              placeholder="Optional unit row sequence number"
              handleChange={(e: ChangeEvent<HTMLElement>) => {
                const { value } = e.target as HTMLInputElement;
                const parsedValue = parseInt(value);
                setUnitSeq(isNaN(parsedValue) ? undefined : parsedValue);
              }}
              changeValue={
                unitSeq === undefined ? undefined : unitSeq.toString()
              }
            />
          </Modal.Body>
          <Modal.Footer className="justify-content-around">
            <Button variant="secondary" onClick={() => modal.hide()}>
              Close
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                const hasOnlyOneUnitNumber = unitLength === 1;
                if (hasOnlyOneUnitNumber) {
                  alert(`Territory requires at least 1 unit number.`);
                  return;
                }
                modal.hide();
                confirmAlert({
                  customUI: ({ onClose }) => {
                    return (
                      <Container>
                        <Card bg="warning" className="text-center">
                          <Card.Header>
                            Warning ⚠️
                            <HelpButton
                              link={WIKI_CATEGORIES.ADD_DELETE_PRIVATE_PROPERTY}
                              isWarningButton={true}
                            />
                          </Card.Header>
                          <Card.Body>
                            <Card.Title>Are You Very Sure ?</Card.Title>
                            <Card.Text>
                              This action will delete unit number {unitNo} of{" "}
                              {postalCode}.
                            </Card.Text>
                            <Button
                              className="m-1"
                              variant="primary"
                              onClick={() => {
                                processPostalUnitNumber(
                                  postalCode,
                                  unitNo,
                                  addressData,
                                  true
                                );
                                onClose();
                              }}
                            >
                              Yes, Delete It.
                            </Button>
                            <Button
                              className="no-confirm-btn"
                              variant="primary"
                              onClick={() => {
                                onClose();
                              }}
                            >
                              No
                            </Button>
                          </Card.Body>
                        </Card>
                      </Container>
                    );
                  }
                });
              }}
            >
              Delete Unit
            </Button>
            <ModalSubmitButton isSaving={isSaving} />
          </Modal.Footer>
        </Form>
      </Modal>
    );
  }
);

export default UpdateUnit;
