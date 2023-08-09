import NiceModal, { useModal, bootstrapDialog } from "@ebay/nice-modal-react";
import { useRollbar } from "@rollbar/react";
import { set, ref } from "firebase/database";
import { useState, FormEvent } from "react";
import { Modal, Form } from "react-bootstrap";
import { database } from "../../firebase";
import {
  NOTIFICATION_TYPES,
  WIKI_CATEGORIES,
  USER_ACCESS_LEVELS
} from "../../utils/constants";
import {
  pollingVoidFunction,
  setNotification,
  errorHandler
} from "../../utils/helpers";
import ModalFooter from "../form/footer";
import GenericTextAreaField from "../form/textarea";
import HelpButton from "../navigation/help";

const UpdateAddressInstructions = NiceModal.create(
  ({
    congregation,
    postalCode,
    addressName,
    userAccessLevel,
    instructions,
    userName
  }: {
    addressName: string;
    congregation: string;
    postalCode: string;
    userAccessLevel: number | undefined;
    instructions: string | undefined;
    userName: string;
  }) => {
    const modal = useModal();
    const rollbar = useRollbar();
    const [addressInstructions, setAddressInstructions] =
      useState(instructions);
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmitInstructions = async (event: FormEvent<HTMLElement>) => {
      event.preventDefault();
      try {
        await pollingVoidFunction(() =>
          set(ref(database, `/${postalCode}/instructions`), addressInstructions)
        );
        await setNotification(
          NOTIFICATION_TYPES.INSTRUCTIONS,
          congregation,
          postalCode,
          userName
        );
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
          <Modal.Title>{`Instructions on ${addressName}`}</Modal.Title>
          <HelpButton link={WIKI_CATEGORIES.UPDATE_INSTRUCTIONS} />
        </Modal.Header>
        <Form onSubmit={handleSubmitInstructions}>
          <Modal.Body>
            <GenericTextAreaField
              name="instructions"
              rows={5}
              handleChange={(event) => {
                const { value } = event.target as HTMLInputElement;
                setAddressInstructions(value);
              }}
              changeValue={addressInstructions}
              readOnly={
                userAccessLevel !== USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE
              }
            />
          </Modal.Body>
          <ModalFooter
            handleClick={() => modal.hide()}
            userAccessLevel={userAccessLevel}
            requiredAcLForSave={USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE}
            isSaving={isSaving}
          />
        </Form>
      </Modal>
    );
  }
);

export default UpdateAddressInstructions;
