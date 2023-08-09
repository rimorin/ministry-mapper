import NiceModal, { useModal, bootstrapDialog } from "@ebay/nice-modal-react";
import { useRollbar } from "@rollbar/react";
import { get, ref, remove, set, push } from "firebase/database";
import { useState, FormEvent, ChangeEvent } from "react";
import { Modal, Form } from "react-bootstrap";
import { USER_ACCESS_LEVELS, WIKI_CATEGORIES } from "../../utils/constants";
import {
  pollingQueryFunction,
  pollingVoidFunction,
  errorHandler
} from "../../utils/helpers";
import ModalFooter from "../form/footer";
import GenericInputField from "../form/input";
import HelpButton from "../navigation/help";
import { database } from "../../firebase";

const ChangeAddressPostalCode = NiceModal.create(
  ({
    footerSaveAcl = USER_ACCESS_LEVELS.READ_ONLY.CODE,
    congregation,
    territoryCode,
    postalCode
  }: {
    footerSaveAcl: number | undefined;
    congregation: string | undefined;
    territoryCode: string | undefined;
    postalCode: string;
  }) => {
    const [newPostalCode, setNewPostalCode] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const modal = useModal();
    const rollbar = useRollbar();

    const getTerritoryAddress = async (territoryCode: string) => {
      return await pollingQueryFunction(() =>
        get(
          ref(
            database,
            `congregations/${congregation}/territories/${territoryCode}/addresses`
          )
        )
      );
    };

    const deleteTerritoryAddress = async (
      territoryCode: string,
      postalCode: string
    ) => {
      const addressesSnapshot = await getTerritoryAddress(territoryCode);
      if (addressesSnapshot.exists()) {
        const addressData = addressesSnapshot.val();
        for (const addkey in addressData) {
          const currentPostalcode = addressData[addkey];
          if (currentPostalcode === postalCode) {
            await pollingVoidFunction(() =>
              remove(
                ref(
                  database,
                  `congregations/${congregation}/territories/${territoryCode}/addresses/${addkey}`
                )
              )
            );
            break;
          }
        }
      }
    };

    const deleteBlock = async (
      postalCode: string,
      name: string,
      showAlert: boolean
    ) => {
      if (!territoryCode) return;
      try {
        await remove(ref(database, `${postalCode}`));
        await deleteTerritoryAddress(territoryCode, postalCode);
        if (showAlert) alert(`Deleted address, ${name}.`);
        // await refreshCongregationTerritory(`${selectedTerritoryCode}`);
      } catch (error) {
        errorHandler(error, rollbar);
      }
    };

    const handleUpdatePostalcode = async (event: FormEvent<HTMLElement>) => {
      event.preventDefault();
      setIsSaving(true);
      try {
        const newPostalRef = ref(database, newPostalCode);
        const existingAddress = await get(newPostalRef);
        if (existingAddress.exists()) {
          alert(`Postal address, ${newPostalCode} already exist.`);
          return;
        }
        const oldPostalData = await get(ref(database, postalCode));
        await pollingVoidFunction(() => set(newPostalRef, oldPostalData.val()));
        await pollingVoidFunction(() =>
          set(
            push(
              ref(
                database,
                `congregations/${congregation}/territories/${territoryCode}/addresses`
              )
            ),
            newPostalCode
          )
        );
        await pollingVoidFunction(() => deleteBlock(postalCode, "", false));
        modal.resolve();
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
          <Modal.Title>Change Address Postal Code</Modal.Title>
          <HelpButton link={WIKI_CATEGORIES.CHANGE_TERRITORY_CODE} />
        </Modal.Header>
        <Form onSubmit={handleUpdatePostalcode}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="userid">Existing Postal Code</Form.Label>
              <Form.Control
                readOnly
                id="existingcode"
                defaultValue={postalCode}
              />
            </Form.Group>
            <GenericInputField
              inputType="number"
              label="New Postal Code"
              name="postalcode"
              handleChange={(e: ChangeEvent<HTMLElement>) => {
                const { value } = e.target as HTMLInputElement;
                setNewPostalCode(value);
              }}
              changeValue={newPostalCode}
              required={true}
              placeholder={
                "Block/Building postal code. Eg, 730801, 752367, etc"
              }
            />
          </Modal.Body>
          <ModalFooter
            handleClick={modal.hide}
            userAccessLevel={footerSaveAcl}
            isSaving={isSaving}
            submitLabel="Change"
          />
        </Form>
      </Modal>
    );
  }
);

export default ChangeAddressPostalCode;
