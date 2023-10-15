import NiceModal, { useModal, bootstrapDialog } from "@ebay/nice-modal-react";
import { useRollbar } from "@rollbar/react";
import { set, ref } from "firebase/database";
import { useState, FormEvent } from "react";
import { Modal, Form } from "react-bootstrap";
import { database } from "../../firebase";
import { USER_ACCESS_LEVELS, NOTIFICATION_TYPES } from "../../utils/constants";
import pollingVoidFunction from "../../utils/helpers/pollingvoid";
import setNotification from "../../utils/helpers/setnotification";
import errorHandler from "../../utils/helpers/errorhandler";
import ModalFooter from "../form/footer";
import GenericTextAreaField from "../form/textarea";
import HelpButton from "../navigation/help";
import { UpdateAddressFeedbackModalProps } from "../../utils/interface";

const UpdateAddressFeedback = NiceModal.create(
  ({
    name,
    footerSaveAcl = USER_ACCESS_LEVELS.READ_ONLY.CODE,
    postalCode,
    congregation,
    helpLink,
    currentFeedback = "",
    currentName = ""
  }: UpdateAddressFeedbackModalProps) => {
    const [feedback, setFeedback] = useState(currentFeedback);
    const [isSaving, setIsSaving] = useState(false);
    const modal = useModal();
    const rollbar = useRollbar();

    const handleSubmitFeedback = async (event: FormEvent<HTMLElement>) => {
      event.preventDefault();
      setIsSaving(true);
      try {
        await pollingVoidFunction(() =>
          set(
            ref(database, `addresses/${congregation}/${postalCode}/feedback`),
            feedback
          )
        );
        await setNotification(
          NOTIFICATION_TYPES.FEEDBACK,
          congregation,
          postalCode,
          currentName
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
          <Modal.Title>{`Feedback on ${name}`}</Modal.Title>
          <HelpButton link={helpLink} />
        </Modal.Header>
        <Form onSubmit={handleSubmitFeedback}>
          <Modal.Body>
            <GenericTextAreaField
              name="feedback"
              rows={5}
              handleChange={(event) => {
                const { value } = event.target as HTMLInputElement;
                setFeedback(value);
              }}
              changeValue={feedback}
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

export default UpdateAddressFeedback;
