import NiceModal, { useModal, bootstrapDialog } from "@ebay/nice-modal-react";
import { useRollbar } from "@rollbar/react";
import { useState, FormEvent, ChangeEvent } from "react";
import { Modal, Form } from "react-bootstrap";
import {
  USER_ACCESS_LEVELS,
  TERRITORY_TYPES,
  WIKI_CATEGORIES
} from "../../utils/constants";
import processPostalUnitNumber from "../../utils/helpers/processpostalno";
import errorHandler from "../../utils/helpers/errorhandler";
import { NewUnitModalProps } from "../../utils/interface";
import ModalFooter from "../form/footer";
import GenericInputField from "../form/input";
import HelpButton from "../navigation/help";
import { usePostHog } from "posthog-js/react";

const NewUnit = NiceModal.create(
  ({
    footerSaveAcl = USER_ACCESS_LEVELS.READ_ONLY.CODE,
    postalCode,
    addressData,
    defaultType,
    congregation
  }: NewUnitModalProps) => {
    const [unit, setUnit] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const modal = useModal();
    const rollbar = useRollbar();
    const posthog = usePostHog();

    const handleCreateNewUnit = async (event: FormEvent<HTMLElement>) => {
      event.preventDefault();
      setIsSaving(true);
      try {
        if (!/^[a-zA-Z0-9\-*]+$/.test(unit)) {
          alert(
            "The Unit/Property number should only include alphanumeric characters, dash or hyphen."
          );
          return;
        }
        processPostalUnitNumber(
          congregation,
          postalCode,
          unit,
          addressData,
          false,
          defaultType
        );
        posthog?.capture("create_map_unit", {
          unit,
          mapId: postalCode
        });
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
          <Modal.Title>
            {`Add ${
              addressData.type === TERRITORY_TYPES.PRIVATE ? "property" : "unit"
            } to ${
              addressData.type === TERRITORY_TYPES.PRIVATE
                ? addressData.name
                : postalCode
            }`}
          </Modal.Title>
          {addressData.type === TERRITORY_TYPES.PRIVATE ? (
            <HelpButton link={WIKI_CATEGORIES.ADD_DELETE_PRIVATE_PROPERTY} />
          ) : (
            <HelpButton link={WIKI_CATEGORIES.ADD_PUBLIC_UNIT} />
          )}
        </Modal.Header>
        <Form onSubmit={handleCreateNewUnit}>
          <Modal.Body>
            <GenericInputField
              label={`${
                addressData.type === TERRITORY_TYPES.PRIVATE
                  ? "Property"
                  : "Unit"
              } number`}
              name="unit"
              handleChange={(e: ChangeEvent<HTMLElement>) => {
                const { value } = e.target as HTMLInputElement;
                setUnit(value);
              }}
              changeValue={unit}
              required={true}
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

export default NewUnit;
