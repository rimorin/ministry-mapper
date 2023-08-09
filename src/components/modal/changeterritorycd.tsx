import NiceModal, { useModal, bootstrapDialog } from "@ebay/nice-modal-react";
import { useRollbar } from "@rollbar/react";
import { ref, get, set, remove } from "firebase/database";
import { useState, FormEvent, ChangeEvent } from "react";
import { Modal, Form } from "react-bootstrap";
import { database } from "../../firebase";
import { USER_ACCESS_LEVELS, WIKI_CATEGORIES } from "../../utils/constants";
import { pollingVoidFunction, errorHandler } from "../../utils/helpers";
import ModalFooter from "../form/footer";
import GenericInputField from "../form/input";
import HelpButton from "../navigation/help";

const ChangeTerritoryCode = NiceModal.create(
  ({
    footerSaveAcl = USER_ACCESS_LEVELS.READ_ONLY.CODE,
    congregation,
    territoryCode
  }: {
    footerSaveAcl: number | undefined;
    congregation: string | undefined;
    territoryCode: string;
  }) => {
    const [newTerritoryCode, setNewTerritoryCode] = useState(territoryCode);
    const [isSaving, setIsSaving] = useState(false);
    const modal = useModal();
    const rollbar = useRollbar();

    const handleUpdateTerritoryCode = async (event: FormEvent<HTMLElement>) => {
      event.preventDefault();
      setIsSaving(true);
      try {
        const newCodeRef = ref(
          database,
          `congregations/${congregation}/territories/${newTerritoryCode}`
        );
        const existingTerritory = await get(newCodeRef);
        if (existingTerritory.exists()) {
          alert(`Territory code, ${newTerritoryCode} already exist.`);
          return;
        }
        const oldCodeRef = ref(
          database,
          `congregations/${congregation}/territories/${territoryCode}`
        );
        const oldTerritoryData = await get(oldCodeRef);
        await pollingVoidFunction(() =>
          set(newCodeRef, oldTerritoryData.val())
        );
        await pollingVoidFunction(() => remove(oldCodeRef));
        modal.resolve(newTerritoryCode);
        modal.hide();
      } catch (error) {
        errorHandler(error, rollbar);
      } finally {
        setIsSaving(false);
      }
    };
    return (
      <Modal {...bootstrapDialog(modal)}>
        <Modal.Header>
          <Modal.Title>Change Territory Code</Modal.Title>
          <HelpButton link={WIKI_CATEGORIES.CHANGE_TERRITORY_CODE} />
        </Modal.Header>
        <Form onSubmit={handleUpdateTerritoryCode}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="userid">Existing Territory Code</Form.Label>
              <Form.Control
                readOnly
                id="existingcode"
                defaultValue={territoryCode}
              />
            </Form.Group>
            <GenericInputField
              label="New Territory Code"
              name="code"
              handleChange={(event: ChangeEvent<HTMLElement>) => {
                const { value } = event.target as HTMLInputElement;
                setNewTerritoryCode(value);
              }}
              changeValue={newTerritoryCode}
              required={true}
              placeholder={"Territory code. For eg, M01, W12, etc."}
            />
          </Modal.Body>
          <ModalFooter
            handleClick={modal.hide}
            userAccessLevel={footerSaveAcl}
            isSaving={isSaving}
          />
        </Form>
      </Modal>
    );
  }
);

export default ChangeTerritoryCode;
