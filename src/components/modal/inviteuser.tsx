import NiceModal, { useModal, bootstrapDialog } from "@ebay/nice-modal-react";
import { useRollbar } from "@rollbar/react";
import { FirebaseError } from "firebase/app";
import { httpsCallable } from "firebase/functions";
import { useState, FormEvent } from "react";
import { Modal, Form } from "react-bootstrap";
import { functions } from "../../firebase";
import {
  CLOUD_FUNCTIONS_CALLS,
  USER_ACCESS_LEVELS,
  WIKI_CATEGORIES
} from "../../utils/constants";
import errorHandler from "../../utils/helpers/errorhandler";
import errorMessage from "../../utils/helpers/errormsg";
import { UserModalProps } from "../../utils/interface";
import ModalFooter from "../form/footer";
import GenericInputField from "../form/input";
import UserRoleField from "../form/role";
import HelpButton from "../navigation/help";
import { usePostHog } from "posthog-js/react";

const InviteUser = NiceModal.create(
  ({
    email,
    congregation = "",
    footerSaveAcl = USER_ACCESS_LEVELS.READ_ONLY.CODE
  }: UserModalProps) => {
    const [userRole, setUserRole] = useState(USER_ACCESS_LEVELS.READ_ONLY.CODE);
    const [userEmail, setUserEmail] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const modal = useModal();
    const rollbar = useRollbar();
    const posthog = usePostHog();

    const handleUserDetails = async (event: FormEvent<HTMLElement>) => {
      event.preventDefault();
      setIsSaving(true);
      try {
        if (userEmail.toLowerCase() === email?.toLowerCase()) {
          alert("Please do not invite yourself.");
          return;
        }
        const getUserByEmail = httpsCallable(
          functions,
          `${import.meta.env.VITE_SYSTEM_ENVIRONMENT}-${CLOUD_FUNCTIONS_CALLS.GET_USER_BY_EMAIL}`
        );
        const user = await getUserByEmail({ email: userEmail });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userData = user.data as any;
        const userId = userData.uid;
        if (!userData.emailVerified) {
          alert(
            `This account is unverified. Please get the user to verify the account before proceeding.`
          );
          return;
        }
        const userRoles = userData.customClaims?.["congregations"];
        if (userRoles && userRoles[congregation]) {
          alert("This user is already part of the congregation.");
          return;
        }
        const updateUserAccess = httpsCallable(
          functions,
          `${import.meta.env.VITE_SYSTEM_ENVIRONMENT}-${CLOUD_FUNCTIONS_CALLS.UPDATE_USER_ACCESS}`
        );
        await updateUserAccess({
          uid: userId,
          congregation: congregation,
          role: userRole
        });
        let roleDisplay = USER_ACCESS_LEVELS.READ_ONLY.DISPLAY;
        if (userRole === USER_ACCESS_LEVELS.CONDUCTOR.CODE)
          roleDisplay = USER_ACCESS_LEVELS.CONDUCTOR.DISPLAY;
        if (userRole === USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE)
          roleDisplay = USER_ACCESS_LEVELS.TERRITORY_SERVANT.DISPLAY;
        posthog?.capture("invite_user", {
          email: userEmail,
          role: userRole
        });
        alert(`Granted ${roleDisplay} access to ${userEmail}.`);
        modal.hide();
      } catch (error) {
        errorHandler(errorMessage(error as FirebaseError), rollbar);
      } finally {
        setIsSaving(false);
      }
    };
    return (
      <Modal {...bootstrapDialog(modal)} onHide={() => modal.remove()}>
        <Modal.Header>
          <Modal.Title>Invite User</Modal.Title>
          <HelpButton link={WIKI_CATEGORIES.INVITE_USER} />
        </Modal.Header>
        <Form onSubmit={handleUserDetails}>
          <Modal.Body>
            <GenericInputField
              label="User email"
              name="email"
              handleChange={(event) => {
                const { value } = event.target as HTMLInputElement;
                setUserEmail(value);
              }}
              changeValue={userEmail}
              inputType="email"
            />
            <Form.Group
              className="mb-1 text-center"
              controlId="formBasicUsrRolebtnCheckbox"
            >
              <UserRoleField
                role={userRole}
                handleRoleChange={(value) => setUserRole(value)}
                isUpdate={false}
              />
            </Form.Group>
          </Modal.Body>
          <ModalFooter
            handleClick={modal.hide}
            userAccessLevel={footerSaveAcl}
            isSaving={isSaving}
            submitLabel="Invite"
          />
        </Form>
      </Modal>
    );
  }
);

export default InviteUser;
