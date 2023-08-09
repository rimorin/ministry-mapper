import NiceModal, { useModal, bootstrapDialog } from "@ebay/nice-modal-react";
import { useRollbar } from "@rollbar/react";
import { child, ref, get, set } from "firebase/database";
import { useState, FormEvent, ChangeEvent } from "react";
import { Modal, Form } from "react-bootstrap";
import { database } from "../../firebase";
import { USER_ACCESS_LEVELS, WIKI_CATEGORIES } from "../../utils/constants";
import {
  pollingQueryFunction,
  pollingVoidFunction,
  errorHandler
} from "../../utils/helpers";
import ModalFooter from "../form/footer";
import GenericInputField from "../form/input";
import HelpButton from "../navigation/help";

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

export default NewTerritoryCode;
