import NiceModal, { useModal, bootstrapDialog } from "@ebay/nice-modal-react";
import { useState, FormEvent } from "react";
import { Modal, Form } from "react-bootstrap";
import Calendar from "react-calendar";
import { WIKI_CATEGORIES, USER_ACCESS_LEVELS } from "../../utils/constants";
import ModalFooter from "../form/footer";
import GenericInputField from "../form/input";
import HelpButton from "../navigation/help";
import { ConfirmSlipDetailsModalProps } from "../../utils/interface";

const ConfirmSlipDetails = NiceModal.create(
  ({
    addressName,
    userAccessLevel,
    isPersonalSlip = true
  }: ConfirmSlipDetailsModalProps) => {
    const modal = useModal();
    const [linkExpiryHrs, setLinkExpiryHrs] = useState<number | undefined>();
    const [name, setName] = useState<string>();

    const handleSubmitPersonalSlip = async (event: FormEvent<HTMLElement>) => {
      event.preventDefault();
      if (!linkExpiryHrs && isPersonalSlip) {
        alert("Please select an expiry date.");
        return;
      }
      modal.resolve({ linkExpiryHrs: linkExpiryHrs, publisherName: name });
      modal.hide();
    };

    return (
      <Modal {...bootstrapDialog(modal)}>
        <Modal.Header>
          <Modal.Title>{`Confirm ${
            isPersonalSlip ? "personal" : ""
          } slip details for ${addressName}`}</Modal.Title>
          <HelpButton link={WIKI_CATEGORIES.CREATE_PERSONAL_SLIPS} />
        </Modal.Header>
        <Form onSubmit={handleSubmitPersonalSlip}>
          <Modal.Body>
            {isPersonalSlip && (
              <Calendar
                //Block selection for current day and days before.
                minDate={new Date(Date.now() + 3600 * 1000 * 24)}
                onChange={(selectedDate: Date) => {
                  const expiryInHours = Math.floor(
                    (selectedDate.getTime() - new Date().getTime()) /
                      (1000 * 60 * 60)
                  );
                  setLinkExpiryHrs(expiryInHours);
                }}
                className="w-100 mb-1"
              />
            )}
            <GenericInputField
              label="Publishers Name"
              name="name"
              handleChange={(event) => {
                const { value } = event.target as HTMLInputElement;
                setName(value);
              }}
              placeholder="Names of the assigned publishers"
              changeValue={name}
              focus={true}
              required={true}
            />
          </Modal.Body>
          <ModalFooter
            handleClick={() => modal.hide()}
            userAccessLevel={userAccessLevel}
            requiredAcLForSave={USER_ACCESS_LEVELS.CONDUCTOR.CODE}
            isSaving={false}
            submitLabel="Confirm"
          />
        </Form>
      </Modal>
    );
  }
);

export default ConfirmSlipDetails;
