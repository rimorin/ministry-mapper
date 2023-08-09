import NiceModal, { useModal, bootstrapDialog } from "@ebay/nice-modal-react";
import { useRollbar } from "@rollbar/react";
import { useState, FormEvent, ChangeEvent } from "react";
import { Modal, Form } from "react-bootstrap";
import {
  USER_ACCESS_LEVELS,
  TERRITORY_TYPES,
  WIKI_CATEGORIES
} from "../../utils/constants";
import { processPostalUnitNumber, errorHandler } from "../../utils/helpers";
import { addressDetails } from "../../utils/interface";
import ModalFooter from "../form/footer";
import GenericInputField from "../form/input";
import HelpButton from "../navigation/help";

const NewUnit = NiceModal.create(
  ({
    footerSaveAcl = USER_ACCESS_LEVELS.READ_ONLY.CODE,
    postalCode,
    addressData
  }: {
    footerSaveAcl: number | undefined;
    postalCode: string;
    addressData: addressDetails;
  }) => {
    const [unit, setUnit] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const modal = useModal();
    const rollbar = useRollbar();

    const handleCreateNewUnit = async (event: FormEvent<HTMLElement>) => {
      event.preventDefault();
      setIsSaving(true);
      try {
        processPostalUnitNumber(postalCode, unit, addressData);
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
          <Modal.Title>
            {`Add ${
              addressData.type === TERRITORY_TYPES.PRIVATE ? "property" : "unit"
            } to ${
              addressData.type === TERRITORY_TYPES.PRIVATE ? name : postalCode
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
