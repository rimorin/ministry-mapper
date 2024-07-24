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
  NOT_HOME_STATUS_CODES,
  WIKI_CATEGORIES
} from "../../utils/constants";
import isValidPostal from "../../utils/helpers/checkvalidpostal";
import isValidPostalSequence from "../../utils/helpers/checkvalidseq";
import processPropertyNumber from "../../utils/helpers/processpropertyno";
import pollingVoidFunction from "../../utils/helpers/pollingvoid";
import errorHandler from "../../utils/helpers/errorhandler";
import {
  NewPublicAddressModalProps,
  latlongInterface,
  unitMaps
} from "../../utils/interface";
import FloorField from "../form/floors";
import ModalFooter from "../form/footer";
import GenericInputField from "../form/input";
import GenericTextAreaField from "../form/textarea";
import HelpButton from "../navigation/help";
import ChangeAddressGeolocation from "./changegeolocation";

import ModalManager from "@ebay/nice-modal-react";
import { usePostHog } from "posthog-js/react";
const NewPublicAddress = NiceModal.create(
  ({
    footerSaveAcl = USER_ACCESS_LEVELS.READ_ONLY.CODE,
    congregation,
    territoryCode,
    defaultType,
    origin
  }: NewPublicAddressModalProps) => {
    const [postalCode, setPostalCode] = useState("");
    const [name, setName] = useState("");
    const [sequence, setSequence] = useState("");
    const [floors, setFloors] = useState(1);
    const [location, setLocation] = useState("");
    const [coordinates, setCoordinates] = useState<latlongInterface>();
    const [isSaving, setIsSaving] = useState(false);
    const modal = useModal();
    const rollbar = useRollbar();
    const modalDescription = "Map Number";
    const posthog = usePostHog();

    const handleCreateTerritoryAddress = async (
      event: FormEvent<HTMLElement>
    ) => {
      event.preventDefault();

      if (!isValidPostal(postalCode)) {
        alert(`Invalid ${modalDescription}`);
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
            type: defaultType,
            note: "",
            nhcount: NOT_HOME_STATUS_CODES.DEFAULT,
            sequence: index
          };
        });
        floorDetails.push(floorMap);
      }

      setIsSaving(true);
      try {
        const addressReference = ref(
          database,
          `addresses/${congregation}/${postalCode}`
        );
        const existingAddress = await get(addressReference);
        if (existingAddress.exists()) {
          alert(`${modalDescription}, ${postalCode} already exist.`);
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
            type: TERRITORY_TYPES.PUBLIC,
            location: location,
            coordinates: coordinates
          })
        );
        posthog?.capture("create_public_address", {
          mapId: postalCode,
          name: name,
          location: location,
          coordinates: coordinates
        });
        alert(`Created ${modalDescription}, ${postalCode}.`);
        modal.resolve();
        modal.hide();
      } catch (error) {
        errorHandler(error, rollbar);
      } finally {
        setIsSaving(false);
      }
    };
    return (
      <Modal {...bootstrapDialog(modal)} onHide={() => modal.remove()}>
        <Modal.Header>
          <Modal.Title>Create Public Address</Modal.Title>
          <HelpButton link={WIKI_CATEGORIES.CREATE_PUBLIC_ADDRESS} />
        </Modal.Header>
        <Form onSubmit={handleCreateTerritoryAddress}>
          <Modal.Body
            style={{
              maxHeight: window.innerHeight < 700 ? "70dvh" : "80dvh",
              overflowY: "auto"
            }}
          >
            <p>
              These are governmental owned residential properties that usually
              consist of rental flats.
            </p>
            <GenericInputField
              inputType="number"
              label={"Map Number"}
              name="refNo"
              handleChange={(e: ChangeEvent<HTMLElement>) => {
                const { value } = e.target as HTMLInputElement;
                setPostalCode(value);
              }}
              changeValue={postalCode}
              required={true}
              information="This is a unique identifier for the map, requiring a minimum of 6 unique digits."
            />
            <GenericInputField
              label="Map Name"
              name="name"
              handleChange={(e: ChangeEvent<HTMLElement>) => {
                const { value } = e.target as HTMLInputElement;
                setName(value);
              }}
              changeValue={name}
              required={true}
              information="Description of the map."
            />
            <GenericInputField
              label="Map Coordinates"
              name="location"
              placeholder="Click to select location"
              handleClick={() => {
                ModalManager.show(ChangeAddressGeolocation, {
                  coordinates: coordinates,
                  origin: origin,
                  isNew: true
                }).then((result) => {
                  const coordinates = result as { lat: number; lng: number };
                  if (coordinates) {
                    setLocation(`${coordinates.lat}, ${coordinates.lng}`);
                    setCoordinates(coordinates);
                  }
                });
              }}
              handleChange={() => {}}
              changeValue={location}
              required={true}
              information="Latitude and Longitude of the map. This is used for direction purposes."
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
