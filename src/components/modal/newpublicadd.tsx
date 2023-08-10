import NiceModal, { useModal, bootstrapDialog } from "@ebay/nice-modal-react";
import { useRollbar } from "@rollbar/react";
import { ref, get, set, push } from "firebase/database";
import { useState, FormEvent, ChangeEvent } from "react";
import { Modal, Form } from "react-bootstrap";
import { database } from "../../firebase";
import {
  USER_ACCESS_LEVELS,
  TERRITORY_TYPES,
  STATUS_CODES,
  HOUSEHOLD_TYPES,
  NOT_HOME_STATUS_CODES,
  WIKI_CATEGORIES
} from "../../utils/constants";
import isValidPostal from "../../utils/helpers/checkvalidpostal";
import isValidPostalSequence from "../../utils/helpers/checkvalidseq";
import processPropertyNumber from "../../utils/helpers/processpropertyno";
import pollingVoidFunction from "../../utils/helpers/pollingvoid";
import errorHandler from "../../utils/helpers/errorhandler";
import { unitMaps } from "../../utils/interface";
import FloorField from "../form/floors";
import ModalFooter from "../form/footer";
import GenericInputField from "../form/input";
import GenericTextAreaField from "../form/textarea";
import HelpButton from "../navigation/help";

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

export default NewPublicAddress;
