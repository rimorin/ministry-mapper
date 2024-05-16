import NiceModal, { useModal, bootstrapDialog } from "@ebay/nice-modal-react";
import { useRollbar } from "@rollbar/react";
import { update, ref } from "firebase/database";
import { useState, FormEvent, ChangeEvent } from "react";
import {
  Modal,
  Form,
  Collapse,
  Container,
  Card,
  Button
} from "react-bootstrap";
import { confirmAlert } from "react-confirm-alert";
import { database } from "../../firebase";
import {
  USER_ACCESS_LEVELS,
  STATUS_CODES,
  TERRITORY_TYPES,
  NOT_HOME_STATUS_CODES,
  WIKI_CATEGORIES,
  DEFAULT_MULTPLE_OPTION_DELIMITER,
  DEFAULT_MAP_DIRECTION_CONGREGATION_LOCATION,
  DEFAULT_COORDINATES
} from "../../utils/constants";
import ModalManager from "@ebay/nice-modal-react";
import pollingVoidFunction from "../../utils/helpers/pollingvoid";
import errorHandler from "../../utils/helpers/errorhandler";
import processPostalUnitNumber from "../../utils/helpers/processpostalno";
import {
  SelectProps,
  UpdateAddressStatusModalProps,
  latlongInterface
} from "../../utils/interface";
import DncDateField from "../form/dncdate";
import ModalFooter from "../form/footer";
import GenericInputField from "../form/input";
import HHNotHomeField from "../form/nothome";
import HHStatusField from "../form/status";
import GenericTextAreaField from "../form/textarea";
import ModalUnitTitle from "../form/title";
import HHTypeField from "../form/household";
import ComponentAuthorizer from "../navigation/authorizer";
import HelpButton from "../navigation/help";
import NewAddressGeolocation from "./newaddgeolocation";

const UpdateUnitStatus = NiceModal.create(
  ({
    congregation,
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
    options,
    defaultOption,
    isMultiselect,
    origin
  }: UpdateAddressStatusModalProps) => {
    const requiresPostalCode =
      origin === DEFAULT_MAP_DIRECTION_CONGREGATION_LOCATION;
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
    const [hhNhcount, setHhNhcount] = useState(unitDetails?.nhcount);
    const [hhNote, setHhNote] = useState(unitDetails?.note);
    const [unitSequence, setUnitSequence] = useState<undefined | number>(
      unitDetails?.sequence
    );
    const defaultCoordinates =
      unitDetails?.coordinates ||
      addressData?.coordinates ||
      DEFAULT_COORDINATES.Singapore;
    const [coordinates, setCoordinates] = useState(defaultCoordinates);
    const [location, setLocation] = useState(
      `${defaultCoordinates.lat}, ${defaultCoordinates.lng}`
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
        dnctime: number | string;
        sequence?: number;
        coordinates?: latlongInterface;
      } = {
        type: hhType,
        note: hhNote,
        status: unitStatus,
        nhcount: hhNhcount,
        dnctime: hhDnctime || ""
      };
      // Include sequence update value only when administering private territories
      const administeringPrivate =
        territoryType === TERRITORY_TYPES.PRIVATE &&
        userAccessLevel === USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE;
      if (administeringPrivate && unitSequence) {
        updateData.sequence = Number(unitSequence);
      }
      if (administeringPrivate && coordinates) {
        updateData.coordinates = coordinates;
      }
      setIsSaving(true);
      try {
        await pollingVoidFunction(() =>
          update(
            ref(
              database,
              `addresses/${congregation}/${postalCode}/units/${floor}/${unitNo}`
            ),
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
          propertyPostal={postalCode}
          floor={floorDisplay as string}
          postal={requiresPostalCode ? postalCode : addressName}
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
                    const dateValue = date as Date;
                    setHhDnctime(dateValue.getTime());
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
            <HHTypeField
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              handleChange={(option: any) => {
                if (isMultiselect) {
                  const values: string[] = [];
                  option.forEach((opt: SelectProps) => {
                    values.push(opt.value);
                  });
                  setHhtype(values.join(DEFAULT_MULTPLE_OPTION_DELIMITER));
                  return;
                }

                setHhtype(option.value);
              }}
              changeValue={hhType}
              options={options.map((option) => ({
                value: option.code,
                label: option.description
              }))}
              isMultiselect={isMultiselect}
            />
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
                      unitSequence === undefined
                        ? undefined
                        : unitSequence.toString()
                    }
                  />
                  <GenericInputField
                    label="Map Coordinates"
                    name="location"
                    handleClick={() => {
                      ModalManager.show(NewAddressGeolocation, {
                        coordinates: coordinates
                      }).then((result) => {
                        const coordinates = result as {
                          lat: number;
                          lng: number;
                        };
                        if (coordinates) {
                          setLocation(`${coordinates.lat}, ${coordinates.lng}`);
                          setCoordinates(coordinates);
                        }
                      });
                    }}
                    handleChange={() => {}}
                    changeValue={location}
                    required={true}
                    information="Latitude and Longitude of the map. You can optionally set the coordinates for this specific address."
                  />
                </>
              </ComponentAuthorizer>
            )}
          </Modal.Body>
          <ModalFooter
            propertyCoordinates={coordinates}
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
                                congregation,
                                postalCode,
                                unitNo,
                                addressData,
                                true,
                                defaultOption
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

export default UpdateUnitStatus;
