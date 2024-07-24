import NiceModal, { useModal, bootstrapDialog } from "@ebay/nice-modal-react";
import { useRollbar } from "@rollbar/react";
import { get, ref, remove, set, push } from "firebase/database";
import { useState, FormEvent, ChangeEvent } from "react";
import { Modal, Form } from "react-bootstrap";
import { USER_ACCESS_LEVELS, WIKI_CATEGORIES } from "../../utils/constants";
import pollingQueryFunction from "../../utils/helpers/pollingquery";
import pollingVoidFunction from "../../utils/helpers/pollingvoid";
import errorHandler from "../../utils/helpers/errorhandler";
import ModalFooter from "../form/footer";
import GenericInputField from "../form/input";
import HelpButton from "../navigation/help";
import { database } from "../../firebase";
import { ChangeAddressPostalCodeModalProps } from "../../utils/interface";
import { usePostHog } from "posthog-js/react";

const ChangeAddressPostalCode = NiceModal.create(
  ({
    footerSaveAcl = USER_ACCESS_LEVELS.READ_ONLY.CODE,
    congregation,
    territoryCode,
    postalCode,
    requiresPostalCode
  }: ChangeAddressPostalCodeModalProps) => {
    const [newPostalCode, setNewPostalCode] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const modal = useModal();
    const rollbar = useRollbar();
    const modalDescription = requiresPostalCode
      ? "Address Postal Code"
      : "Map Number";
    const posthog = usePostHog();

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
      congregation: string,
      postalCode: string,
      name: string,
      showAlert: boolean
    ) => {
      if (!territoryCode) return;
      try {
        await remove(ref(database, `addresses/${congregation}/${postalCode}`));
        await deleteTerritoryAddress(territoryCode, postalCode);
        if (showAlert) alert(`Deleted address, ${name}.`);
      } catch (error) {
        errorHandler(error, rollbar);
      }
    };

    const handleUpdatePostalcode = async (event: FormEvent<HTMLElement>) => {
      event.preventDefault();
      setIsSaving(true);
      try {
        const newPostalRef = ref(
          database,
          `addresses/${congregation}/${newPostalCode}`
        );
        const existingAddress = await get(newPostalRef);
        if (existingAddress.exists()) {
          alert(`Postal address, ${newPostalCode} already exist.`);
          return;
        }
        const oldPostalData = await get(
          ref(database, `addresses/${congregation}/${postalCode}`)
        );
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
        await pollingVoidFunction(() =>
          deleteBlock(congregation, postalCode, "", false)
        );
        posthog?.capture("change_address_map_id", {
          mapId: postalCode,
          newMapId: newPostalCode
        });
        modal.resolve();
        modal.hide();
      } catch (error) {
        errorHandler(error, rollbar);
      } finally {
        setIsSaving(false);
      }
    };
    return (
      <Modal {...bootstrapDialog(modal)} onHide={() => modal.remove()}>
        <Modal.Header>
          <Modal.Title>Change {modalDescription}</Modal.Title>
          <HelpButton link={WIKI_CATEGORIES.CHANGE_TERRITORY_CODE} />
        </Modal.Header>
        <Form onSubmit={handleUpdatePostalcode}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="userid">
                Existing {modalDescription}
              </Form.Label>
              <Form.Control
                readOnly
                id="existingcode"
                defaultValue={postalCode}
              />
            </Form.Group>
            <GenericInputField
              inputType="number"
              label={`New ${modalDescription}`}
              name="refNo"
              handleChange={(e: ChangeEvent<HTMLElement>) => {
                const { value } = e.target as HTMLInputElement;
                setNewPostalCode(value);
              }}
              changeValue={newPostalCode}
              required={true}
              placeholder={
                requiresPostalCode
                  ? "Block/Building postal code. Eg, 730801, 752367, etc"
                  : undefined
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
