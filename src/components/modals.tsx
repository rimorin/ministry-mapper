import NiceModal, { useModal, bootstrapDialog } from "@ebay/nice-modal-react";
import {
  Button,
  Card,
  Collapse,
  Container,
  Form,
  ListGroup
} from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import {
  DncDateField,
  FloorField,
  GenericInputField,
  GenericTextAreaField,
  HHLangField,
  HHNotHomeField,
  HHStatusField,
  HHTypeField,
  ModalFooter,
  ModalSubmitButton,
  ModalUnitTitle,
  UserRoleField
} from "./form";
import { ChangeEvent, FormEvent, useState } from "react";
import { useRollbar } from "@rollbar/react";
import { set, ref, get, remove, push, child, update } from "firebase/database";
import { database } from "../firebase";
import {
  pollingVoidFunction,
  errorHandler,
  pollingQueryFunction,
  isValidPostal,
  isValidPostalSequence,
  processPropertyNumber,
  parseHHLanguages,
  processHHLanguages,
  errorMessage,
  triggerPostalCodeListeners,
  LinkDateFormatter,
  LinkTypeDescription
} from "../utils/helpers";
import {
  HOUSEHOLD_TYPES,
  LINK_SELECTOR_VIEWPORT_HEIGHT,
  MINIMUM_PASSWORD_LENGTH,
  NOT_HOME_STATUS_CODES,
  PASSWORD_POLICY,
  STATUS_CODES,
  TERRITORY_TYPES,
  USER_ACCESS_LEVELS,
  WIKI_CATEGORIES
} from "../utils/constants";
import {
  UserModalProps,
  addressDetails,
  unitDetails,
  unitMaps
} from "../utils/interface";
import { confirmAlert } from "react-confirm-alert";
import { ComponentAuthorizer, HelpButton } from "./navigation";
import PasswordChecklist from "react-password-checklist";
import { User, updatePassword } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import Calendar from "react-calendar";
import { LinkSession } from "../utils/policies";
import { getFunctions, httpsCallable } from "firebase/functions";

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
        const functions = getFunctions();
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

    const handleUserDetails = async (event: FormEvent<HTMLElement>) => {
      event.preventDefault();
      setIsSaving(true);
      try {
        if (userEmail.toLowerCase() === email?.toLowerCase()) {
          alert("Please do not invite yourself.");
          return;
        }
        const functions = getFunctions();
        const getUserByEmail = httpsCallable(functions, "getUserByEmail");
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
        const userRoles = userData.customClaims;
        if (userRoles && userRoles[congregation]) {
          alert("This user is already part of the congregation.");
          return;
        }
        const updateUserAccess = httpsCallable(functions, "updateUserAccess");
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
        alert(`Granted ${roleDisplay} access to ${userEmail}.`);
        modal.hide();
      } catch (error) {
        errorHandler(errorMessage((error as FirebaseError).code), rollbar);
      } finally {
        setIsSaving(false);
      }
    };
    return (
      <Modal {...bootstrapDialog(modal)}>
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

const UpdateAddressFeedback = NiceModal.create(
  ({
    name,
    footerSaveAcl = USER_ACCESS_LEVELS.READ_ONLY.CODE,
    postalCode,
    congregation,
    helpLink,
    currentFeedback = ""
  }: {
    name: string;
    footerSaveAcl: number | undefined;
    postalCode: string;
    congregation: string | undefined;
    helpLink: string;
    currentFeedback: string;
  }) => {
    const [feedback, setFeedback] = useState(currentFeedback);
    const [isSaving, setIsSaving] = useState(false);
    const modal = useModal();
    const rollbar = useRollbar();

    const handleSubmitFeedback = async (event: FormEvent<HTMLElement>) => {
      event.preventDefault();
      setIsSaving(true);
      try {
        await pollingVoidFunction(() =>
          set(ref(database, `/${postalCode}/feedback`), feedback)
        );
        if (feedback)
          rollbar.info(
            `Conductor feedback on postalcode ${postalCode} of the ${congregation} congregation: ${feedback}`
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

const ChangeTerritoryName = NiceModal.create(
  ({
    name,
    footerSaveAcl = USER_ACCESS_LEVELS.READ_ONLY.CODE,
    congregation,
    territoryCode
  }: {
    name: string | undefined;
    footerSaveAcl: number | undefined;
    congregation: string | undefined;
    territoryCode: string;
  }) => {
    const [territoryName, setTerritoryName] = useState(name);
    const [isSaving, setIsSaving] = useState(false);
    const modal = useModal();
    const rollbar = useRollbar();

    const handleUpdateTerritoryName = async (event: FormEvent<HTMLElement>) => {
      event.preventDefault();
      setIsSaving(true);
      try {
        await pollingVoidFunction(() =>
          set(
            ref(
              database,
              `congregations/${congregation}/territories/${territoryCode}/name`
            ),
            territoryName
          )
        );
        modal.resolve(territoryName);
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
          <Modal.Title>Change Territory Name</Modal.Title>
          <HelpButton link={WIKI_CATEGORIES.CHANGE_TERRITORY_NAME} />
        </Modal.Header>
        <Form onSubmit={handleUpdateTerritoryName}>
          <Modal.Body>
            <GenericInputField
              label="Name"
              name="name"
              handleChange={(event) => {
                const { value } = event.target as HTMLInputElement;
                setTerritoryName(value);
              }}
              changeValue={territoryName}
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

const ChangeTerritoryCode = NiceModal.create(
  ({
    footerSaveAcl = USER_ACCESS_LEVELS.READ_ONLY.CODE,
    congregation,
    territoryCode
  }: {
    footerSaveAcl: number | undefined;
    congregation: string | undefined;
    territoryCode: string;
  }) => {
    const [newTerritoryCode, setNewTerritoryCode] = useState(territoryCode);
    const [isSaving, setIsSaving] = useState(false);
    const modal = useModal();
    const rollbar = useRollbar();

    const handleUpdateTerritoryCode = async (event: FormEvent<HTMLElement>) => {
      event.preventDefault();
      setIsSaving(true);
      try {
        const newCodeRef = ref(
          database,
          `congregations/${congregation}/territories/${newTerritoryCode}`
        );
        const existingTerritory = await get(newCodeRef);
        if (existingTerritory.exists()) {
          alert(`Territory code, ${newTerritoryCode} already exist.`);
          return;
        }
        const oldCodeRef = ref(
          database,
          `congregations/${congregation}/territories/${territoryCode}`
        );
        const oldTerritoryData = await get(oldCodeRef);
        await pollingVoidFunction(() =>
          set(newCodeRef, oldTerritoryData.val())
        );
        await pollingVoidFunction(() => remove(oldCodeRef));
        modal.resolve(newTerritoryCode);
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
          <Modal.Title>Change Territory Code</Modal.Title>
          <HelpButton link={WIKI_CATEGORIES.CHANGE_TERRITORY_CODE} />
        </Modal.Header>
        <Form onSubmit={handleUpdateTerritoryCode}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="userid">Existing Territory Code</Form.Label>
              <Form.Control
                readOnly
                id="existingcode"
                defaultValue={territoryCode}
              />
            </Form.Group>
            <GenericInputField
              label="New Territory Code"
              name="code"
              handleChange={(event: ChangeEvent<HTMLElement>) => {
                const { value } = event.target as HTMLInputElement;
                setNewTerritoryCode(value);
              }}
              changeValue={newTerritoryCode}
              required={true}
              placeholder={"Territory code. For eg, M01, W12, etc."}
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

const NewTerritoryCode = NiceModal.create(
  ({
    footerSaveAcl = USER_ACCESS_LEVELS.READ_ONLY.CODE,
    congregation
  }: {
    footerSaveAcl: number | undefined;
    congregation: string | undefined;
  }) => {
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const modal = useModal();
    const rollbar = useRollbar();

    const handleCreateTerritory = async (event: FormEvent<HTMLElement>) => {
      event.preventDefault();

      setIsSaving(true);
      try {
        const territoryCodeReference = child(
          ref(database),
          `congregations/${congregation}/territories/${code}`
        );
        const existingTerritory = await pollingQueryFunction(() =>
          get(territoryCodeReference)
        );
        if (existingTerritory.exists()) {
          alert(`Territory code, ${code} already exist.`);
          return;
        }
        await pollingVoidFunction(() =>
          set(territoryCodeReference, {
            name: name
          })
        );
        alert(`Created territory, ${name}.`);
        window.location.reload();
      } catch (error) {
        errorHandler(error, rollbar);
      } finally {
        setIsSaving(false);
      }
    };
    return (
      <Modal {...bootstrapDialog(modal)}>
        <Modal.Header>
          <Modal.Title>Create New Territory</Modal.Title>
          <HelpButton link={WIKI_CATEGORIES.CREATE_TERRITORIES} />
        </Modal.Header>
        <Form onSubmit={handleCreateTerritory}>
          <Modal.Body>
            <GenericInputField
              label="Territory Code"
              name="code"
              handleChange={(e: ChangeEvent<HTMLElement>) => {
                const { value } = e.target as HTMLInputElement;
                setCode(value);
              }}
              changeValue={code}
              required={true}
              placeholder={"Territory code. For eg, M01, W12, etc."}
            />
            <GenericInputField
              label="Name"
              name="name"
              handleChange={(e: ChangeEvent<HTMLElement>) => {
                const { value } = e.target as HTMLInputElement;
                setName(value);
              }}
              changeValue={name}
              required={true}
              placeholder={
                "Name of the territory. For eg, 801-810, Woodlands Drive."
              }
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

const NewPublicAddress = NiceModal.create(
  ({
    footerSaveAcl = USER_ACCESS_LEVELS.READ_ONLY.CODE,
    congregation,
    territoryCode
  }: {
    footerSaveAcl: number | undefined;
    congregation: string | undefined;
    territoryCode: string;
  }) => {
    const [postalCode, setPostalCode] = useState("");
    const [name, setName] = useState("");
    const [sequence, setSequence] = useState("");
    const [floors, setFloors] = useState(1);

    const [isSaving, setIsSaving] = useState(false);
    const modal = useModal();
    const rollbar = useRollbar();

    const handleCreateTerritoryAddress = async (
      event: FormEvent<HTMLElement>
    ) => {
      event.preventDefault();

      if (!isValidPostal(postalCode)) {
        alert("Invalid postal code");
        return;
      }

      if (!isValidPostalSequence(sequence, TERRITORY_TYPES.PUBLIC)) {
        alert("Invalid sequence");
        return;
      }

      // Add empty details for 0 floor
      const floorDetails = [{}];
      const units = sequence.split(",");
      for (let i = 0; i < floors; i++) {
        const floorMap = {} as unitMaps;
        units.forEach((unitNo, index) => {
          const processedUnitNumber = processPropertyNumber(
            unitNo,
            TERRITORY_TYPES.PUBLIC
          );
          if (!processedUnitNumber) return;
          floorMap[processedUnitNumber] = {
            status: STATUS_CODES.DEFAULT,
            type: HOUSEHOLD_TYPES.CHINESE,
            note: "",
            nhcount: NOT_HOME_STATUS_CODES.DEFAULT,
            languages: "",
            sequence: index
          };
        });
        floorDetails.push(floorMap);
      }

      setIsSaving(true);
      try {
        const addressReference = ref(database, postalCode);
        const existingAddress = await get(addressReference);
        if (existingAddress.exists()) {
          alert(`Postal address, ${postalCode} already exist.`);
          return;
        }
        await pollingVoidFunction(() =>
          set(
            push(
              ref(
                database,
                `congregations/${congregation}/territories/${territoryCode}/addresses`
              )
            ),
            postalCode
          )
        );
        await pollingVoidFunction(() =>
          set(addressReference, {
            name: name,
            feedback: "",
            units: floorDetails,
            type: TERRITORY_TYPES.PUBLIC
          })
        );
        alert(`Created postal address, ${postalCode}.`);
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
          <Modal.Title>Create Public Address</Modal.Title>
          <HelpButton link={WIKI_CATEGORIES.CREATE_PUBLIC_ADDRESS} />
        </Modal.Header>
        <Form onSubmit={handleCreateTerritoryAddress}>
          <Modal.Body>
            <p>
              These are governmental owned residential properties that usually
              consist of rental flats.
            </p>
            <GenericInputField
              inputType="number"
              label="Postal Code"
              name="postalcode"
              handleChange={(e: ChangeEvent<HTMLElement>) => {
                const { value } = e.target as HTMLInputElement;
                setPostalCode(value);
              }}
              changeValue={postalCode}
              required={true}
              placeholder={
                "Block/Building postal code. Eg, 730801, 752367, etc"
              }
            />
            <GenericInputField
              label="Address Name"
              name="name"
              handleChange={(e: ChangeEvent<HTMLElement>) => {
                const { value } = e.target as HTMLInputElement;
                setName(value);
              }}
              changeValue={name}
              required={true}
              placeholder={
                "Block/Building name. Eg, 367, Sembawang Star Crescent"
              }
            />
            <FloorField
              handleChange={(e: ChangeEvent<HTMLElement>) => {
                const { value } = e.target as HTMLInputElement;
                setFloors(Number(value));
              }}
              changeValue={floors}
            />
            <GenericTextAreaField
              label="Unit Sequence"
              name="units"
              placeholder="Unit sequence with comma seperator. For eg, 301,303,305 ..."
              handleChange={(e: ChangeEvent<HTMLElement>) => {
                const { value } = e.target as HTMLInputElement;
                setSequence(value);
              }}
              changeValue={sequence}
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

const NewPrivateAddress = NiceModal.create(
  ({
    footerSaveAcl = USER_ACCESS_LEVELS.READ_ONLY.CODE,
    congregation,
    territoryCode
  }: {
    footerSaveAcl: number | undefined;
    congregation: string | undefined;
    territoryCode: string;
  }) => {
    const [postalCode, setPostalCode] = useState("");
    const [name, setName] = useState("");
    const [sequence, setSequence] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const modal = useModal();
    const rollbar = useRollbar();

    const handleCreateTerritoryAddress = async (
      event: FormEvent<HTMLElement>
    ) => {
      event.preventDefault();

      if (!isValidPostal(postalCode)) {
        alert("Invalid postal code");
        return;
      }

      if (!isValidPostalSequence(sequence, TERRITORY_TYPES.PRIVATE)) {
        alert("Invalid sequence");
        return;
      }

      // Add empty details for 0 floor
      const floorDetails = [{}];
      const units = sequence.split(",");
      const floorMap = {} as unitMaps;
      units.forEach((unitNo, index) => {
        const processedUnitNumber = processPropertyNumber(
          unitNo,
          TERRITORY_TYPES.PRIVATE
        );
        if (!processedUnitNumber) return;
        floorMap[processedUnitNumber] = {
          status: STATUS_CODES.DEFAULT,
          type: HOUSEHOLD_TYPES.CHINESE,
          note: "",
          nhcount: NOT_HOME_STATUS_CODES.DEFAULT,
          languages: "",
          sequence: index
        };
      });
      floorDetails.push(floorMap);

      setIsSaving(true);
      try {
        const addressReference = ref(database, postalCode);
        const existingAddress = await get(addressReference);
        if (existingAddress.exists()) {
          alert(`Postal address, ${postalCode} already exist.`);
          return;
        }
        await pollingVoidFunction(() =>
          set(
            push(
              ref(
                database,
                `congregations/${congregation}/territories/${territoryCode}/addresses`
              )
            ),
            postalCode
          )
        );
        await pollingVoidFunction(() =>
          set(addressReference, {
            name: name,
            feedback: "",
            units: floorDetails,
            type: TERRITORY_TYPES.PRIVATE
          })
        );
        alert(`Created private address, ${postalCode}.`);
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
          <Modal.Title>Create Private Address</Modal.Title>
          <HelpButton link={WIKI_CATEGORIES.CREATE_PRIVATE_ADDRESS} />
        </Modal.Header>
        <Form onSubmit={handleCreateTerritoryAddress}>
          <Modal.Body>
            <p>
              These are non-governmental owned residential properties such as
              terrace houses, semi-detached houses, bungalows or cluster houses.
            </p>
            <GenericInputField
              inputType="number"
              label="Postal Code"
              name="postalcode"
              handleChange={(e: ChangeEvent<HTMLElement>) => {
                const { value } = e.target as HTMLInputElement;
                setPostalCode(value);
              }}
              changeValue={postalCode}
              required={true}
              placeholder={"Estate postal code"}
              information="A postal code within the private estate. This code will be used for locating the estate."
            />
            <GenericInputField
              label="Address Name"
              name="name"
              handleChange={(e: ChangeEvent<HTMLElement>) => {
                const { value } = e.target as HTMLInputElement;
                setName(value);
              }}
              changeValue={name}
              required={true}
              placeholder={"For eg, Sembawang Boulevard Crescent"}
            />
            <GenericTextAreaField
              label="House Sequence"
              name="units"
              placeholder="House sequence with comma seperator. For eg, 1A,1B,2A ..."
              handleChange={(e: ChangeEvent<HTMLElement>) => {
                const { value } = e.target as HTMLInputElement;
                setSequence(value);
              }}
              changeValue={sequence}
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

const processPostalUnitNumber = async (
  postalCode: string,
  unitNumber: string,
  addressData: addressDetails | undefined,
  isDelete = false
) => {
  if (!addressData) return;

  if (!isDelete) {
    const existingUnitNo = await get(
      ref(
        database,
        `/${postalCode}/units/${addressData.floors[0].floor}/${unitNumber}`
      )
    );
    if (existingUnitNo.exists()) {
      alert(`Unit number, ${unitNumber} already exist.`);
      return;
    }
  }

  const unitUpdates: unitMaps = {};
  const lastSequenceNo = addressData.floors[0].units.length + 1;
  for (const index in addressData.floors) {
    const floorDetails = addressData.floors[index];
    floorDetails.units.forEach(() => {
      unitUpdates[`/${postalCode}/units/${floorDetails.floor}/${unitNumber}`] =
        isDelete
          ? {}
          : {
              type: HOUSEHOLD_TYPES.CHINESE,
              note: "",
              status: STATUS_CODES.DEFAULT,
              nhcount: NOT_HOME_STATUS_CODES.DEFAULT,
              x_floor: floorDetails.floor,
              languages: "",
              sequence: lastSequenceNo
            };
    });
  }
  await pollingVoidFunction(() => update(ref(database), unitUpdates));
};

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

const UpdateUnit = NiceModal.create(
  ({
    postalCode,
    unitNo,
    unitSequence,
    unitLength,
    unitDisplay,
    addressData
  }: {
    unitSequence: number | undefined;
    unitLength: number;
    unitNo: string;
    unitDisplay: string;
    postalCode: string;
    addressData: addressDetails;
  }) => {
    const [unitSeq, setUnitSeq] = useState(unitSequence);
    const [isSaving, setIsSaving] = useState(false);
    const modal = useModal();
    const rollbar = useRollbar();

    const processPostalUnitSequence = async (
      postalCode: string,
      unitNumber: string,
      sequence: number | undefined
    ) => {
      if (!addressData) return;

      const unitUpdates: unitMaps = {};
      for (const index in addressData.floors) {
        const floorDetails = addressData.floors[index];
        floorDetails.units.forEach(() => {
          unitUpdates[
            `/${postalCode}/units/${floorDetails.floor}/${unitNumber}/sequence`
          ] = sequence === undefined ? {} : sequence;
        });
      }
      setIsSaving(true);
      try {
        await pollingVoidFunction(() => update(ref(database), unitUpdates));
        modal.hide();
      } catch (error) {
        errorHandler(error, rollbar);
      } finally {
        setIsSaving(false);
      }
    };

    const handleUpdateUnit = async (event: FormEvent<HTMLElement>) => {
      event.preventDefault();
      processPostalUnitSequence(postalCode, unitNo, unitSeq);
    };

    return (
      <Modal {...bootstrapDialog(modal)}>
        <Modal.Header>
          <Modal.Title>Unit {unitDisplay}</Modal.Title>
          <HelpButton link={WIKI_CATEGORIES.UPDATE_UNIT_NUMBER} />
        </Modal.Header>
        <Form onSubmit={handleUpdateUnit}>
          <Modal.Body>
            <GenericInputField
              inputType="number"
              label="Sequence Number"
              name="sequence"
              placeholder="Optional unit row sequence number"
              handleChange={(e: ChangeEvent<HTMLElement>) => {
                const { value } = e.target as HTMLInputElement;
                const parsedValue = parseInt(value);
                setUnitSeq(isNaN(parsedValue) ? undefined : parsedValue);
              }}
              changeValue={unitSeq === undefined ? undefined : `${unitSeq}`}
            />
          </Modal.Body>
          <Modal.Footer className="justify-content-around">
            <Button variant="secondary" onClick={() => modal.hide()}>
              Close
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                const hasOnlyOneUnitNumber = unitLength === 1;
                if (hasOnlyOneUnitNumber) {
                  alert(`Territory requires at least 1 unit number.`);
                  return;
                }
                modal.hide();
                confirmAlert({
                  customUI: ({ onClose }) => {
                    return (
                      <Container>
                        <Card bg="warning" className="text-center">
                          <Card.Header>
                            Warning ⚠️
                            <HelpButton
                              link={WIKI_CATEGORIES.ADD_DELETE_PRIVATE_PROPERTY}
                              isWarningButton={true}
                            />
                          </Card.Header>
                          <Card.Body>
                            <Card.Title>Are You Very Sure ?</Card.Title>
                            <Card.Text>
                              This action will delete unit number {unitNo} of{" "}
                              {postalCode}.
                            </Card.Text>
                            <Button
                              className="m-1"
                              variant="primary"
                              onClick={() => {
                                processPostalUnitNumber(
                                  postalCode,
                                  unitNo,
                                  addressData,
                                  true
                                );
                                onClose();
                              }}
                            >
                              Yes, Delete It.
                            </Button>
                            <Button
                              className="no-confirm-btn"
                              variant="primary"
                              onClick={() => {
                                onClose();
                              }}
                            >
                              No
                            </Button>
                          </Card.Body>
                        </Card>
                      </Container>
                    );
                  }
                });
              }}
            >
              Delete Unit
            </Button>
            <ModalSubmitButton isSaving={isSaving} />
          </Modal.Footer>
        </Form>
      </Modal>
    );
  }
);

const UpdateUnitStatus = NiceModal.create(
  ({
    addressName,
    userAccessLevel = USER_ACCESS_LEVELS.READ_ONLY.CODE,
    territoryType,
    postalCode,
    unitNo,
    unitNoDisplay,
    addressData,
    floor,
    floorDisplay,
    unitDetails,
    trackRace = false,
    trackLanguages = false
  }: {
    addressName: string | undefined;
    userAccessLevel: number | undefined;
    congregation: string | undefined;
    territoryType: number | undefined;
    postalCode: string;
    floor: string;
    floorDisplay: string;
    unitNo: string;
    unitNoDisplay: string;
    trackRace: boolean;
    trackLanguages: boolean;
    addressData: addressDetails | undefined;
    unitDetails: unitDetails | undefined;
  }) => {
    const status = unitDetails?.status;
    const [isNotHome, setIsNotHome] = useState(
      status === STATUS_CODES.NOT_HOME
    );
    const [isDnc, setIsDnc] = useState(status === STATUS_CODES.DO_NOT_CALL);
    const [isSaving, setIsSaving] = useState(false);
    const [hhType, setHhtype] = useState(unitDetails?.type);
    const [unitStatus, setUnitStatus] = useState(status);
    const [hhDnctime, setHhDnctime] = useState<number | undefined>(
      unitDetails?.dnctime
    );
    const [hhPropertyPostal, setHhPropertyPostal] = useState<
      string | undefined
    >(unitDetails?.propertyPostal);
    const [hhNhcount, setHhNhcount] = useState(unitDetails?.nhcount);
    const [hhLanguages, setHhLanguages] = useState(unitDetails?.languages);
    const [hhNote, setHhNote] = useState(unitDetails?.note);
    const [unitSequence, setUnitSequence] = useState<undefined | number>(
      unitDetails?.sequence
    );
    const modal = useModal();
    const rollbar = useRollbar();

    const handleSubmitClick = async (event: FormEvent<HTMLElement>) => {
      event.preventDefault();
      const updateData: {
        type: string | undefined;
        note: string | undefined;
        status: string | undefined;
        nhcount: string | undefined;
        languages: string | undefined;
        dnctime: number | string;
        sequence?: number;
        x_zip?: string;
      } = {
        type: hhType,
        note: hhNote,
        status: unitStatus,
        nhcount: hhNhcount,
        languages: hhLanguages,
        dnctime: hhDnctime || ""
      };
      // Include sequence update value only when administering private territories
      const administeringPrivate =
        territoryType === TERRITORY_TYPES.PRIVATE &&
        userAccessLevel === USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE;
      if (administeringPrivate && unitSequence) {
        updateData.sequence = Number(unitSequence);
      }
      if (administeringPrivate && hhPropertyPostal) {
        updateData.x_zip = hhPropertyPostal;
      }
      setIsSaving(true);
      try {
        await pollingVoidFunction(() =>
          update(
            ref(database, `/${postalCode}/units/${floor}/${unitNo}`),
            updateData
          )
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
        <ModalUnitTitle
          unit={unitNoDisplay}
          propertyPostal={unitDetails?.propertyPostal}
          floor={floorDisplay}
          postal={postalCode}
          type={territoryType}
          name={addressName || ""}
        />
        <Form onSubmit={handleSubmitClick}>
          <Modal.Body>
            <HHStatusField
              handleGroupChange={(toggleValue) => {
                let dnctime = undefined;
                setIsNotHome(false);
                setIsDnc(false);
                if (toggleValue === STATUS_CODES.NOT_HOME) {
                  setIsNotHome(true);
                } else if (toggleValue === STATUS_CODES.DO_NOT_CALL) {
                  setIsDnc(true);
                  dnctime = new Date().getTime();
                }
                setHhNhcount(NOT_HOME_STATUS_CODES.DEFAULT);
                setHhDnctime(dnctime);
                setUnitStatus(toggleValue);
              }}
              changeValue={unitStatus}
            />
            <Collapse in={isDnc}>
              <div className="text-center">
                <DncDateField
                  changeDate={hhDnctime}
                  handleDateChange={(date) => {
                    setHhDnctime(date.getTime());
                  }}
                />
              </div>
            </Collapse>
            <Collapse in={isNotHome}>
              <div className="text-center">
                <HHNotHomeField
                  changeValue={hhNhcount}
                  handleGroupChange={(toggleValue) => {
                    setHhNhcount(toggleValue);
                  }}
                />
              </div>
            </Collapse>
            {trackRace && (
              <HHTypeField
                handleChange={(e: ChangeEvent<HTMLElement>) => {
                  const { value } = e.target as HTMLInputElement;
                  setHhtype(value);
                }}
                changeValue={hhType}
              />
            )}
            {trackLanguages && (
              <HHLangField
                handleChangeValues={(languages) =>
                  setHhLanguages(processHHLanguages(languages))
                }
                changeValues={parseHHLanguages(hhLanguages)}
              />
            )}
            <GenericTextAreaField
              label="Notes"
              name="note"
              placeholder="Optional non-personal information. Eg, Renovation, Foreclosed, Friends, etc."
              handleChange={(e: ChangeEvent<HTMLElement>) => {
                const { value } = e.target as HTMLInputElement;
                setHhNote(value);
              }}
              changeValue={hhNote}
            />
            {territoryType === TERRITORY_TYPES.PRIVATE && (
              <ComponentAuthorizer
                requiredPermission={USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE}
                userPermission={userAccessLevel}
              >
                <>
                  <GenericInputField
                    inputType="number"
                    label="Territory Sequence"
                    name="sequence"
                    handleChange={(e: ChangeEvent<HTMLElement>) => {
                      const { value } = e.target as HTMLInputElement;
                      const parsedValue = parseInt(value);
                      setUnitSequence(
                        isNaN(parsedValue) ? undefined : parsedValue
                      );
                    }}
                    changeValue={
                      unitSequence === undefined ? undefined : `${unitSequence}`
                    }
                  />
                  <GenericInputField
                    inputType="string"
                    label="Property Postal"
                    name="propertyPostal"
                    placeholder="Optional postal code for direction to this property"
                    handleChange={(e: ChangeEvent<HTMLElement>) => {
                      const { value } = e.target as HTMLInputElement;
                      setHhPropertyPostal(value);
                    }}
                    changeValue={hhPropertyPostal}
                  />
                </>
              </ComponentAuthorizer>
            )}
          </Modal.Body>
          <ModalFooter
            propertyPostal={unitDetails?.propertyPostal}
            handleClick={() => modal.hide()}
            isSaving={isSaving}
            userAccessLevel={userAccessLevel}
            handleDelete={() => {
              modal.hide();
              confirmAlert({
                customUI: ({ onClose }) => {
                  return (
                    <Container>
                      <Card bg="warning" className="text-center">
                        <Card.Header>
                          Warning ⚠️
                          <HelpButton
                            link={WIKI_CATEGORIES.ADD_DELETE_PRIVATE_PROPERTY}
                            isWarningButton={true}
                          />
                        </Card.Header>
                        <Card.Body>
                          <Card.Title>Are You Very Sure ?</Card.Title>
                          <Card.Text>
                            This action will delete private property number{" "}
                            {unitNo} of {addressName}.
                          </Card.Text>
                          <Button
                            className="m-1"
                            variant="primary"
                            onClick={() => {
                              processPostalUnitNumber(
                                postalCode,
                                unitNo,
                                addressData,
                                true
                              );
                              onClose();
                            }}
                          >
                            Yes, Delete It.
                          </Button>
                          <Button
                            className="no-confirm-btn"
                            variant="primary"
                            onClick={() => {
                              onClose();
                            }}
                          >
                            No
                          </Button>
                        </Card.Body>
                      </Card>
                    </Container>
                  );
                }
              });
            }}
            type={territoryType}
          />
        </Form>
      </Modal>
    );
  }
);

const GetProfile = NiceModal.create(
  ({
    email,
    name,
    maxTries,
    homeLanguage
  }: {
    email: string | null;
    name: string | null;
    maxTries: number | undefined;
    homeLanguage: string | undefined;
  }) => {
    const modal = useModal();

    return (
      <Modal {...bootstrapDialog(modal)}>
        <Modal.Header>
          <Modal.Title>My Profile</Modal.Title>
        </Modal.Header>
        <Form>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="userid">Email</Form.Label>
              <Form.Control
                readOnly
                id="userid"
                defaultValue={email || undefined}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="userid">Name</Form.Label>
              <Form.Control
                readOnly
                id="userid"
                defaultValue={name || undefined}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="txtMaxTries">Max Tries</Form.Label>
              <Form.Control readOnly id="txtMaxTries" defaultValue={maxTries} />
              <Form.Text muted>
                The number of times to try not at homes before considering it
                done
              </Form.Text>
            </Form.Group>
            {homeLanguage && (
              <Form.Group className="mb-3">
                <Form.Label htmlFor="txtHomeLanguage">Home Language</Form.Label>
                <Form.Control
                  readOnly
                  id="txtHomeLanguage"
                  defaultValue={homeLanguage}
                />
              </Form.Group>
            )}
            <Form.Group className="mb-3">
              <Form.Label htmlFor="userid">Application Version</Form.Label>
              <Form.Control
                readOnly
                id="appversionno"
                defaultValue={process.env.REACT_APP_VERSION}
              />
            </Form.Group>
          </Modal.Body>
          <ModalFooter
            handleClick={modal.hide}
            userAccessLevel={USER_ACCESS_LEVELS.READ_ONLY.CODE}
          />
        </Form>
      </Modal>
    );
  }
);

const ChangePassword = NiceModal.create(
  ({
    user,
    userAccessLevel
  }: {
    user: User;
    userAccessLevel: number | undefined;
  }) => {
    const modal = useModal();
    const rollbar = useRollbar();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isChangePasswordOk, setIsChangePasswordOk] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleChangePassword = async (
      event: React.FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();
      event.stopPropagation();
      try {
        setIsSaving(true);
        await updatePassword(user, password);
        rollbar.info(
          `User updated password! Email: ${user.email}, Name: ${user.displayName}`
        );
        alert("Password updated.");
        modal.hide();
      } catch (error) {
        errorHandler(errorMessage((error as FirebaseError).code), rollbar);
        return;
      } finally {
        setIsSaving(false);
      }
    };

    return (
      <Modal {...bootstrapDialog(modal)}>
        <Modal.Header>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleChangePassword}>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="formBasicNewPassword">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                onChange={(event) => {
                  const { value } = event.target as HTMLInputElement;
                  setPassword(value);
                }}
                required
              />
            </Form.Group>
            <Form.Group
              className="mb-3"
              controlId="formBasicConfirmNewPassword"
            >
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control
                type="password"
                onChange={(event) => {
                  const { value } = event.target as HTMLInputElement;
                  setConfirmPassword(value);
                }}
                required
              />
            </Form.Group>
            <PasswordChecklist
              rules={PASSWORD_POLICY}
              minLength={MINIMUM_PASSWORD_LENGTH}
              value={password || ""}
              valueAgain={confirmPassword || ""}
              onChange={(isValid) => setIsChangePasswordOk(isValid)}
            />
          </Modal.Body>
          <ModalFooter
            handleClick={() => modal.hide()}
            userAccessLevel={userAccessLevel}
            isSaving={isSaving}
            disableSubmitBtn={!isChangePasswordOk}
          />
        </Form>
      </Modal>
    );
  }
);

const UpdateAddressInstructions = NiceModal.create(
  ({
    congregation,
    postalCode,
    addressName,
    userAccessLevel,
    instructions
  }: {
    addressName: string;
    congregation: string | undefined;
    postalCode: string | undefined;
    userAccessLevel: number | undefined;
    instructions: string | undefined;
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
        if (addressInstructions)
          rollbar.info(
            `Admin instructions on postalcode ${postalCode} of the ${congregation} congregation: ${addressInstructions}`
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

const UpdatePersonalSlipExpiry = NiceModal.create(
  ({
    addressName,
    userAccessLevel
  }: {
    addressName: string;
    userAccessLevel: number | undefined;
  }) => {
    const modal = useModal();
    const [linkExpiryHrs, setLinkExpiryHrs] = useState<number | undefined>();
    const [name, setName] = useState<string>();

    const handleSubmitPersonalSlip = async (event: FormEvent<HTMLElement>) => {
      event.preventDefault();
      if (!linkExpiryHrs) {
        alert("Please select an expiry date.");
        return;
      }
      modal.resolve({ linkExpiryHrs: linkExpiryHrs, publisherName: name });
      modal.hide();
    };

    return (
      <Modal {...bootstrapDialog(modal)}>
        <Modal.Header>
          <Modal.Title>{`Select personal slip expiry date for ${addressName}`}</Modal.Title>
          <HelpButton link={WIKI_CATEGORIES.CREATE_PERSONAL_SLIPS} />
        </Modal.Header>
        <Form onSubmit={handleSubmitPersonalSlip}>
          <Modal.Body>
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
            <GenericInputField
              label="Publisher Name"
              name="name"
              handleChange={(event) => {
                const { value } = event.target as HTMLInputElement;
                setName(value);
              }}
              placeholder="Optional name of the assigned publisher"
              changeValue={name}
            />
          </Modal.Body>
          <ModalFooter
            handleClick={() => modal.hide()}
            userAccessLevel={userAccessLevel}
            requiredAcLForSave={USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE}
            isSaving={false}
            submitLabel="Assign"
          />
        </Form>
      </Modal>
    );
  }
);

const GetAssignments = NiceModal.create(
  ({ assignments }: { assignments: LinkSession[] }) => {
    const modal = useModal();

    return (
      <Modal {...bootstrapDialog(modal)}>
        <Modal.Header>
          <Modal.Title>Assignments</Modal.Title>
          <HelpButton link={WIKI_CATEGORIES.GET_ASSIGNMENTS} />
        </Modal.Header>
        <Modal.Body>
          <ListGroup
            style={{
              height: LINK_SELECTOR_VIEWPORT_HEIGHT,
              overflow: "auto"
            }}
          >
            {assignments.map((assignment) => {
              return (
                <ListGroup.Item
                  key={`assignment-${assignment.key}`}
                  className="d-flex justify-content-between align-items-center"
                >
                  <div className="ms-2 me-auto">
                    <div className="fluid-text fw-bold">
                      <a
                        href={`${assignment.postalCode}/${assignment.congregation}/${assignment.key}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {assignment.name}
                      </a>
                    </div>
                    <div className="fluid-text">
                      {LinkTypeDescription(assignment.linkType)}
                    </div>
                    {assignment.publisherName && (
                      <div className="fluid-text">
                        Publisher : {assignment.publisherName}
                      </div>
                    )}
                    <div className="fluid-text">
                      Created Dt :{" "}
                      {LinkDateFormatter.format(
                        new Date(assignment.tokenCreatetime)
                      )}
                    </div>
                    <div className="fluid-text">
                      Expiry Dt :{" "}
                      {LinkDateFormatter.format(
                        new Date(assignment.tokenEndtime)
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline-warning"
                    className="me-1"
                    onClick={async (event) => {
                      const { linkid, postal } = event.currentTarget.dataset;
                      await pollingVoidFunction(() =>
                        remove(ref(database, `links/${linkid}`))
                      );
                      await triggerPostalCodeListeners(`${postal}`);
                    }}
                    data-linkid={assignment.key}
                    data-postal={assignment.postalCode}
                  >
                    🗑️
                  </Button>
                </ListGroup.Item>
              );
            })}
          </ListGroup>
        </Modal.Body>
        <ModalFooter
          handleClick={() => modal.hide()}
          userAccessLevel={USER_ACCESS_LEVELS.READ_ONLY.CODE}
        />
      </Modal>
    );
  }
);
export {
  ChangeAddressName,
  UpdateAddressFeedback,
  ChangeTerritoryName,
  ChangeTerritoryCode,
  ChangeAddressPostalCode,
  NewTerritoryCode,
  NewPublicAddress,
  NewPrivateAddress,
  NewUnit,
  UpdateUnit,
  UpdateUnitStatus,
  GetProfile,
  ChangePassword,
  UpdateAddressInstructions,
  UpdatePersonalSlipExpiry,
  GetAssignments,
  UpdateUser,
  InviteUser
};
