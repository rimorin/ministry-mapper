import {
  child,
  onValue,
  ref,
  set,
  update,
  remove,
  Unsubscribe,
  push,
  get
} from "firebase/database";
import { signOut } from "firebase/auth";
import { nanoid } from "nanoid";
import {
  MouseEvent,
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
  SyntheticEvent
} from "react";
import {
  Badge,
  Button,
  Card,
  Collapse,
  Container,
  Dropdown,
  DropdownButton,
  Fade,
  Form,
  Modal,
  Navbar,
  ProgressBar,
  Spinner,
  Table
} from "react-bootstrap";
import { database, auth } from "./../firebase";
import Loader from "./loader";
import UnitStatus from "./unit";
import {
  valuesDetails,
  territoryDetails,
  addressDetails,
  adminProps,
  unitMaps
} from "./interface";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import {
  STATUS_CODES,
  MUTABLE_CODES,
  ZeroPad,
  ModalUnitTitle,
  assignmentMessage,
  NavBarBranding,
  LOGIN_TYPE_CODES,
  getMaxUnitLength,
  DEFAULT_FLOOR_PADDING,
  addHours,
  DEFAULT_SELF_DESTRUCT_HOURS,
  getCompletedPercent,
  DEFAULT_PERSONAL_SLIP_DESTRUCT_HOURS,
  FIREBASE_AUTH_UNAUTHORISED_MSG,
  ADMIN_MODAL_TYPES,
  RELOAD_INACTIVITY_DURATION,
  RELOAD_CHECK_INTERVAL_MS,
  errorHandler,
  connectionTimeout,
  TERRITORY_VIEW_WINDOW_WELCOME_TEXT,
  HOUSEHOLD_TYPES,
  MIN_START_FLOOR,
  NOT_HOME_STATUS_CODES,
  parseHHLanguages,
  processHHLanguages,
  TerritoryListing
} from "./util";
import { useParams } from "react-router-dom";
import {
  AdminLinkField,
  FloorField,
  GenericTextAreaField,
  GenericTextField,
  HHLangField,
  HHNotHomeField,
  HHStatusField,
  HHTypeField,
  ModalFooter
} from "./form";
import Welcome from "./welcome";
import UnauthorizedPage from "./unauthorisedpage";
import "react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css";
import { useRollbar } from "@rollbar/react";
function Admin({ user, isConductor = false }: adminProps) {
  const { code } = useParams();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isFeedback, setIsFeedback] = useState<boolean>(false);
  const [isLinkRevoke, setIsLinkRevoke] = useState<boolean>(false);
  const [isCreate, setIsCreate] = useState<boolean>(false);
  const [isAddressRename, setIsAddressRename] = useState<boolean>(false);
  const [isSettingAssignLink, setIsSettingAssignLink] =
    useState<boolean>(false);
  const [isSettingViewLink, setIsSettingViewLink] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUnauthorised, setIsUnauthorised] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isNotHome, setIsNotHome] = useState<boolean>(false);
  const [isNewTerritory, setIsNewTerritory] = useState<boolean>(false);
  const [isNewUnit, setIsNewUnit] = useState<boolean>(false);
  const [isTerritoryRename, setIsTerritoryRename] = useState<boolean>(false);
  const [showTerritoryListing, setShowTerritoryListing] =
    useState<boolean>(false);
  const [trackRace, setTrackRace] = useState<boolean>(true);
  const [trackLanguages, setTrackLanguages] = useState<boolean>(true);
  const [name, setName] = useState<String>();
  const [values, setValues] = useState<Object>({});
  const [territories, setTerritories] = useState(
    new Map<String, territoryDetails>()
  );
  const [selectedTerritory, setSelectedTerritory] = useState<String>();
  const [selectedTerritoryCode, setSelectedTerritoryCode] = useState<String>();
  const [selectedTerritoryName, setSelectedTerritoryName] = useState<String>();
  const [addresses, setAddresses] = useState(new Map<String, addressDetails>());
  const domain = process.env.PUBLIC_URL;
  const rollbar = useRollbar();
  let unsubscribers = new Array<Unsubscribe>();
  const processData = (data: any) => {
    const dataList = [];
    for (const floor in data) {
      const unitsDetails = [];
      const units = data[floor];
      for (const unit in units) {
        unitsDetails.push({
          number: unit,
          note: units[unit]["note"],
          type: units[unit]["type"] || "",
          status: units[unit]["status"],
          nhcount: units[unit]["nhcount"] || NOT_HOME_STATUS_CODES.DEFAULT,
          languages: units[unit]["languages"] || ""
        });
      }
      dataList.unshift({ floor: floor, units: unitsDetails });
    }
    return dataList;
  };

  const refreshAddressState = () => {
    unsubscribers.forEach((unsubFunction) => {
      unsubFunction();
    });
    setAddresses(new Map<String, addressDetails>());
  };

  const processSelectedTerritory = (
    eventKey: String,
    territoryData?: any,
    _?: SyntheticEvent<unknown>
  ) => {
    const territoryDetails = territoryData
      ? territoryData.get(eventKey)
      : territories.get(eventKey);
    const territoryAddresses = territoryDetails?.addresses;
    setSelectedTerritory(
      `${territoryDetails?.code} - ${territoryDetails?.name}`
    );
    setSelectedTerritoryCode(territoryDetails?.code);
    setSelectedTerritoryName(territoryDetails?.name);
    refreshAddressState();
    if (!territoryAddresses) return;
    unsubscribers = [] as Array<Unsubscribe>;
    for (const territoryIndex in territoryAddresses) {
      const postalCode = territoryAddresses[territoryIndex];
      unsubscribers.push(
        onValue(child(ref(database), `/${postalCode}`), (snapshot) => {
          if (snapshot.exists()) {
            const territoryData = snapshot.val();
            const addressData = {
              name: territoryData.name,
              postalcode: `${postalCode}`,
              floors: processData(territoryData.units),
              feedback: territoryData.feedback
            };
            setAddresses(
              (existingAddresses) =>
                new Map<String, addressDetails>(
                  existingAddresses.set(postalCode, addressData)
                )
            );
          }
        })
      );
    }
  };

  const deleteBlockFloor = async (postalcode: String, floor: String) => {
    try {
      await remove(ref(database, `${postalcode}/units/${floor}`));
    } catch (error) {
      errorHandler(error, rollbar);
    }
  };

  const deleteBlock = async (postalcode: String) => {
    try {
      await remove(ref(database, `${postalcode}`));
      const addressSnapshot = await get(
        ref(
          database,
          `congregations/${code}/territories/${selectedTerritoryCode}/addresses`
        )
      );
      if (addressSnapshot.exists()) {
        const addressData = addressSnapshot.val();
        for (const addkey in addressData) {
          const units = addressData[addkey];
          if (units === postalcode) {
            await remove(
              ref(
                database,
                `congregations/${code}/territories/${selectedTerritoryCode}/addresses/${addkey}`
              )
            );
            break;
          }
        }
      }
      alert(`Deleted postal address, ${postalcode}.`);
      await refreshCongregationTerritory(`${selectedTerritoryCode}`);
    } catch (error) {
      errorHandler(error, rollbar);
    }
  };

  const addFloorToBlock = async (postalcode: String) => {
    const blockAddresses = addresses.get(postalcode);
    if (!blockAddresses) return;
    const unitUpdates: unitMaps = {};
    const blockFloorDetails = blockAddresses.floors[0];
    const newFloor = Number(blockFloorDetails.floor) + 1;
    blockFloorDetails.units.forEach((element) => {
      unitUpdates[`/${postalcode}/units/${newFloor}/${element.number}`] = {
        status: STATUS_CODES.DEFAULT,
        type: HOUSEHOLD_TYPES.CHINESE,
        note: "",
        nhcount: NOT_HOME_STATUS_CODES.DEFAULT
      };
    });
    try {
      await update(ref(database), unitUpdates);
    } catch (error) {
      errorHandler(error, rollbar);
    }
  };

  const resetBlock = async (postalcode: String) => {
    const blockAddresses = addresses.get(postalcode);
    if (!blockAddresses) return;
    const unitUpdates: unitMaps = {};
    for (const index in blockAddresses.floors) {
      const floorDetails = blockAddresses.floors[index];
      floorDetails.units.forEach((element) => {
        let currentStatus = element.status;
        if (MUTABLE_CODES.includes(`${currentStatus}`)) {
          currentStatus = STATUS_CODES.DEFAULT;
        }
        unitUpdates[
          `/${postalcode}/units/${floorDetails.floor}/${element.number}`
        ] = {
          type: element.type,
          note: element.note,
          status: currentStatus,
          nhcount: NOT_HOME_STATUS_CODES.DEFAULT
        };
      });
    }
    try {
      await update(ref(database), unitUpdates);
    } catch (error) {
      errorHandler(error, rollbar);
    }
  };

  const onLanguageChange = (languages: any[]) => {
    setValues({ ...values, languages: processHHLanguages(languages) });
  };

  const toggleModal = (modalType = ADMIN_MODAL_TYPES.UNIT) => {
    switch (modalType) {
      case ADMIN_MODAL_TYPES.FEEDBACK:
        setIsFeedback(!isFeedback);
        break;
      case ADMIN_MODAL_TYPES.LINK:
        setIsLinkRevoke(!isLinkRevoke);
        break;
      case ADMIN_MODAL_TYPES.CREATE_ADDRESS:
        setIsCreate(!isCreate);
        break;
      case ADMIN_MODAL_TYPES.RENAME_ADDRESS_NAME:
        setIsAddressRename(!isAddressRename);
        break;
      case ADMIN_MODAL_TYPES.CREATE_TERRITORY:
        setIsNewTerritory(!isNewTerritory);
        break;
      case ADMIN_MODAL_TYPES.ADD_UNIT:
        setIsNewUnit(!isNewUnit);
        break;
      case ADMIN_MODAL_TYPES.RENAME_TERRITORY:
        setIsTerritoryRename(!isTerritoryRename);
        break;
      default:
        setIsOpen(!isOpen);
    }
  };

  const handleClickModal = (
    _: MouseEvent<HTMLElement>,
    postal: String,
    floor: String,
    unit: String,
    type: String,
    note: String,
    status: String,
    nhcount: String,
    languages: String,
    maxUnitNumber: number
  ) => {
    setValues({
      ...values,
      floor: floor,
      floorDisplay: ZeroPad(floor, DEFAULT_FLOOR_PADDING),
      unit: unit,
      unitDisplay: ZeroPad(unit, maxUnitNumber),
      type: type,
      note: note,
      postal: postal,
      status: status,
      nhcount: nhcount,
      languages: languages
    });
    setIsNotHome(status === STATUS_CODES.NOT_HOME);
    toggleModal();
  };

  const handleSubmitClick = async (event: FormEvent<HTMLElement>) => {
    event.preventDefault();
    const details = values as valuesDetails;
    setIsSaving(true);
    const timeoutId = connectionTimeout();
    try {
      await set(
        ref(
          database,
          `/${details.postal}/units/${details.floor}/${details.unit}`
        ),
        {
          type: details.type,
          note: details.note,
          status: details.status,
          nhcount: details.nhcount,
          languages: details.languages
        }
      );
      toggleModal();
    } catch (error) {
      errorHandler(error, rollbar);
    } finally {
      clearTimeout(timeoutId);
      setIsSaving(false);
    }
  };

  const setTimedLink = (
    addressLinkId: String,
    hours = DEFAULT_SELF_DESTRUCT_HOURS
  ) => {
    return set(ref(database, `links/${addressLinkId}`), addHours(hours));
  };

  const handleClickFeedback = (
    _: MouseEvent<HTMLElement>,
    postalcode: String,
    feedback: String
  ) => {
    setValues({ ...values, feedback: feedback, postal: postalcode });
    toggleModal(ADMIN_MODAL_TYPES.FEEDBACK);
  };

  const handleClickAddUnit = (
    _: MouseEvent<HTMLElement>,
    postalcode: String,
    floors: number
  ) => {
    setValues({ ...values, postal: postalcode, floors: floors, unit: "" });
    toggleModal(ADMIN_MODAL_TYPES.ADD_UNIT);
  };

  const handleSubmitFeedback = async (event: FormEvent<HTMLElement>) => {
    event.preventDefault();
    const details = values as valuesDetails;
    setIsSaving(true);
    try {
      await set(ref(database, `/${details.postal}/feedback`), details.feedback);
      toggleModal(ADMIN_MODAL_TYPES.FEEDBACK);
    } catch (error) {
      errorHandler(error, rollbar);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClickChangeAddressName = (
    _: MouseEvent<HTMLElement>,
    postalcode: String,
    name: String
  ) => {
    setValues({ ...values, name: name, postal: postalcode });
    toggleModal(ADMIN_MODAL_TYPES.RENAME_ADDRESS_NAME);
  };

  const handleUpdateTerritoryName = async (event: FormEvent<HTMLElement>) => {
    event.preventDefault();
    const details = values as valuesDetails;
    const territoryName = details.name;
    setIsSaving(true);
    try {
      await set(
        ref(
          database,
          `congregations/${code}/territories/${selectedTerritoryCode}/name`
        ),
        territoryName
      );
      setSelectedTerritoryName(territoryName);
      setSelectedTerritory(`${selectedTerritoryCode} - ${territoryName}`);
      await refreshCongregationTerritory(`${selectedTerritoryCode}`);
      toggleModal(ADMIN_MODAL_TYPES.RENAME_TERRITORY);
    } catch (error) {
      errorHandler(error, rollbar);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateBlockName = async (event: FormEvent<HTMLElement>) => {
    event.preventDefault();
    const details = values as valuesDetails;
    setIsSaving(true);
    try {
      await set(ref(database, `/${details.postal}/name`), details.name);
      toggleModal(ADMIN_MODAL_TYPES.RENAME_ADDRESS_NAME);
    } catch (error) {
      errorHandler(error, rollbar);
    } finally {
      setIsSaving(false);
    }
  };

  const refreshCongregationTerritory = async (selectTerritoryCode: String) => {
    const congregationReference = child(ref(database), `congregations/${code}`);
    const updatedTerritory = await get(congregationReference);
    if (updatedTerritory.exists()) {
      processSelectedTerritory(
        selectTerritoryCode,
        processCongregationTerritories(updatedTerritory.val())
      );
    }
  };

  const processPostalUnitNumber = async (
    postalCode: String,
    unitNumber: String,
    isDelete = false
  ) => {
    const blockAddresses = addresses.get(`${postalCode}`);
    if (!blockAddresses) return;

    const unitUpdates: unitMaps = {};
    for (const index in blockAddresses.floors) {
      const floorDetails = blockAddresses.floors[index];
      floorDetails.units.forEach((_) => {
        unitUpdates[
          `/${postalCode}/units/${floorDetails.floor}/${unitNumber}`
        ] = isDelete
          ? {}
          : {
              type: HOUSEHOLD_TYPES.CHINESE,
              note: "",
              status: STATUS_CODES.DEFAULT,
              nhcount: NOT_HOME_STATUS_CODES.DEFAULT,
              languages: ""
            };
      });
    }
    setIsSaving(true);
    try {
      await update(ref(database), unitUpdates);
      await refreshCongregationTerritory(`${selectedTerritoryCode}`);
    } catch (error) {
      errorHandler(error, rollbar);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateNewUnit = async (event: FormEvent<HTMLElement>) => {
    event.preventDefault();
    const details = values as valuesDetails;
    const postalCode = details.postal;
    const unitNumber = details.unit;
    processPostalUnitNumber(`${postalCode}`, unitNumber);
    toggleModal(ADMIN_MODAL_TYPES.ADD_UNIT);
  };

  const handleCreateTerritoryAddress = async (
    event: FormEvent<HTMLElement>
  ) => {
    event.preventDefault();
    const details = values as valuesDetails;
    const newPostalCode = details.newPostal;
    const noOfFloors = details.floors || 1;
    const unitSequence = details.units;
    const newPostalName = details.name;

    // Add empty details for 0 floor
    let floorDetails = [{}];
    const units = unitSequence?.split(",");

    for (let i = 0; i < noOfFloors; i++) {
      const floorMap = {} as any;
      units?.forEach((unitNo) => {
        const removedLeadingZeroUnitNo = parseInt(unitNo).toString();
        floorMap[removedLeadingZeroUnitNo] = {
          status: STATUS_CODES.DEFAULT,
          type: HOUSEHOLD_TYPES.CHINESE,
          note: "",
          nhcount: NOT_HOME_STATUS_CODES.DEFAULT,
          languages: ""
        };
      });
      floorDetails.push(floorMap);
    }

    setIsSaving(true);
    try {
      const addressReference = ref(database, `${newPostalCode}`);
      const existingAddress = await get(addressReference);
      if (existingAddress.exists()) {
        alert(`Postal address, ${newPostalCode} already exist.`);
        return;
      }
      await set(
        push(
          ref(
            database,
            `congregations/${code}/territories/${selectedTerritoryCode}/addresses`
          )
        ),
        newPostalCode
      );
      await set(addressReference, {
        name: newPostalName,
        feedback: "",
        units: floorDetails
      });
      alert(`Created postal address, ${newPostalCode}.`);
      await refreshCongregationTerritory(`${selectedTerritoryCode}`);
      toggleModal(ADMIN_MODAL_TYPES.CREATE_ADDRESS);
    } catch (error) {
      errorHandler(error, rollbar);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateTerritory = async (event: FormEvent<HTMLElement>) => {
    event.preventDefault();
    const details = values as valuesDetails;
    const newTerritoryCode = details.code;
    const newTerritoryName = details.name;

    setIsSaving(true);
    try {
      const territoryCodeReference = child(
        ref(database),
        `congregations/${code}/territories/${newTerritoryCode}`
      );
      const existingTerritory = await get(territoryCodeReference);
      if (existingTerritory.exists()) {
        alert(`Territory code, ${newTerritoryCode} already exist.`);
        return;
      }
      await set(territoryCodeReference, {
        name: newTerritoryName
      });
      alert(`Created territory, ${newTerritoryName}.`);
      window.location.reload();
    } catch (error) {
      errorHandler(error, rollbar);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevokeLink = async (event: FormEvent<HTMLElement>) => {
    event.preventDefault();
    const details = values as valuesDetails;
    const link = details.link || "";
    try {
      const linkId = link.substring(link.lastIndexOf("/") + 1);
      await remove(ref(database, `links/${linkId}`));
      alert(`Revoked territory link token, ${linkId}.`);
    } catch (error) {
      errorHandler(error, rollbar);
      return;
    }
    toggleModal(ADMIN_MODAL_TYPES.LINK);
  };

  const onFormChange = (e: ChangeEvent<HTMLElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    setValues({ ...values, [name]: value });
  };

  const shareTimedLink = async (
    linkId: String,
    title: string,
    body: string,
    url: string,
    hours = DEFAULT_SELF_DESTRUCT_HOURS
  ) => {
    if (navigator.share) {
      setIsSettingAssignLink(true);
      const timeoutId = connectionTimeout();
      try {
        await setTimedLink(linkId, hours);
        navigator.share({
          title: title,
          text: body,
          url: url
        });
      } catch (error) {
        errorHandler(error, rollbar);
      } finally {
        clearTimeout(timeoutId);
        setIsSettingAssignLink(false);
      }
    } else {
      alert("Browser doesn't support this feature.");
    }
  };

  const processCongregationTerritories = (data: any) => {
    if (!data) return;
    document.title = `${data["name"]}`;
    const congregationTerritories = data["territories"];
    const territoryList = new Map<String, territoryDetails>();
    for (const territory in congregationTerritories) {
      const name = congregationTerritories[territory]["name"];
      const addresses = congregationTerritories[territory]["addresses"];
      territoryList.set(territory, {
        code: territory,
        name: name,
        addresses: addresses
      });
    }
    setTerritories(territoryList);
    setName(`${data["name"]}`);
    return territoryList;
  };

  const toggleTerritoryListing = () => {
    setShowTerritoryListing(!showTerritoryListing);
  };

  useEffect(() => {
    const trackRaceReference = child(
      ref(database),
      `congregations/${code}/trackRace`
    );
    const trackLanguagesReference = child(
      ref(database),
      `congregations/${code}/trackLanguages`
    );
    onValue(
      trackRaceReference,
      (snapshot) => {
        if (snapshot.exists()) {
          setTrackRace(snapshot.val());
        }
      },
      { onlyOnce: true }
    );
    onValue(
      trackLanguagesReference,
      (snapshot) => {
        if (snapshot.exists()) {
          setTrackLanguages(snapshot.val());
        }
      },
      { onlyOnce: true }
    );

    const congregationReference = child(ref(database), `congregations/${code}`);
    onValue(
      congregationReference,
      (snapshot) => {
        setIsLoading(false);
        if (snapshot.exists()) {
          processCongregationTerritories(snapshot.val());
        }
      },
      (reason) => {
        setIsUnauthorised(
          reason.message.includes(FIREBASE_AUTH_UNAUTHORISED_MSG)
        );
        setIsLoading(false);
        errorHandler(reason, rollbar, false);
      },
      { onlyOnce: true }
    );

    let currentTime = new Date().getTime();

    const setActivityTime = () => {
      currentTime = new Date().getTime();
    };

    document.body.addEventListener("mousemove", setActivityTime);
    document.body.addEventListener("keypress", setActivityTime);
    document.body.addEventListener("touchstart", setActivityTime);

    const refreshPage = () => {
      const inactivityPeriod = new Date().getTime() - currentTime;
      if (inactivityPeriod >= RELOAD_INACTIVITY_DURATION) {
        window.location.reload();
      } else {
        setTimeout(refreshPage, RELOAD_CHECK_INTERVAL_MS);
      }
    };

    setTimeout(refreshPage, RELOAD_CHECK_INTERVAL_MS);
  }, [user, code, rollbar]);

  if (isLoading) return <Loader />;
  if (isUnauthorised) return <UnauthorizedPage />;

  const territoryAddresses = Array.from(addresses.values());
  const congregationTerritoryList = Array.from(territories.values());

  return (
    <Fade appear={true} in={true}>
      <div>
        <TerritoryListing
          showListing={showTerritoryListing}
          hideFunction={toggleTerritoryListing}
          territories={congregationTerritoryList}
          selectedTerritory={selectedTerritoryCode}
          handleSelect={(eventKey, e) => {
            processSelectedTerritory(`${eventKey}`);
            toggleTerritoryListing();
          }}
        />
        <Navbar bg="light" variant="light" expand="lg">
          <Container fluid>
            <NavBarBranding naming={`${name}`} />
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse
              id="basic-navbar-nav"
              className="justify-content-end mt-1"
            >
              {congregationTerritoryList &&
                congregationTerritoryList.length > 0 && (
                  <Button
                    className="me-2"
                    size="sm"
                    variant="outline-primary"
                    onClick={toggleTerritoryListing}
                  >
                    {selectedTerritory
                      ? `${selectedTerritory}`
                      : "Select Territory"}
                  </Button>
                )}
              {!isConductor && (
                <Button
                  className="m-2"
                  size="sm"
                  variant="outline-primary"
                  onClick={() => {
                    setValues({ ...values, name: "", code: "" });
                    toggleModal(ADMIN_MODAL_TYPES.CREATE_TERRITORY);
                  }}
                >
                  Create Territory
                </Button>
              )}
              {!isConductor && selectedTerritory && (
                <Button
                  className="m-2"
                  size="sm"
                  variant="outline-primary"
                  onClick={() => {
                    setValues({ ...values, name: selectedTerritoryName });
                    toggleModal(ADMIN_MODAL_TYPES.RENAME_TERRITORY);
                  }}
                >
                  Edit Territory Name
                </Button>
              )}
              {!isConductor && selectedTerritory && (
                <Button
                  className="m-2"
                  size="sm"
                  variant="outline-primary"
                  onClick={() => {
                    setValues({
                      ...values,
                      name: "",
                      units: "",
                      floors: 1,
                      newPostal: ""
                    });
                    toggleModal(ADMIN_MODAL_TYPES.CREATE_ADDRESS);
                  }}
                >
                  Create Address
                </Button>
              )}
              {!isConductor && (
                <Button
                  className="m-2"
                  size="sm"
                  variant="outline-primary"
                  onClick={() => {
                    setValues({
                      ...values,
                      link: ""
                    });
                    toggleModal(ADMIN_MODAL_TYPES.LINK);
                  }}
                >
                  Revoke Link
                </Button>
              )}
              <Button
                className="m-2"
                size="sm"
                variant="outline-primary"
                onClick={() => {
                  signOut(auth);
                }}
              >
                Log Out
              </Button>
            </Navbar.Collapse>
          </Container>
        </Navbar>
        {!selectedTerritory && (
          <Welcome
            loginType={
              isConductor ? LOGIN_TYPE_CODES.CONDUCTOR : LOGIN_TYPE_CODES.ADMIN
            }
          />
        )}
        {territoryAddresses.map((addressElement) => {
          const maxUnitNumberLength = getMaxUnitLength(addressElement.floors);
          const completedPercent = getCompletedPercent(addressElement.floors);
          const addressLinkId = nanoid();
          return (
            <div key={`div-${addressElement.postalcode}`}>
              <Navbar
                bg="light"
                expand="sm"
                className="mt-3"
                key={`navbar-${addressElement.postalcode}`}
              >
                <Container fluid>
                  <Navbar.Brand>{addressElement.name}</Navbar.Brand>
                  <Navbar.Toggle aria-controls="navbarScroll" />
                  <Navbar.Collapse
                    id="navbarScroll"
                    className="justify-content-end mt-2"
                  >
                    {!isConductor && (
                      <DropdownButton
                        key={`assigndrop-${addressElement.postalcode}`}
                        size="sm"
                        variant="outline-primary"
                        title="Assign"
                        className="me-2 d-inline-block"
                      >
                        <Dropdown.Item
                          onClick={() => {
                            shareTimedLink(
                              addressLinkId,
                              `Units for ${addressElement.name}`,
                              assignmentMessage(addressElement.name),
                              `${domain}/${addressElement.postalcode}/${code}/${addressLinkId}`
                            );
                          }}
                        >
                          {isSettingAssignLink && (
                            <>
                              <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                aria-hidden="true"
                              />{" "}
                            </>
                          )}
                          House-To-House
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => {
                            shareTimedLink(
                              addressLinkId,
                              `Units for ${addressElement.name}`,
                              assignmentMessage(addressElement.name),
                              `${domain}/${addressElement.postalcode}/${code}/${addressLinkId}`,
                              DEFAULT_PERSONAL_SLIP_DESTRUCT_HOURS
                            );
                          }}
                        >
                          {isSettingAssignLink && (
                            <>
                              <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                aria-hidden="true"
                              />{" "}
                            </>
                          )}
                          Personal
                        </Dropdown.Item>
                      </DropdownButton>
                    )}
                    {isConductor && (
                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="me-2"
                        onClick={(_) => {
                          shareTimedLink(
                            addressLinkId,
                            `Units for ${addressElement.name}`,
                            assignmentMessage(addressElement.name),
                            `${domain}/${addressElement.postalcode}/${code}/${addressLinkId}`
                          );
                        }}
                      >
                        {isSettingAssignLink && (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              aria-hidden="true"
                            />{" "}
                          </>
                        )}
                        Assign
                      </Button>
                    )}
                    {isConductor && (
                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="me-2"
                        onClick={async () => {
                          setIsSettingViewLink(true);
                          const timeoutId = connectionTimeout();
                          try {
                            const territoryWindow = window.open("", "_blank");
                            if (territoryWindow) {
                              territoryWindow.document.body.innerHTML =
                                TERRITORY_VIEW_WINDOW_WELCOME_TEXT;
                            }
                            await setTimedLink(addressLinkId);
                            territoryWindow!.location.href = `${domain}/${addressElement.postalcode}/${code}/${addressLinkId}`;
                          } catch (error) {
                            errorHandler(error, rollbar);
                          } finally {
                            clearTimeout(timeoutId);
                            setIsSettingViewLink(false);
                          }
                        }}
                      >
                        {isSettingViewLink && (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              aria-hidden="true"
                            />{" "}
                          </>
                        )}
                        View
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline-primary"
                      className="me-2"
                      onClick={(e) => {
                        window.open(
                          `http://maps.google.com.sg/maps?q=${addressElement.postalcode}`,
                          "_blank"
                        );
                      }}
                    >
                      Direction
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-primary"
                      className="me-2"
                      onClick={(event) => {
                        handleClickFeedback(
                          event,
                          addressElement.postalcode,
                          addressElement.feedback
                        );
                      }}
                    >
                      Feedback
                      {addressElement.feedback && (
                        <>
                          {" "}
                          <Badge pill bg="secondary">
                            ⭐
                          </Badge>
                        </>
                      )}
                    </Button>
                    {!isConductor && (
                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="me-2"
                        onClick={(event) => {
                          handleClickChangeAddressName(
                            event,
                            addressElement.postalcode,
                            addressElement.name
                          );
                        }}
                      >
                        Rename
                      </Button>
                    )}
                    {!isConductor && (
                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="me-2"
                        onClick={(event) => {
                          handleClickAddUnit(
                            event,
                            addressElement.postalcode,
                            addressElement.floors.length
                          );
                        }}
                      >
                        Add Unit
                      </Button>
                    )}
                    {!isConductor && (
                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="me-2"
                        onClick={(event) => {
                          addFloorToBlock(addressElement.postalcode);
                        }}
                      >
                        Add Floor
                      </Button>
                    )}
                    {!isConductor && (
                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="me-2"
                        onClick={() =>
                          confirmAlert({
                            customUI: ({ onClose }) => {
                              return (
                                <Container>
                                  <Card bg="warning" className="text-center">
                                    <Card.Header>Warning ⚠️</Card.Header>
                                    <Card.Body>
                                      <Card.Title>
                                        Are You Very Sure ?
                                      </Card.Title>
                                      <Card.Text>
                                        This action will reset all unit status
                                        of {addressElement.name}.
                                      </Card.Text>
                                      <Button
                                        className="me-2"
                                        variant="primary"
                                        onClick={() => {
                                          resetBlock(addressElement.postalcode);
                                          onClose();
                                        }}
                                      >
                                        Yes, Reset It.
                                      </Button>
                                      <Button
                                        className="ms-2"
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
                          })
                        }
                      >
                        Reset
                      </Button>
                    )}
                    {!isConductor && (
                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="me-2"
                        onClick={() =>
                          confirmAlert({
                            customUI: ({ onClose }) => {
                              return (
                                <Container>
                                  <Card bg="warning" className="text-center">
                                    <Card.Header>Warning ⚠️</Card.Header>
                                    <Card.Body>
                                      <Card.Title>
                                        Are You Very Sure ?
                                      </Card.Title>
                                      <Card.Text>
                                        The action will completely delete,{" "}
                                        {addressElement.name}.
                                      </Card.Text>
                                      <Button
                                        className="me-2"
                                        variant="primary"
                                        onClick={() => {
                                          deleteBlock(
                                            addressElement.postalcode
                                          );
                                          onClose();
                                        }}
                                      >
                                        Yes, Delete It.
                                      </Button>
                                      <Button
                                        className="ms-2"
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
                          })
                        }
                      >
                        Delete
                      </Button>
                    )}
                  </Navbar.Collapse>
                </Container>
              </Navbar>
              <ProgressBar
                style={{ borderRadius: 0 }}
                now={completedPercent.completedValue}
                label={completedPercent.completedDisplay}
              />
              <Table
                key={`table-${addressElement.postalcode}`}
                bordered
                striped
                hover
                responsive="sm"
              >
                <thead>
                  <tr>
                    <th scope="col" className="text-center align-middle">
                      lvl/unit
                    </th>
                    {addressElement.floors &&
                      addressElement.floors[0].units.map((item, index) => (
                        <th
                          key={`${index}-${item.number}`}
                          scope="col"
                          className="text-center align-middle"
                        >
                          {!isConductor && (
                            <Button
                              size="sm"
                              variant="outline-warning"
                              className="me-1"
                              onClick={() => {
                                const hasOnlyOneUnitNumber =
                                  addressElement.floors[0].units.length === 1;
                                if (hasOnlyOneUnitNumber) {
                                  alert(
                                    `Territory requires at least 1 unit number.`
                                  );
                                  return;
                                }
                                confirmAlert({
                                  customUI: ({ onClose }) => {
                                    return (
                                      <Container>
                                        <Card
                                          bg="warning"
                                          className="text-center"
                                        >
                                          <Card.Header>Warning ⚠️</Card.Header>
                                          <Card.Body>
                                            <Card.Title>
                                              Are You Very Sure ?
                                            </Card.Title>
                                            <Card.Text>
                                              This action will delete unit
                                              number {item.number} of{" "}
                                              {addressElement.postalcode}.
                                            </Card.Text>
                                            <Button
                                              className="me-2"
                                              variant="primary"
                                              onClick={() => {
                                                processPostalUnitNumber(
                                                  addressElement.postalcode,
                                                  item.number,
                                                  true
                                                );
                                                onClose();
                                              }}
                                            >
                                              Yes, Delete It.
                                            </Button>
                                            <Button
                                              className="ms-2"
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
                              🗑️
                            </Button>
                          )}
                          {ZeroPad(item.number, maxUnitNumberLength)}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody key={`tbody-${addressElement.postalcode}`}>
                  {addressElement.floors &&
                    addressElement.floors.map((floorElement, floorIndex) => (
                      <tr key={`row-${floorIndex}`}>
                        <th
                          className="text-center"
                          key={`floor-${floorIndex}`}
                          scope="row"
                        >
                          {!isConductor && (
                            <Button
                              size="sm"
                              variant="outline-warning"
                              className="me-1"
                              onClick={() => {
                                const hasOnlyOneFloor =
                                  addressElement.floors.length === 1;
                                if (hasOnlyOneFloor) {
                                  alert(`Territory requires at least 1 floor.`);
                                  return;
                                }
                                confirmAlert({
                                  customUI: ({ onClose }) => {
                                    return (
                                      <Container>
                                        <Card
                                          bg="warning"
                                          className="text-center"
                                        >
                                          <Card.Header>Warning ⚠️</Card.Header>
                                          <Card.Body>
                                            <Card.Title>
                                              Are You Very Sure ?
                                            </Card.Title>
                                            <Card.Text>
                                              This action will delete floor{" "}
                                              {floorElement.floor} of{" "}
                                              {addressElement.postalcode}.
                                            </Card.Text>
                                            <Button
                                              className="me-2"
                                              variant="primary"
                                              onClick={() => {
                                                deleteBlockFloor(
                                                  addressElement.postalcode,
                                                  floorElement.floor
                                                );
                                                onClose();
                                              }}
                                            >
                                              Yes, Delete It.
                                            </Button>
                                            <Button
                                              className="ms-2"
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
                              🗑️
                            </Button>
                          )}
                          {`${ZeroPad(
                            floorElement.floor,
                            DEFAULT_FLOOR_PADDING
                          )}`}
                        </th>
                        {floorElement.units.map((detailsElement, index) => (
                          <td
                            align="center"
                            onClick={(event) =>
                              handleClickModal(
                                event,
                                addressElement.postalcode,
                                floorElement.floor,
                                detailsElement.number,
                                detailsElement.type,
                                detailsElement.note,
                                detailsElement.status,
                                detailsElement.nhcount,
                                detailsElement.languages,
                                maxUnitNumberLength
                              )
                            }
                            key={`${index}-${detailsElement.number}`}
                          >
                            <UnitStatus
                              key={`unit-${index}-${detailsElement.number}`}
                              type={detailsElement.type}
                              note={detailsElement.note}
                              status={detailsElement.status}
                              nhcount={detailsElement.nhcount}
                              languages={detailsElement.languages}
                              trackRace={trackRace}
                              trackLanguages={trackLanguages}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              </Table>
            </div>
          );
        })}
        {!isConductor && (
          <Modal show={isTerritoryRename}>
            <Modal.Header>
              <Modal.Title>Change Territory Name</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleUpdateTerritoryName}>
              <Modal.Body>
                <GenericTextField
                  label="Name"
                  name="name"
                  handleChange={onFormChange}
                  changeValue={`${(values as valuesDetails).name}`}
                  required={true}
                />
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() =>
                    toggleModal(ADMIN_MODAL_TYPES.RENAME_TERRITORY)
                  }
                >
                  Close
                </Button>
                <Button type="submit" variant="primary">
                  Save
                </Button>
              </Modal.Footer>
            </Form>
          </Modal>
        )}
        {!isConductor && (
          <Modal show={isLinkRevoke}>
            <Modal.Header>
              <Modal.Title>Revoke territory link</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleRevokeLink}>
              <Modal.Body>
                <AdminLinkField
                  handleChange={onFormChange}
                  changeValue={`${(values as valuesDetails).link}`}
                />
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => toggleModal(ADMIN_MODAL_TYPES.LINK)}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    navigator.clipboard.readText().then(
                      (cliptext) => {
                        setValues({ ...values, link: cliptext });
                      },
                      (err) => {
                        alert(err);
                      }
                    );
                  }}
                >
                  Paste Link
                </Button>
                <Button type="submit" variant="primary">
                  Revoke
                </Button>
              </Modal.Footer>
            </Form>
          </Modal>
        )}
        {!isConductor && (
          <Modal show={isAddressRename}>
            <Modal.Header>
              <Modal.Title>Change Block Name</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleUpdateBlockName}>
              <Modal.Body>
                <GenericTextField
                  label="Name"
                  name="name"
                  handleChange={onFormChange}
                  changeValue={`${(values as valuesDetails).name}`}
                  required={true}
                />
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() =>
                    toggleModal(ADMIN_MODAL_TYPES.RENAME_ADDRESS_NAME)
                  }
                >
                  Close
                </Button>
                <Button type="submit" variant="primary">
                  Save
                </Button>
              </Modal.Footer>
            </Form>
          </Modal>
        )}
        {!isConductor && (
          <Modal show={isNewTerritory}>
            <Modal.Header>
              <Modal.Title>Create New Territory</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleCreateTerritory}>
              <Modal.Body>
                <GenericTextField
                  label="Territory Code"
                  name="code"
                  handleChange={(e: ChangeEvent<HTMLElement>) => {
                    const { value } = e.target as HTMLInputElement;
                    setValues({ ...values, code: value });
                  }}
                  changeValue={`${(values as valuesDetails).code}`}
                  required={true}
                />
                <GenericTextField
                  label="Name"
                  name="name"
                  handleChange={onFormChange}
                  changeValue={`${(values as valuesDetails).name}`}
                  required={true}
                />
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() =>
                    toggleModal(ADMIN_MODAL_TYPES.CREATE_TERRITORY)
                  }
                >
                  Close
                </Button>
                <Button type="submit" variant="primary">
                  Save
                </Button>
              </Modal.Footer>
            </Form>
          </Modal>
        )}
        {!isConductor && (
          <Modal show={isCreate}>
            <Modal.Header>
              <Modal.Title>Create Territory Address</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleCreateTerritoryAddress}>
              <Modal.Body>
                <GenericTextField
                  label="Postal Code"
                  name="postalcode"
                  handleChange={(e: ChangeEvent<HTMLElement>) => {
                    const { value } = e.target as HTMLInputElement;
                    setValues({ ...values, newPostal: value });
                  }}
                  changeValue={`${(values as valuesDetails).newPostal}`}
                  required={true}
                />
                <GenericTextField
                  label="Address Name"
                  name="name"
                  handleChange={onFormChange}
                  changeValue={`${(values as valuesDetails).name}`}
                  required={true}
                />
                <FloorField
                  handleChange={(e: ChangeEvent<HTMLElement>) => {
                    const { value } = e.target as HTMLInputElement;
                    setValues({ ...values, floors: value });
                  }}
                  changeValue={
                    (values as valuesDetails).floors || MIN_START_FLOOR
                  }
                />
                <GenericTextAreaField
                  label="Unit Sequence"
                  name="units"
                  placeholder="Unit sequence with comma seperator. For eg, 301,303,305 ..."
                  handleChange={onFormChange}
                  changeValue={`${(values as valuesDetails).units}`}
                  required={true}
                />
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => toggleModal(ADMIN_MODAL_TYPES.CREATE_ADDRESS)}
                >
                  Close
                </Button>
                <Button type="submit" variant="primary">
                  Save
                </Button>
              </Modal.Footer>
            </Form>
          </Modal>
        )}
        {!isConductor && (
          <Modal show={isNewUnit}>
            <Modal.Header>
              <Modal.Title>
                Add Unit To {`${(values as valuesDetails).postal}`}
              </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleCreateNewUnit}>
              <Modal.Body>
                <GenericTextField
                  label="Unit Number"
                  name="unit"
                  handleChange={(e: ChangeEvent<HTMLElement>) => {
                    const { value } = e.target as HTMLInputElement;
                    setValues({ ...values, unit: value });
                  }}
                  changeValue={`${(values as valuesDetails).unit}`}
                  required={true}
                />
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => toggleModal(ADMIN_MODAL_TYPES.ADD_UNIT)}
                >
                  Close
                </Button>
                <Button type="submit" variant="primary">
                  Save
                </Button>
              </Modal.Footer>
            </Form>
          </Modal>
        )}
        <Modal show={isFeedback}>
          <Modal.Header>
            <Modal.Title>{`Feedback on ${
              (values as valuesDetails).postal
            }`}</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmitFeedback}>
            <Modal.Body>
              <GenericTextAreaField
                name="feedback"
                rows={5}
                handleChange={onFormChange}
                changeValue={`${(values as valuesDetails).feedback}`}
              />
            </Modal.Body>
            <ModalFooter
              handleClick={() => toggleModal(ADMIN_MODAL_TYPES.FEEDBACK)}
              isSaving={isSaving}
            />
          </Form>
        </Modal>
        <Modal show={isOpen}>
          <ModalUnitTitle
            unit={`${(values as valuesDetails).unitDisplay}`}
            floor={`${(values as valuesDetails).floorDisplay}`}
            postal={(values as valuesDetails).postal}
          />
          <Form onSubmit={handleSubmitClick}>
            <Modal.Body>
              <HHStatusField
                handleChange={(toggleValue) => {
                  setIsNotHome(false);
                  if (toggleValue.toString() === STATUS_CODES.NOT_HOME) {
                    setIsNotHome(true);
                  }
                  setValues({
                    ...values,
                    nhcount: NOT_HOME_STATUS_CODES.DEFAULT,
                    status: toggleValue
                  });
                }}
                changeValue={`${(values as valuesDetails).status}`}
              />
              <Collapse in={isNotHome}>
                <div className="text-center">
                  <HHNotHomeField
                    changeValue={`${(values as valuesDetails).nhcount}`}
                    handleChange={(toggleValue) => {
                      setValues({ ...values, nhcount: toggleValue });
                    }}
                  />
                </div>
              </Collapse>
              {trackRace && (
                <HHTypeField
                  handleChange={onFormChange}
                  changeValue={`${(values as valuesDetails).type}`}
                />
              )}
              {trackLanguages && (
                <HHLangField
                  handleChangeValues={onLanguageChange}
                  changeValues={parseHHLanguages(
                    `${(values as valuesDetails).languages}`
                  )}
                />
              )}
              <GenericTextAreaField
                label="Notes"
                name="note"
                placeholder="Optional non-personal information. Eg, Renovation, Foreclosed, Friends, etc."
                handleChange={onFormChange}
                changeValue={`${(values as valuesDetails).note}`}
              />
            </Modal.Body>
            <ModalFooter
              handleClick={() => toggleModal(ADMIN_MODAL_TYPES.UNIT)}
              isSaving={isSaving}
            />
          </Form>
        </Modal>
      </div>
    </Fade>
  );
}

export default Admin;
