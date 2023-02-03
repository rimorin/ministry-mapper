import {
  child,
  onValue,
  ref,
  set,
  update,
  remove,
  Unsubscribe,
  push,
  get,
  query,
  orderByValue,
  off
} from "firebase/database";
import "../css/admin.css";
import "../css/common.css";
import { signOut, User } from "firebase/auth";
import { nanoid } from "nanoid";
import { MouseEvent, ChangeEvent, FormEvent, useEffect, useState } from "react";
import {
  Accordion,
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
  Policy,
  valuesDetails,
  territoryDetails,
  addressDetails,
  adminProps,
  unitMaps
} from "./interface";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import {
  getLanguageDisplayByCode,
  STATUS_CODES,
  MUTABLE_CODES,
  ZeroPad,
  ModalUnitTitle,
  assignmentMessage,
  NavBarBranding,
  getMaxUnitLength,
  DEFAULT_FLOOR_PADDING,
  addHours,
  DEFAULT_SELF_DESTRUCT_HOURS,
  getCompletedPercent,
  FOUR_WKS_PERSONAL_SLIP_DESTRUCT_HOURS,
  ADMIN_MODAL_TYPES,
  RELOAD_INACTIVITY_DURATION,
  RELOAD_CHECK_INTERVAL_MS,
  errorHandler,
  TERRITORY_VIEW_WINDOW_WELCOME_TEXT,
  HOUSEHOLD_TYPES,
  MIN_START_FLOOR,
  NOT_HOME_STATUS_CODES,
  parseHHLanguages,
  processHHLanguages,
  TerritoryListing,
  pollingFunction,
  checkTraceLangStatus,
  checkTraceRaceStatus,
  processLinkCounts,
  triggerPostalCodeListeners,
  processAddressData,
  ComponentAuthorizer,
  USER_ACCESS_LEVELS,
  LINK_TYPES,
  ONE_WK_PERSONAL_SLIP_DESTRUCT_HOURS,
  EnvironmentIndicator,
  UA_DEVICE_MAKES,
  UNSUPPORTED_BROWSER_MSG,
  AggregationBadge
} from "./util";
import { useParams } from "react-router-dom";
import {
  AdminLinkField,
  DncDateField,
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
import { RacePolicy, LanguagePolicy, LinkSession } from "./policies";
import { zeroPad } from "react-countdown";
import { ReactComponent as GearImage } from "../assets/gear.svg";
import getUA from "ua-parser-js";
function Admin({ user }: adminProps) {
  const { code } = useParams();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isFeedback, setIsFeedback] = useState<boolean>(false);
  const [isLinkRevoke, setIsLinkRevoke] = useState<boolean>(false);
  const [isCreate, setIsCreate] = useState<boolean>(false);
  const [isAddressRename, setIsAddressRename] = useState<boolean>(false);
  const [isSettingPersonalLink, setIsSettingPersonalLink] =
    useState<boolean>(false);
  const [isSettingAssignLink, setIsSettingAssignLink] =
    useState<boolean>(false);
  const [selectedPostal, setSelectedPostal] = useState<String>();
  const [isSettingViewLink, setIsSettingViewLink] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUnauthorised, setIsUnauthorised] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isNotHome, setIsNotHome] = useState<boolean>(false);
  const [isNewTerritory, setIsNewTerritory] = useState<boolean>(false);
  const [isNewUnit, setIsNewUnit] = useState<boolean>(false);
  const [isTerritoryRename, setIsTerritoryRename] = useState<boolean>(false);
  const [isDnc, setIsDnc] = useState<boolean>(false);
  const [isUnitDetails, setIsUnitDetails] = useState<boolean>(false);
  const [isProfile, setIsProfile] = useState<boolean>(false);
  const [isSpecialDevice, setIsSpecialDevice] = useState<boolean>(false);
  const [showTerritoryListing, setShowTerritoryListing] =
    useState<boolean>(false);
  const [trackRace, setTrackRace] = useState<boolean>(true);
  const [trackLanguages, setTrackLanguages] = useState<boolean>(true);
  const [name, setName] = useState<String>();
  const [values, setValues] = useState<Object>({});
  const [territories, setTerritories] = useState(
    new Map<String, territoryDetails>()
  );
  const [sortedAddressList, setSortedAddressList] = useState<
    Array<territoryDetails>
  >([]);
  const [selectedTerritory, setSelectedTerritory] = useState<String>();
  const [selectedTerritoryCode, setSelectedTerritoryCode] = useState<String>();
  const [selectedTerritoryName, setSelectedTerritoryName] = useState<String>();
  const [addressData, setAddressData] = useState(
    new Map<String, addressDetails>()
  );
  const [accordingKeys, setAccordionKeys] = useState<Array<string>>([]);
  const [policy, setPolicy] = useState<Policy>();
  const [userAccessLevel, setUserAccessLevel] = useState<number>();
  const domain = process.env.PUBLIC_URL;
  const rollbar = useRollbar();
  let unsubscribers = new Array<Unsubscribe>();

  const refreshAddressState = () => {
    unsubscribers.forEach((unsubFunction) => {
      unsubFunction();
    });
    setAddressData(new Map<String, addressDetails>());
  };

  const clearAdminState = () => {
    refreshAddressState();
    const congregationReference = child(ref(database), `congregations/${code}`);
    off(congregationReference);
  };

  const processSelectedTerritory = async (selectedTerritoryCode: String) => {
    const territoryAddsResult = await pollingFunction(() =>
      get(
        query(
          ref(
            database,
            `congregations/${code}/territories/${selectedTerritoryCode}/addresses`
          ),
          orderByValue()
        )
      )
    );

    const territoryNameResult = await pollingFunction(() =>
      get(
        child(
          ref(database),
          `congregations/${code}/territories/${selectedTerritoryCode}/name`
        )
      )
    );

    if (!territoryNameResult.exists()) return;
    if (!territoryAddsResult.exists()) return;
    const territoryName = territoryNameResult.val();
    setSelectedTerritory(`${selectedTerritoryCode} - ${territoryName}`);
    setSelectedTerritoryCode(selectedTerritoryCode);
    setSelectedTerritoryName(territoryName);
    // detach unsub listeners first then clear
    refreshAddressState();
    unsubscribers = [] as Array<Unsubscribe>;
    let detailsListing = [] as Array<territoryDetails>;
    territoryAddsResult.forEach((addElement: any) => {
      detailsListing.push({
        code: addElement.val(),
        name: "",
        addresses: ""
      });
      return false;
    });
    setSortedAddressList(detailsListing);
    for (const details of detailsListing) {
      const postalCode = details.code;
      setAccordionKeys((existingKeys) => [...existingKeys, `${postalCode}`]);
      unsubscribers.push(
        onValue(child(ref(database), `/${postalCode}`), async (snapshot) => {
          if (snapshot.exists()) {
            const postalSnapshot = snapshot.val();
            const floorData = await processAddressData(
              postalCode,
              postalSnapshot.units
            );
            const counts = await processLinkCounts(postalCode);
            const addressData = {
              assigneeCount: counts.assigneeCount,
              personalCount: counts.personalCount,
              x_zip: postalSnapshot.x_zip,
              name: postalSnapshot.name,
              postalcode: postalCode,
              floors: floorData,
              feedback: postalSnapshot.feedback
            };
            setAddressData(
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
      await pollingFunction(() =>
        remove(ref(database, `${postalcode}/units/${floor}`))
      );
    } catch (error) {
      errorHandler(error, rollbar);
    }
  };

  const getTerritoryAddress = async (territoryCode: String) => {
    return await pollingFunction(() =>
      get(
        ref(
          database,
          `congregations/${code}/territories/${territoryCode}/addresses`
        )
      )
    );
  };

  const deleteTerritory = async () => {
    if (!selectedTerritoryCode) return;
    try {
      const addressesSnapshot = await getTerritoryAddress(
        selectedTerritoryCode
      );
      if (addressesSnapshot.exists()) {
        const addressData = addressesSnapshot.val();
        for (const addkey in addressData) {
          const postalcode = addressData[addkey];
          await pollingFunction(() => remove(ref(database, `${postalcode}`)));
        }
      }
      await pollingFunction(() =>
        remove(
          ref(
            database,
            `congregations/${code}/territories/${selectedTerritoryCode}`
          )
        )
      );
      alert(`Deleted territory, ${selectedTerritoryCode}.`);
      window.location.reload();
    } catch (error) {
      errorHandler(error, rollbar);
    }
  };

  const deleteBlock = async (postalCode: String) => {
    if (!selectedTerritoryCode) return;
    try {
      await remove(ref(database, `${postalCode}`));
      const addressesSnapshot = await getTerritoryAddress(
        selectedTerritoryCode
      );
      if (addressesSnapshot.exists()) {
        const addressData = addressesSnapshot.val();
        for (const addkey in addressData) {
          const currentPostalcode = addressData[addkey];
          if (currentPostalcode === postalCode) {
            await pollingFunction(() =>
              remove(
                ref(
                  database,
                  `congregations/${code}/territories/${selectedTerritoryCode}/addresses/${addkey}`
                )
              )
            );
            break;
          }
        }
      }
      alert(`Deleted postal address, ${postalCode}.`);
      await refreshCongregationTerritory(`${selectedTerritoryCode}`);
    } catch (error) {
      errorHandler(error, rollbar);
    }
  };

  const addFloorToBlock = async (postalcode: String, lowerFloor = false) => {
    const blockAddresses = addressData.get(postalcode);
    if (!blockAddresses) return;
    const unitUpdates: unitMaps = {};
    let floorIndex = 0;
    if (lowerFloor) {
      floorIndex = blockAddresses.floors.length - 1;
    }
    const blockFloorDetails = blockAddresses.floors[floorIndex];
    const currentFloor = Number(blockFloorDetails.floor);
    let newFloor = currentFloor + 1;
    if (lowerFloor) {
      if (currentFloor === 1) {
        alert("Unable to add further lower floor.");
        return;
      }
      newFloor = currentFloor - 1;
    }
    blockFloorDetails.units.forEach((element) => {
      unitUpdates[`/${postalcode}/units/${newFloor}/${element.number}`] = {
        status: STATUS_CODES.DEFAULT,
        type: HOUSEHOLD_TYPES.CHINESE,
        note: "",
        nhcount: NOT_HOME_STATUS_CODES.DEFAULT,
        sequence: element.sequence ? element.sequence : 0,
        languages: ""
      };
    });
    try {
      await pollingFunction(() => update(ref(database), unitUpdates));
    } catch (error) {
      errorHandler(error, rollbar);
    }
  };

  const resetTerritory = async () => {
    if (!selectedTerritoryCode) return;
    try {
      const addressesSnapshot = await getTerritoryAddress(
        selectedTerritoryCode
      );
      if (addressesSnapshot.exists()) {
        const addressData = addressesSnapshot.val();
        for (const addkey in addressData) {
          const postalcode = addressData[addkey];
          await resetBlock(postalcode);
        }
      }
      alert(`Reset status of territory, ${selectedTerritoryCode}.`);
    } catch (error) {
      errorHandler(error, rollbar);
    }
  };

  const resetBlock = async (postalcode: String) => {
    const blockAddresses = addressData.get(postalcode);
    if (!blockAddresses) return;
    const unitUpdates: unitMaps = {};
    for (const index in blockAddresses.floors) {
      const floorDetails = blockAddresses.floors[index];
      floorDetails.units.forEach((element) => {
        const unitPath = `/${postalcode}/units/${floorDetails.floor}/${element.number}`;
        let currentStatus = element.status;
        if (MUTABLE_CODES.includes(`${currentStatus}`)) {
          currentStatus = STATUS_CODES.DEFAULT;
        }
        unitUpdates[`${unitPath}/type`] = element.type;
        unitUpdates[`${unitPath}/note`] = element.note;
        unitUpdates[`${unitPath}/status`] = currentStatus;
        unitUpdates[`${unitPath}/nhcount`] = NOT_HOME_STATUS_CODES.DEFAULT;
        unitUpdates[`${unitPath}/languages`] = element.languages;
        unitUpdates[`${unitPath}/dnctime`] = element.dnctime;
      });
    }
    try {
      await pollingFunction(() => update(ref(database), unitUpdates));
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
      case ADMIN_MODAL_TYPES.UPDATE_UNIT:
        setIsUnitDetails(!isUnitDetails);
        break;
      case ADMIN_MODAL_TYPES.PROFILE:
        setIsProfile(!isProfile);
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
    dnctime: number,
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
      languages: languages,
      dnctime: dnctime
    });
    setIsNotHome(status === STATUS_CODES.NOT_HOME);
    setIsDnc(status === STATUS_CODES.DO_NOT_CALL);
    toggleModal();
  };

  const handleSubmitClick = async (event: FormEvent<HTMLElement>) => {
    event.preventDefault();
    const details = values as valuesDetails;
    setIsSaving(true);
    try {
      await pollingFunction(() =>
        update(
          ref(
            database,
            `/${details.postal}/units/${details.floor}/${details.unit}`
          ),
          {
            type: details.type,
            note: details.note,
            status: details.status,
            nhcount: details.nhcount,
            languages: details.languages,
            dnctime: details.dnctime
          }
        )
      );
      toggleModal();
    } catch (error) {
      errorHandler(error, rollbar);
    } finally {
      setIsSaving(false);
    }
  };

  const setTimedLink = (
    linktype: number,
    postalcode: String,
    addressLinkId: String,
    hours = DEFAULT_SELF_DESTRUCT_HOURS
  ) => {
    const link = new LinkSession();
    link.tokenEndtime = addHours(hours);
    link.postalCode = postalcode as string;
    link.linkType = linktype;
    let currentPolicy = policy;
    if (currentPolicy === undefined) {
      currentPolicy = new LanguagePolicy();
    }
    link.homeLanguage = currentPolicy.getHomeLanguage();
    link.maxTries = currentPolicy.getMaxTries();
    return pollingFunction(async () => {
      await set(ref(database, `links/${addressLinkId}`), link);
      await triggerPostalCodeListeners(link.postalCode);
    });
  };

  const handleClickFeedback = (
    _: MouseEvent<HTMLElement>,
    postalcode: String,
    feedback: String
  ) => {
    setValues({ ...values, feedback: feedback, postal: postalcode });
    toggleModal(ADMIN_MODAL_TYPES.FEEDBACK);
  };

  const handleClickAddUnit = (postalcode: String, floors: number) => {
    setValues({ ...values, postal: postalcode, floors: floors, unit: "" });
    toggleModal(ADMIN_MODAL_TYPES.ADD_UNIT);
  };

  const handleClickUpdateUnit = (
    postalcode: String,
    unitlength: number,
    unitseq: number | undefined,
    unit: String,
    maxUnitNumber: number
  ) => {
    setValues({
      ...values,
      postal: postalcode,
      unit: unit,
      unitDisplay: zeroPad(`${unit}`, maxUnitNumber),
      unitlength: unitlength,
      sequence: unitseq === undefined ? "" : unitseq
    });
    toggleModal(ADMIN_MODAL_TYPES.UPDATE_UNIT);
  };

  const handleSubmitFeedback = async (event: FormEvent<HTMLElement>) => {
    event.preventDefault();
    const details = values as valuesDetails;
    setIsSaving(true);
    try {
      await pollingFunction(() =>
        set(ref(database, `/${details.postal}/feedback`), details.feedback)
      );
      toggleModal(ADMIN_MODAL_TYPES.FEEDBACK);
    } catch (error) {
      errorHandler(error, rollbar);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClickChangeAddressName = (postalcode: String, name: String) => {
    setValues({ ...values, name: name, postal: postalcode });
    toggleModal(ADMIN_MODAL_TYPES.RENAME_ADDRESS_NAME);
  };

  const handleUpdateTerritoryName = async (event: FormEvent<HTMLElement>) => {
    event.preventDefault();
    const details = values as valuesDetails;
    const territoryName = details.name;
    setIsSaving(true);
    try {
      await pollingFunction(() =>
        set(
          ref(
            database,
            `congregations/${code}/territories/${selectedTerritoryCode}/name`
          ),
          territoryName
        )
      );
      setSelectedTerritoryName(territoryName);
      setSelectedTerritory(`${selectedTerritoryCode} - ${territoryName}`);
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
      await pollingFunction(() =>
        set(ref(database, `/${details.postal}/name`), details.name)
      );
      toggleModal(ADMIN_MODAL_TYPES.RENAME_ADDRESS_NAME);
    } catch (error) {
      errorHandler(error, rollbar);
    } finally {
      setIsSaving(false);
    }
  };

  const refreshCongregationTerritory = async (selectTerritoryCode: String) => {
    if (!selectTerritoryCode) return;
    processSelectedTerritory(selectTerritoryCode);
  };

  const processPostalUnitNumber = async (
    postalCode: String,
    unitNumber: String,
    isDelete = false
  ) => {
    const blockAddresses = addressData.get(`${postalCode}`);
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
              x_floor: floorDetails.floor,
              languages: ""
            };
      });
    }
    setIsSaving(true);
    try {
      await pollingFunction(() => update(ref(database), unitUpdates));
      await refreshCongregationTerritory(`${selectedTerritoryCode}`);
    } catch (error) {
      errorHandler(error, rollbar);
    } finally {
      setIsSaving(false);
    }
  };

  const processPostalUnitSequence = async (
    postalCode: String,
    unitNumber: String,
    sequence: number | undefined
  ) => {
    const blockAddresses = addressData.get(`${postalCode}`);
    if (!blockAddresses) return;

    const unitUpdates: unitMaps = {};
    for (const index in blockAddresses.floors) {
      const floorDetails = blockAddresses.floors[index];
      floorDetails.units.forEach((_) => {
        unitUpdates[
          `/${postalCode}/units/${floorDetails.floor}/${unitNumber}/sequence`
        ] = sequence === undefined ? {} : sequence;
      });
    }
    setIsSaving(true);
    try {
      await pollingFunction(() => update(ref(database), unitUpdates));
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

  const handleUpdateUnit = async (event: FormEvent<HTMLElement>) => {
    event.preventDefault();
    const details = values as valuesDetails;
    const postalCode = details.postal;
    const unitNumber = details.unit;
    const unitSeq = isNaN(parseInt(details.sequence))
      ? undefined
      : parseInt(details.sequence);
    processPostalUnitSequence(`${postalCode}`, unitNumber, unitSeq);
    toggleModal(ADMIN_MODAL_TYPES.UPDATE_UNIT);
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
      await pollingFunction(() =>
        set(
          push(
            ref(
              database,
              `congregations/${code}/territories/${selectedTerritoryCode}/addresses`
            )
          ),
          newPostalCode
        )
      );
      await pollingFunction(() =>
        set(addressReference, {
          name: newPostalName,
          feedback: "",
          units: floorDetails
        })
      );
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
      const existingTerritory = await pollingFunction(() =>
        get(territoryCodeReference)
      );
      if (existingTerritory.exists()) {
        alert(`Territory code, ${newTerritoryCode} already exist.`);
        return;
      }
      await pollingFunction(() =>
        set(territoryCodeReference, {
          name: newTerritoryName
        })
      );
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
      await pollingFunction(() => remove(ref(database, `links/${linkId}`)));
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
    linktype: number,
    postalcode: String,
    linkId: String,
    title: string,
    body: string,
    url: string,
    hours = DEFAULT_SELF_DESTRUCT_HOURS
  ) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: body,
          url: url
        });
        setSelectedPostal(postalcode);
        if (linktype === LINK_TYPES.ASSIGNMENT) setIsSettingAssignLink(true);
        if (linktype === LINK_TYPES.PERSONAL) setIsSettingPersonalLink(true);
        await setTimedLink(linktype, postalcode, linkId, hours);
        setAccordionKeys((existingKeys) =>
          existingKeys.filter((key) => key !== postalcode)
        );
      } catch (error) {
        errorHandler(error, rollbar, false);
      } finally {
        setIsSettingAssignLink(false);
        setIsSettingPersonalLink(false);
        setSelectedPostal("");
      }
    } else {
      alert(UNSUPPORTED_BROWSER_MSG);
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

  const getUserAccessLevel = async (
    user: User,
    congregationCode: string | undefined
  ) => {
    if (!congregationCode) return;
    const tokenData = await user.getIdTokenResult(true);
    return tokenData.claims[congregationCode];
  };

  /* Special logic to handle cases where device navigator.share 
  does not return a callback after a successful share. */
  const specialShareTimedLink = (
    linktype: number,
    postalcode: String,
    name: String,
    linkId: String,
    hours = DEFAULT_SELF_DESTRUCT_HOURS
  ) => {
    if (navigator.share) {
      confirmAlert({
        customUI: ({ onClose }) => {
          return (
            <Container>
              <Card bg="Light" className="text-center">
                <Card.Header>
                  Confirmation on{" "}
                  {linktype === LINK_TYPES.PERSONAL ? "personal " : " "}
                  assignment for {name} ✅
                </Card.Header>
                <Card.Body>
                  <Card.Title>Do you want to proceed ?</Card.Title>
                  <Button
                    className="m-1"
                    variant="primary"
                    onClick={async () => {
                      onClose();
                      setSelectedPostal(postalcode);
                      if (linktype === LINK_TYPES.ASSIGNMENT)
                        setIsSettingAssignLink(true);
                      if (linktype === LINK_TYPES.PERSONAL)
                        setIsSettingPersonalLink(true);
                      await setTimedLink(linktype, postalcode, linkId, hours);

                      try {
                        navigator.share({
                          title: `Units for ${name}`,
                          text: assignmentMessage(name),
                          url: `${domain}/${postalcode}/${code}/${linkId}`
                        });
                      } finally {
                        setIsSettingAssignLink(false);
                        setIsSettingPersonalLink(false);
                        setSelectedPostal("");
                        setAccordionKeys((existingKeys) =>
                          existingKeys.filter((key) => key !== postalcode)
                        );
                      }
                    }}
                  >
                    Yes
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
    } else {
      alert(UNSUPPORTED_BROWSER_MSG);
    }
  };

  const getTerritoryAddressData = (
    addresses: Map<String, addressDetails>,
    policy: Policy
  ) => {
    let unitLengths = new Map();
    let completedPercents = new Map();
    let totalPercent = 0;

    addresses.forEach((address, _) => {
      const postalCode = address.postalcode;
      const maxUnitNumberLength = getMaxUnitLength(address.floors);
      const completedPercent = getCompletedPercent(policy, address.floors);
      unitLengths.set(postalCode, maxUnitNumberLength);
      completedPercents.set(postalCode, completedPercent);
      totalPercent += completedPercent.completedValue;
    });

    let territoryCoverageAggr = Math.floor(
      (totalPercent / (100 * addresses.size)) * 100
    );

    if (isNaN(territoryCoverageAggr)) {
      territoryCoverageAggr = 0;
    }

    return {
      aggregate: territoryCoverageAggr,
      lengths: unitLengths,
      percents: completedPercents,
      data: addresses
    };
  };

  useEffect(() => {
    getUserAccessLevel(user, code).then((userAccessLevel) => {
      if (!userAccessLevel) {
        setIsUnauthorised(true);
        errorHandler(
          `Unauthorised access to ${code} by ${user.email}`,
          rollbar,
          false
        );
      }
      setUserAccessLevel(Number(userAccessLevel));
    });

    checkTraceLangStatus(`${code}`).then(async (snapshot) => {
      const isTrackLanguages = snapshot.val();
      setTrackLanguages(isTrackLanguages);
      if (isTrackLanguages) {
        const tokenData = await user.getIdTokenResult(true);
        const languagePolicy = new LanguagePolicy();
        languagePolicy.fromClaims(tokenData.claims);
        setPolicy(languagePolicy);
      }
    });
    checkTraceRaceStatus(`${code}`).then(async (snapshot) => {
      const isTrackRace = snapshot.val();
      setTrackRace(isTrackRace);
      if (isTrackRace) {
        const tokenData = await user.getIdTokenResult(true);
        const racePolicy = new RacePolicy();
        racePolicy.fromClaims(tokenData.claims);
        setPolicy(racePolicy);
      }
    });
    // Huawei is considered special due to its unusual behaviour in their OS native share functionality.
    setIsSpecialDevice(getUA().device.vendor === UA_DEVICE_MAKES.HUAWEI);

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
        setIsLoading(false);
        errorHandler(reason, rollbar, false);
      }
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
  const isDataCompletelyFetched = addressData.size === sortedAddressList.length;
  const territoryAddressData = getTerritoryAddressData(
    addressData,
    policy as Policy
  );
  const congregationTerritoryList = Array.from(territories.values());
  const isAdmin = userAccessLevel === USER_ACCESS_LEVELS.TERRITORY_SERVANT;
  const isReadonly = userAccessLevel === USER_ACCESS_LEVELS.READ_ONLY;
  return (
    <Fade appear={true} in={true}>
      <div>
        <EnvironmentIndicator />
        <TerritoryListing
          showListing={showTerritoryListing}
          hideFunction={toggleTerritoryListing}
          territories={congregationTerritoryList}
          selectedTerritory={selectedTerritoryCode}
          handleSelect={(eventKey, _) => {
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
                    className="m-1"
                    size="sm"
                    variant="outline-primary"
                    onClick={toggleTerritoryListing}
                  >
                    {selectedTerritory ? (
                      <>
                        <AggregationBadge
                          isDataFetched={isDataCompletelyFetched}
                          aggregate={territoryAddressData.aggregate}
                        />
                        {selectedTerritory}
                      </>
                    ) : (
                      "Select Territory"
                    )}
                  </Button>
                )}
              {!selectedTerritory && (
                <ComponentAuthorizer
                  requiredPermission={USER_ACCESS_LEVELS.TERRITORY_SERVANT}
                  userPermission={userAccessLevel}
                >
                  <Button
                    className="m-1"
                    size="sm"
                    variant="outline-primary"
                    onClick={() => {
                      setValues({ ...values, name: "", code: "" });
                      toggleModal(ADMIN_MODAL_TYPES.CREATE_TERRITORY);
                    }}
                  >
                    Create Territory
                  </Button>
                </ComponentAuthorizer>
              )}
              {selectedTerritory && (
                <ComponentAuthorizer
                  requiredPermission={USER_ACCESS_LEVELS.TERRITORY_SERVANT}
                  userPermission={userAccessLevel}
                >
                  <Dropdown className="m-1">
                    <Dropdown.Toggle variant="outline-primary" size="sm">
                      Territory
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item
                        onClick={() => {
                          setValues({ ...values, name: "", code: "" });
                          toggleModal(ADMIN_MODAL_TYPES.CREATE_TERRITORY);
                        }}
                      >
                        Create New
                      </Dropdown.Item>
                      <Dropdown.Item
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
                                        This action will delete the territory,{" "}
                                        {selectedTerritoryCode} -{" "}
                                        {selectedTerritoryName} and all its
                                        addresses.
                                      </Card.Text>
                                      <Button
                                        className="m-1"
                                        variant="primary"
                                        onClick={() => {
                                          deleteTerritory();
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
                        Delete Current
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() => {
                          setValues({
                            ...values,
                            name: selectedTerritoryName
                          });
                          toggleModal(ADMIN_MODAL_TYPES.RENAME_TERRITORY);
                        }}
                      >
                        Edit Current Name
                      </Dropdown.Item>
                      <Dropdown.Item
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
                                        This action will reset the status of all
                                        addresses in the territory,{" "}
                                        {selectedTerritoryCode} -{" "}
                                        {selectedTerritoryName}.
                                      </Card.Text>
                                      <Button
                                        className="m-1"
                                        variant="primary"
                                        onClick={() => {
                                          resetTerritory();
                                          onClose();
                                        }}
                                      >
                                        Yes, Reset them.
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
                        Reset status
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </ComponentAuthorizer>
              )}
              {selectedTerritory && (
                <ComponentAuthorizer
                  requiredPermission={USER_ACCESS_LEVELS.TERRITORY_SERVANT}
                  userPermission={userAccessLevel}
                >
                  <Button
                    className="m-1"
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
                    New Address
                  </Button>
                </ComponentAuthorizer>
              )}
              <ComponentAuthorizer
                requiredPermission={USER_ACCESS_LEVELS.TERRITORY_SERVANT}
                userPermission={userAccessLevel}
              >
                <Button
                  className="m-1"
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
              </ComponentAuthorizer>
              <Button
                className="m-1"
                size="sm"
                variant="outline-primary"
                onClick={async () => {
                  clearAdminState();
                  await signOut(auth);
                }}
              >
                Log Out
              </Button>
              <Button
                className="m-1"
                size="sm"
                variant="outline-primary"
                onClick={async () => {
                  toggleModal(ADMIN_MODAL_TYPES.PROFILE);
                }}
              >
                <GearImage stroke="var(--bs-blue)" />
              </Button>
            </Navbar.Collapse>
          </Container>
        </Navbar>
        {!selectedTerritory && <Welcome />}
        {/* There is no need to open all accordion for read-only users. */}
        <Accordion
          activeKey={isReadonly ? undefined : accordingKeys}
          onSelect={(eventKeys) => {
            if (Array.isArray(eventKeys)) {
              setAccordionKeys(
                eventKeys.map((key) => {
                  return key.toString();
                })
              );
            }
          }}
          alwaysOpen={!isReadonly}
          flush
        >
          {sortedAddressList.map((currentAdd) => {
            const currentPostalcode = currentAdd.code;
            const addressElement = territoryAddressData.data.get(
              currentAdd.code
            );

            if (!addressElement)
              return <div key={`empty-div-${currentPostalcode}`}></div>;
            const currentPostalname = addressElement.name;
            const maxUnitNumberLength =
              territoryAddressData.lengths.get(currentPostalcode);
            const completedPercent =
              territoryAddressData.percents.get(currentPostalcode);
            const addressLinkId = nanoid();
            const zipcode =
              addressElement.x_zip == null
                ? currentPostalcode
                : addressElement.x_zip;
            return (
              <Accordion.Item
                key={`accordion-${currentPostalcode}`}
                eventKey={`${currentPostalcode}`}
              >
                <Accordion.Header>
                  <span className="fluid-branding">{currentPostalname}</span>
                </Accordion.Header>
                <Accordion.Body className="p-0">
                  <ProgressBar
                    style={{ borderRadius: 0 }}
                    now={completedPercent.completedValue}
                    label={completedPercent.completedDisplay}
                  />
                  <div key={`div-${currentPostalcode}`}>
                    <Navbar
                      bg="light"
                      expand="lg"
                      key={`navbar-${currentPostalcode}`}
                    >
                      <Container fluid className="justify-content-end">
                        <ComponentAuthorizer
                          requiredPermission={
                            USER_ACCESS_LEVELS.TERRITORY_SERVANT
                          }
                          userPermission={userAccessLevel}
                        >
                          <DropdownButton
                            key={`assigndrop-${currentPostalcode}`}
                            size="sm"
                            variant="outline-primary"
                            title={
                              <>
                                {isSettingPersonalLink &&
                                  selectedPostal === currentPostalcode && (
                                    <>
                                      <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        aria-hidden="true"
                                      />{" "}
                                    </>
                                  )}
                                {addressElement.personalCount > 0 && (
                                  <>
                                    <Badge bg="danger">
                                      {`${addressElement.personalCount}`}
                                    </Badge>{" "}
                                  </>
                                )}
                                Personal
                              </>
                            }
                            className="m-1 d-inline-block"
                          >
                            <Dropdown.Item
                              onClick={() => {
                                if (isSpecialDevice) {
                                  specialShareTimedLink(
                                    LINK_TYPES.PERSONAL,
                                    currentPostalcode,
                                    currentPostalname,
                                    addressLinkId,
                                    ONE_WK_PERSONAL_SLIP_DESTRUCT_HOURS
                                  );
                                  return;
                                }
                                shareTimedLink(
                                  LINK_TYPES.PERSONAL,
                                  currentPostalcode,
                                  addressLinkId,
                                  `Units for ${currentPostalname}`,
                                  assignmentMessage(currentPostalname),
                                  `${domain}/${currentPostalcode}/${code}/${addressLinkId}`,
                                  ONE_WK_PERSONAL_SLIP_DESTRUCT_HOURS
                                );
                              }}
                            >
                              One-week
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() => {
                                if (isSpecialDevice) {
                                  specialShareTimedLink(
                                    LINK_TYPES.PERSONAL,
                                    currentPostalcode,
                                    currentPostalname,
                                    addressLinkId,
                                    FOUR_WKS_PERSONAL_SLIP_DESTRUCT_HOURS
                                  );
                                  return;
                                }
                                shareTimedLink(
                                  LINK_TYPES.PERSONAL,
                                  currentPostalcode,
                                  addressLinkId,
                                  `Units for ${currentPostalname}`,
                                  assignmentMessage(currentPostalname),
                                  `${domain}/${currentPostalcode}/${code}/${addressLinkId}`,
                                  FOUR_WKS_PERSONAL_SLIP_DESTRUCT_HOURS
                                );
                              }}
                            >
                              One-month
                            </Dropdown.Item>
                          </DropdownButton>
                        </ComponentAuthorizer>
                        <ComponentAuthorizer
                          requiredPermission={USER_ACCESS_LEVELS.CONDUCTOR}
                          userPermission={userAccessLevel}
                        >
                          <>
                            <Button
                              size="sm"
                              variant="outline-primary"
                              className="m-1"
                              onClick={(_) => {
                                if (isSpecialDevice) {
                                  specialShareTimedLink(
                                    LINK_TYPES.ASSIGNMENT,
                                    currentPostalcode,
                                    currentPostalname,
                                    addressLinkId
                                  );
                                  return;
                                }
                                shareTimedLink(
                                  LINK_TYPES.ASSIGNMENT,
                                  currentPostalcode,
                                  addressLinkId,
                                  `Units for ${currentPostalname}`,
                                  assignmentMessage(currentPostalname),
                                  `${domain}/${currentPostalcode}/${code}/${addressLinkId}`
                                );
                              }}
                            >
                              {isSettingAssignLink &&
                                selectedPostal === currentPostalcode && (
                                  <>
                                    <Spinner
                                      as="span"
                                      animation="border"
                                      size="sm"
                                      aria-hidden="true"
                                    />{" "}
                                  </>
                                )}
                              {addressElement.assigneeCount > 0 && (
                                <Badge bg="danger" className="me-1">
                                  {`${addressElement.assigneeCount}`}
                                </Badge>
                              )}
                              Assign
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-primary"
                              className="m-1"
                              onClick={async () => {
                                setIsSettingViewLink(true);
                                try {
                                  const territoryWindow = window.open(
                                    "",
                                    "_blank"
                                  );
                                  if (territoryWindow) {
                                    territoryWindow.document.body.innerHTML =
                                      TERRITORY_VIEW_WINDOW_WELCOME_TEXT;
                                  }
                                  await setTimedLink(
                                    LINK_TYPES.VIEW,
                                    currentPostalcode,
                                    addressLinkId
                                  );
                                  territoryWindow!.location.href = `${domain}/${currentPostalcode}/${code}/${addressLinkId}`;
                                } catch (error) {
                                  errorHandler(error, rollbar);
                                } finally {
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
                          </>
                        </ComponentAuthorizer>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          className="m-1"
                          onClick={(e) => {
                            window.open(
                              `http://maps.google.com.sg/maps?q=${zipcode}`,
                              "_blank"
                            );
                          }}
                        >
                          Direction
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          className="m-1"
                          onClick={(event) => {
                            handleClickFeedback(
                              event,
                              currentPostalcode,
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
                        <ComponentAuthorizer
                          requiredPermission={
                            USER_ACCESS_LEVELS.TERRITORY_SERVANT
                          }
                          userPermission={userAccessLevel}
                        >
                          <Dropdown align="end" className="m-1">
                            <Dropdown.Toggle
                              variant="outline-primary"
                              size="sm"
                            >
                              Address
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item
                                onClick={() => {
                                  handleClickChangeAddressName(
                                    currentPostalcode,
                                    currentPostalname
                                  );
                                }}
                              >
                                Rename
                              </Dropdown.Item>
                              <Dropdown.Item
                                onClick={() => {
                                  handleClickAddUnit(
                                    currentPostalcode,
                                    addressElement.floors.length
                                  );
                                }}
                              >
                                Add Unit No.
                              </Dropdown.Item>
                              <Dropdown.Item
                                onClick={() => {
                                  addFloorToBlock(currentPostalcode);
                                }}
                              >
                                Add Higher Floor
                              </Dropdown.Item>
                              <Dropdown.Item
                                onClick={() => {
                                  addFloorToBlock(currentPostalcode, true);
                                }}
                              >
                                Add Lower Floor
                              </Dropdown.Item>
                              <Dropdown.Item
                                onClick={() =>
                                  confirmAlert({
                                    customUI: ({ onClose }) => {
                                      return (
                                        <Container>
                                          <Card
                                            bg="warning"
                                            className="text-center"
                                          >
                                            <Card.Header>
                                              Warning ⚠️
                                            </Card.Header>
                                            <Card.Body>
                                              <Card.Title>
                                                Are You Very Sure ?
                                              </Card.Title>
                                              <Card.Text>
                                                This action will reset all unit
                                                status of {currentPostalname}.
                                              </Card.Text>
                                              <Button
                                                className="m-1"
                                                variant="primary"
                                                onClick={() => {
                                                  resetBlock(currentPostalcode);
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
                                Reset Status
                              </Dropdown.Item>
                              <Dropdown.Item
                                onClick={() =>
                                  confirmAlert({
                                    customUI: ({ onClose }) => {
                                      return (
                                        <Container>
                                          <Card
                                            bg="warning"
                                            className="text-center"
                                          >
                                            <Card.Header>
                                              Warning ⚠️
                                            </Card.Header>
                                            <Card.Body>
                                              <Card.Title>
                                                Are You Very Sure ?
                                              </Card.Title>
                                              <Card.Text>
                                                The action will completely
                                                delete, {currentPostalname}.
                                              </Card.Text>
                                              <Button
                                                className="m-1"
                                                variant="primary"
                                                onClick={() => {
                                                  deleteBlock(
                                                    currentPostalcode
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
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </ComponentAuthorizer>
                      </Container>
                    </Navbar>
                    <Table
                      key={`table-${currentPostalcode}`}
                      bordered
                      striped
                      hover
                      responsive="sm"
                      className="sticky-table"
                    >
                      <thead>
                        <tr>
                          <th
                            scope="col"
                            className="text-center align-middle sticky-left-cell"
                          >
                            lvl/unit
                          </th>
                          {addressElement.floors &&
                            addressElement.floors[0].units.map(
                              (item, index) => {
                                return (
                                  <th
                                    key={`${index}-${item.number}`}
                                    scope="col"
                                    className={`${
                                      isAdmin ? "admin-unit-header " : ""
                                    }text-center align-middle`}
                                    onClick={() => {
                                      if (!isAdmin) return;
                                      handleClickUpdateUnit(
                                        currentPostalcode,
                                        addressElement.floors[0].units.length,
                                        item.sequence,
                                        item.number,
                                        maxUnitNumberLength
                                      );
                                    }}
                                  >
                                    {ZeroPad(item.number, maxUnitNumberLength)}
                                  </th>
                                );
                              }
                            )}
                        </tr>
                      </thead>
                      <tbody key={`tbody-${currentPostalcode}`}>
                        {addressElement.floors &&
                          addressElement.floors.map(
                            (floorElement, floorIndex) => (
                              <tr key={`row-${floorIndex}`}>
                                <th
                                  className="text-center inline-cell sticky-left-cell"
                                  key={`floor-${floorIndex}`}
                                  scope="row"
                                >
                                  <ComponentAuthorizer
                                    requiredPermission={
                                      USER_ACCESS_LEVELS.TERRITORY_SERVANT
                                    }
                                    userPermission={userAccessLevel}
                                  >
                                    <Button
                                      size="sm"
                                      variant="outline-warning"
                                      className="me-1"
                                      onClick={() => {
                                        const hasOnlyOneFloor =
                                          addressElement.floors.length === 1;
                                        if (hasOnlyOneFloor) {
                                          alert(
                                            `Territory requires at least 1 floor.`
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
                                                  <Card.Header>
                                                    Warning ⚠️
                                                  </Card.Header>
                                                  <Card.Body>
                                                    <Card.Title>
                                                      Are You Very Sure ?
                                                    </Card.Title>
                                                    <Card.Text>
                                                      This action will delete
                                                      floor {floorElement.floor}{" "}
                                                      of {currentPostalcode}.
                                                    </Card.Text>
                                                    <Button
                                                      className="m-1"
                                                      variant="primary"
                                                      onClick={() => {
                                                        deleteBlockFloor(
                                                          currentPostalcode,
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
                                  </ComponentAuthorizer>
                                  {`${ZeroPad(
                                    floorElement.floor,
                                    DEFAULT_FLOOR_PADDING
                                  )}`}
                                </th>
                                {floorElement.units.map(
                                  (detailsElement, index) => (
                                    <td
                                      align="center"
                                      className={`inline-cell ${
                                        policy?.isAvailable(detailsElement)
                                          ? "available"
                                          : ""
                                      }`}
                                      onClick={(event) =>
                                        handleClickModal(
                                          event,
                                          currentPostalcode,
                                          floorElement.floor,
                                          detailsElement.number,
                                          detailsElement.type,
                                          detailsElement.note,
                                          detailsElement.status,
                                          detailsElement.nhcount,
                                          detailsElement.languages,
                                          detailsElement.dnctime,
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
                                  )
                                )}
                              </tr>
                            )
                          )}
                      </tbody>
                    </Table>
                  </div>
                </Accordion.Body>
              </Accordion.Item>
            );
          })}
        </Accordion>
        {isAdmin && (
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
        {isAdmin && (
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
        {isAdmin && (
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
        {isAdmin && (
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
                  placeholder={"Territory code. For eg, M01, W12, etc."}
                />
                <GenericTextField
                  label="Name"
                  name="name"
                  handleChange={onFormChange}
                  changeValue={`${(values as valuesDetails).name}`}
                  required={true}
                  placeholder={
                    "Name of the territory. For eg, 801-810, Woodlands Drive."
                  }
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
        {isAdmin && (
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
                  placeholder={
                    "Block/Building postal code. Eg, 730801, 752367, etc"
                  }
                />
                <GenericTextField
                  label="Address Name"
                  name="name"
                  handleChange={onFormChange}
                  changeValue={`${(values as valuesDetails).name}`}
                  required={true}
                  placeholder={
                    "Block/Building name. Eg, 367, Sembawang Star Crescent"
                  }
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
        {isAdmin && (
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
        {isAdmin && (
          <Modal show={isUnitDetails}>
            <Modal.Header>
              <Modal.Title>
                Unit {`${(values as valuesDetails).unitDisplay}`}
              </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleUpdateUnit}>
              <Modal.Body>
                <GenericTextField
                  label="Sequence Number"
                  name="sequence"
                  placeholder="Optional unit row sequence number"
                  handleChange={(e: ChangeEvent<HTMLElement>) => {
                    const { value } = e.target as HTMLInputElement;
                    setValues({ ...values, sequence: value });
                  }}
                  changeValue={`${(values as valuesDetails).sequence}`}
                />
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => toggleModal(ADMIN_MODAL_TYPES.UPDATE_UNIT)}
                >
                  Close
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    const hasOnlyOneUnitNumber =
                      (values as valuesDetails).unitlength === 1;
                    if (hasOnlyOneUnitNumber) {
                      alert(`Territory requires at least 1 unit number.`);
                      return;
                    }
                    toggleModal(ADMIN_MODAL_TYPES.UPDATE_UNIT);
                    confirmAlert({
                      customUI: ({ onClose }) => {
                        return (
                          <Container>
                            <Card bg="warning" className="text-center">
                              <Card.Header>Warning ⚠️</Card.Header>
                              <Card.Body>
                                <Card.Title>Are You Very Sure ?</Card.Title>
                                <Card.Text>
                                  This action will delete unit number{" "}
                                  {(values as valuesDetails).unit} of{" "}
                                  {(values as valuesDetails).postal}.
                                </Card.Text>
                                <Button
                                  className="m-1"
                                  variant="primary"
                                  onClick={() => {
                                    processPostalUnitNumber(
                                      `${(values as valuesDetails).postal}`,
                                      `${(values as valuesDetails).unit}`,
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
                  Delete Unit
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
              userAccessLevel={userAccessLevel}
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
                  let dnctime = null;
                  const statusValue = toggleValue.toString();
                  setIsNotHome(false);
                  setIsDnc(false);
                  if (statusValue === STATUS_CODES.NOT_HOME) {
                    setIsNotHome(true);
                  } else if (statusValue === STATUS_CODES.DO_NOT_CALL) {
                    setIsDnc(true);
                    dnctime = new Date().getTime();
                  }
                  setValues({
                    ...values,
                    nhcount: NOT_HOME_STATUS_CODES.DEFAULT,
                    dnctime: dnctime,
                    status: statusValue
                  });
                }}
                changeValue={`${(values as valuesDetails).status}`}
              />
              <Collapse in={isDnc}>
                <div className="text-center">
                  <DncDateField
                    changeDate={(values as valuesDetails).dnctime}
                    handleDateChange={(date) => {
                      setValues({ ...values, dnctime: date.getTime() });
                    }}
                  />
                </div>
              </Collapse>
              <Collapse in={isNotHome}>
                <div className="text-center">
                  <HHNotHomeField
                    changeValue={`${(values as valuesDetails).nhcount}`}
                    handleChange={(toggleValue) => {
                      setValues({ ...values, nhcount: toggleValue.toString() });
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
              userAccessLevel={userAccessLevel}
            />
          </Form>
        </Modal>
        <Modal show={isProfile}>
          <Modal.Header>
            <Modal.Title>{`My profile`}</Modal.Title>
          </Modal.Header>
          <Form>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label htmlFor="userid">User</Form.Label>
                <Form.Control
                  readOnly
                  id="userid"
                  defaultValue={`${user.email}`}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label htmlFor="txtMaxTries">Max Tries</Form.Label>
                <Form.Control
                  readOnly
                  id="txtMaxTries"
                  defaultValue={`${policy?.getMaxTries()}`}
                />
                <Form.Text className="text-muted">
                  The number of times to try not at homes before considering it
                  done
                </Form.Text>
              </Form.Group>
              {trackLanguages && (
                <Form.Group className="mb-3">
                  <Form.Label htmlFor="txtHomeLanguage">
                    Home Language
                  </Form.Label>
                  <Form.Control
                    readOnly
                    id="txtHomeLanguage"
                    defaultValue={`${getLanguageDisplayByCode(
                      policy?.getHomeLanguage() as string
                    )}`}
                  />
                </Form.Group>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => toggleModal(ADMIN_MODAL_TYPES.PROFILE)}
              >
                Close
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </div>
    </Fade>
  );
}

export default Admin;
