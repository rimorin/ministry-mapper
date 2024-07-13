import NiceModal, { useModal, bootstrapDialog } from "@ebay/nice-modal-react";
import { useRollbar } from "@rollbar/react";
import { ref, get, set, push } from "firebase/database";
import { useState, FormEvent, ChangeEvent } from "react";
import { Modal, Form } from "react-bootstrap";
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
  NewPrivateAddressModalProps,
  latlongInterface,
  unitMaps
} from "../../utils/interface";
import ModalFooter from "../form/footer";
import GenericInputField from "../form/input";
import GenericTextAreaField from "../form/textarea";
import HelpButton from "../navigation/help";
import { database } from "../../firebase";
import ModalManager from "@ebay/nice-modal-react";
import ChangeAddressGeolocation from "./changegeolocation";
import { usePostHog } from "posthog-js/react";

const NewPrivateAddress = NiceModal.create(
  ({
    footerSaveAcl = USER_ACCESS_LEVELS.READ_ONLY.CODE,
    congregation,
    territoryCode,
    defaultType,
    origin
  }: NewPrivateAddressModalProps) => {
    const [postalCode, setPostalCode] = useState("");
    const [name, setName] = useState("");
    const [location, setLocation] = useState("");
    const [coordinates, setCoordinates] = useState<latlongInterface>();
    const [sequence, setSequence] = useState("");
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
          type: defaultType,
          note: "",
          nhcount: NOT_HOME_STATUS_CODES.DEFAULT,
          sequence: index
        };
      });
      floorDetails.push(floorMap);

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
            location: location,
            units: floorDetails,
            type: TERRITORY_TYPES.PRIVATE,
            coordinates: coordinates
          })
        );
        posthog?.capture("create_private_address", {
          mapId: postalCode,
          name: name,
          location: location,
          units: floorDetails,
          type: TERRITORY_TYPES.PRIVATE,
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
          <Modal.Title>Create Private Address</Modal.Title>
          <HelpButton link={WIKI_CATEGORIES.CREATE_PRIVATE_ADDRESS} />
        </Modal.Header>
        <Form onSubmit={handleCreateTerritoryAddress}>
          <Modal.Body
            style={{
              maxHeight: window.innerHeight < 700 ? "70dvh" : "80dvh",
              overflowY: "auto"
            }}
          >
            <p>
              These are non-governmental owned residential properties such as
              terrace houses, semi-detached houses, bungalows or cluster houses.
            </p>
            <GenericInputField
              inputType="number"
              label={modalDescription}
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

export default NewPrivateAddress;
