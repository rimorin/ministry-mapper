import NiceModal, { useModal, bootstrapDialog } from "@ebay/nice-modal-react";
import { useRollbar } from "@rollbar/react";
import { httpsCallable } from "firebase/functions";
import { useState, FormEvent } from "react";
import { Modal, Form } from "react-bootstrap";
import { functions } from "../../firebase";
import { USER_ACCESS_LEVELS, WIKI_CATEGORIES } from "../../utils/constants";
import { errorHandler } from "../../utils/helpers";
import { UserModalProps } from "../../utils/interface";
import ModalFooter from "../form/footer";
import UserRoleField from "../form/role";
import HelpButton from "../navigation/help";

const UpdateUser = NiceModal.create(
  ({
    uid,
    congregation,
    name,
    role = USER_ACCESS_LEVELS.NO_ACCESS.CODE,
    footerSaveAcl = USER_ACCESS_LEVELS.READ_ONLY.CODE
  }: UserModalProps) => {
    const [userRole, setUserRole] = useState(role);
    const [isSaving, setIsSaving] = useState(false);
    const modal = useModal();
    const rollbar = useRollbar();

    const handleUserDetails = async (event: FormEvent<HTMLElement>) => {
      event.preventDefault();
      setIsSaving(true);
      try {
        const updateUserAccess = httpsCallable(functions, "updateUserAccess");
        await updateUserAccess({
          uid: uid,
          congregation: congregation,
          role: userRole
        });
        modal.resolve(userRole);
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
          <Modal.Title>Update {name} Role</Modal.Title>
          <HelpButton link={WIKI_CATEGORIES.MANAGE_USERS} />
        </Modal.Header>
        <Form onSubmit={handleUserDetails}>
          <Modal.Body>
            <Form.Group
              className="mb-1 text-center"
              controlId="formBasicUsrRolebtnCheckbox"
            >
              <UserRoleField
                role={userRole}
                handleRoleChange={(value) => setUserRole(value)}
              />
            </Form.Group>
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

export default UpdateUser;
