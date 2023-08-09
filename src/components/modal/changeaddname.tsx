import NiceModal, { useModal, bootstrapDialog } from "@ebay/nice-modal-react";
import { useRollbar } from "@rollbar/react";
import { set, ref } from "firebase/database";
import { useState, FormEvent } from "react";
import { Modal, Form } from "react-bootstrap";
import { database } from "../../firebase";
import { USER_ACCESS_LEVELS, WIKI_CATEGORIES } from "../../utils/constants";
// import { pollingVoidFunction, errorHandler } from "../../utils/helpers";
import pollingVoidFunction from "../../utils/helpers/pollingvoid";
import errorHandler from "../../utils/helpers/errorhandler";
import ModalFooter from "../form/footer";
import GenericInputField from "../form/input";
import HelpButton from "../navigation/help";

const ChangeAddressName = NiceModal.create(
  ({
    name,
    footerSaveAcl = USER_ACCESS_LEVELS.READ_ONLY.CODE,
    postal
  }: {
    name: string;
    footerSaveAcl: number | undefined;
    postal: string;
  }) => {
    const [addressName, setAddressName] = useState(name);
    const [isSaving, setIsSaving] = useState(false);
    const modal = useModal();
    const rollbar = useRollbar();

    const handleUpdateBlockName = async (event: FormEvent<HTMLElement>) => {
      event.preventDefault();
      setIsSaving(true);
      try {
        await pollingVoidFunction(() =>
          set(ref(database, `/${postal}/name`), addressName)
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
          <Modal.Title>Change Address Name</Modal.Title>
          <HelpButton link={WIKI_CATEGORIES.CHANGE_ADDRESS_NAME} />
        </Modal.Header>
        <Form onSubmit={handleUpdateBlockName}>
          <Modal.Body>
            <GenericInputField
              label="Name"
              name="name"
              handleChange={(event) => {
                const { value } = event.target as HTMLInputElement;
                setAddressName(value);
              }}
              changeValue={addressName}
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

export default ChangeAddressName;
