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
  HOUSEHOLD_LANGUAGES,
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
  ONE_WK_PERSONAL_SLIP_DESTRUCT_HOURS
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
import gearImage from "../assets/gear.svg";
import Image from "react-bootstrap/Image";
import { Preferences, loadPreferences, savePreferences } from "./preferences";
function Admin({ user }: adminProps) {
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
  const [isDnc, setIsDnc] = useState<boolean>(false);
  const [isUnitDetails, setIsUnitDetails] = useState<boolean>(false);
  const [isProfile, setIsProfile] = useState<boolean>(false);
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
    setAddresses(new Map<String, addressDetails>());
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
    const territoryName = territoryNameResult.val();
    setSelectedTerritory(`${selectedTerritoryCode} - ${territoryName}`);
    setSelectedTerritoryCode(selectedTerritoryCode);
    setSelectedTerritoryName(territoryName);
    // detach unsub listeners first then clear
    refreshAddressState();
    unsubscribers = [] as Array<Unsubscribe>;
    let postalCodeListing = [] as Array<string>;
    territoryAddsResult.forEach((addElement: any) => {
      postalCodeListing.push(addElement.val());
      return false;
    });
    for (const postalCode of postalCodeListing) {
      unsubscribers.push(
        onValue(child(ref(database), `/${postalCode}`), async (snapshot) => {
          if (snapshot.exists()) {
            const territoryData = snapshot.val();
            const floorData = await processAddressData(
              postalCode,
              territoryData.units
            );
            const counts = await processLinkCounts(postalCode);
            const addressData = {
              assigneeCount: counts.assigneeCount,
              personalCount: counts.personalCount,
              x_zip: territoryData.x_zip,
              name: territoryData.name,
              postalcode: postalCode,
              floors: floorData,
              feedback: territoryData.feedback
            };
            setAccordionKeys((existingKeys) => [...existingKeys, postalCode]);
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
      await pollingFunction(() =>
        remove(ref(database, `${postalcode}/units/${floor}`))
      );
    } catch (error) {
      errorHandler(error, rollbar);
    }
  };

  const deleteBlock = async (postalcode: String) => {
    try {
      await remove(ref(database, `${postalcode}`));
      const addressSnapshot = await pollingFunction(() =>
        get(
          ref(
            database,
            `congregations/${code}/territories/${selectedTerritoryCode}/addresses`
          )
        )
      );
      if (addressSnapshot.exists()) {
        const addressData = addressSnapshot.val();
        for (const addkey in addressData) {
          const units = addressData[addkey];
          if (units === postalcode) {
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
      alert(`Deleted postal address, ${postalcode}.`);
      await refreshCongregationTerritory(`${selectedTerritoryCode}`);
    } catch (error) {
      errorHandler(error, rollbar);
    }
  };

  const addFloorToBlock = async (postalcode: String, lowerFloor = false) => {
    const blockAddresses = addresses.get(postalcode);
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
        languages: ""
      };
    });
    try {
      await pollingFunction(() => update(ref(database), unitUpdates));
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
          nhcount: NOT_HOME_STATUS_CODES.DEFAULT,
          languages: element.languages,
          dnctime: element.dnctime
        };
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
    const prefs = new Preferences();
    loadPreferences(prefs);
    link.homeLanguage = prefs.homeLanguage;
    link.maxTries = prefs.maxTries;
    return pollingFunction(async () => {
      set(ref(database, `links/${addressLinkId}`), link);
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

  const handleClickAddUnit = (
    _: MouseEvent<HTMLElement>,
    postalcode: String,
    floors: number
  ) => {
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
      sequence: unitseq || ""
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

  const handleSubmitProfile = async (event: FormEvent<HTMLElement>) => {
    event.preventDefault();
    const prefs = values as Preferences;
    setIsSaving(true);
    try {
      savePreferences(prefs);
      toggleModal(ADMIN_MODAL_TYPES.PROFILE);
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
    const blockAddresses = addresses.get(`${postalCode}`);
    if (!blockAddresses) return;

    const unitUpdates: unitMaps = {};
    for (const index in blockAddresses.floors) {
      const floorDetails = blockAddresses.floors[index];
      floorDetails.units.forEach((_) => {
        unitUpdates[
          `/${postalCode}/units/${floorDetails.floor}/${unitNumber}/sequence`
        ] = sequence || {};
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
    const unitSeq = details.sequence;
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
      setIsSettingAssignLink(true);
      try {
        await navigator.share({
          title: title,
          text: body,
          url: url
        });
        await setTimedLink(linktype, postalcode, linkId, hours);
        setAccordionKeys((existingKeys) =>
          existingKeys.filter((key) => key !== postalcode)
        );
      } catch (error) {
        errorHandler(error, rollbar);
      } finally {
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

  const getUserAccessLevel = async (
    user: User,
    congregationCode: string | undefined
  ) => {
    if (!congregationCode) return;
    const tokenData = await user.getIdTokenResult(true);
    return tokenData.claims[congregationCode];
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

    checkTraceLangStatus(`${code}`).then((snapshot) => {
      const isTrackLanguages = snapshot.val();
      setTrackLanguages(isTrackLanguages);
      if (isTrackLanguages) {
        setPolicy(new LanguagePolicy());
      }
    });
    checkTraceRaceStatus(`${code}`).then((snapshot) => {
      const isTrackRace = snapshot.val();
      setTrackRace(isTrackRace);
      if (isTrackRace) {
        setPolicy(new RacePolicy());
      }
    });

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

  const territoryAddresses = Array.from(addresses.values());
  const congregationTerritoryList = Array.from(territories.values());
  const isAdmin = userAccessLevel === USER_ACCESS_LEVELS.TERRITORY_SERVANT;
  const isReadonly = userAccessLevel === USER_ACCESS_LEVELS.READ_ONLY;
  return (
    <Fade appear={true} in={true}>
      <div>
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
                    {selectedTerritory
                      ? `${selectedTerritory}`
                      : "Select Territory"}
                  </Button>
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
                    setValues({ ...values, name: "", code: "" });
                    toggleModal(ADMIN_MODAL_TYPES.CREATE_TERRITORY);
                  }}
                >
                  Create Territory
                </Button>
              </ComponentAuthorizer>
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
                      setValues({ ...values, name: selectedTerritoryName });
                      toggleModal(ADMIN_MODAL_TYPES.RENAME_TERRITORY);
                    }}
                  >
                    Edit Territory Name
                  </Button>
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
                    Create Address
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
                  const prefs = new Preferences();
                  loadPreferences(prefs);
                  setValues({
                    ...values,
                    homeLanguage: prefs.homeLanguage,
                    maxTries: prefs.maxTries
                  });
                  toggleModal(ADMIN_MODAL_TYPES.PROFILE);
                }}
              >
                <Image fluid src={gearImage} />
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
          {territoryAddresses.map((addressElement) => {
            const maxUnitNumberLength = getMaxUnitLength(addressElement.floors);
            const completedPercent = getCompletedPercent(
              policy as Policy,
              addressElement.floors
            );
            const addressLinkId = nanoid();
            const zipcode =
              addressElement.x_zip == null
                ? addressElement.postalcode
                : addressElement.x_zip;
            return (
              <Accordion.Item
                key={`accordion-${addressElement.postalcode}`}
                eventKey={`${addressElement.postalcode}`}
              >
                <Accordion.Header>{addressElement.name}</Accordion.Header>
                <Accordion.Body className="p-0">
                  <ProgressBar
                    style={{ borderRadius: 0 }}
                    now={completedPercent.completedValue}
                    label={completedPercent.completedDisplay}
                  />
                  <div key={`div-${addressElement.postalcode}`}>
                    <Navbar
                      bg="light"
                      expand="lg"
                      key={`navbar-${addressElement.postalcode}`}
                    >
                      <Container fluid className="justify-content-end">
                        {addressElement.personalCount > 0 && (
                          <Badge bg="danger" pill>
                            {`${addressElement.personalCount}`}
                          </Badge>
                        )}
                        <ComponentAuthorizer
                          requiredPermission={
                            USER_ACCESS_LEVELS.TERRITORY_SERVANT
                          }
                          userPermission={userAccessLevel}
                        >
                          <DropdownButton
                            key={`assigndrop-${addressElement.postalcode}`}
                            size="sm"
                            variant="outline-primary"
                            title="Personal"
                            className="m-1 d-inline-block"
                          >
                            <Dropdown.Item
                              onClick={() => {
                                shareTimedLink(
                                  LINK_TYPES.PERSONAL,
                                  `${addressElement.postalcode}`,
                                  addressLinkId,
                                  `Units for ${addressElement.name}`,
                                  assignmentMessage(addressElement.name),
                                  `${domain}/${addressElement.postalcode}/${code}/${addressLinkId}`,
                                  ONE_WK_PERSONAL_SLIP_DESTRUCT_HOURS
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
                              One-week
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() => {
                                shareTimedLink(
                                  LINK_TYPES.PERSONAL,
                                  `${addressElement.postalcode}`,
                                  addressLinkId,
                                  `Units for ${addressElement.name}`,
                                  assignmentMessage(addressElement.name),
                                  `${domain}/${addressElement.postalcode}/${code}/${addressLinkId}`,
                                  FOUR_WKS_PERSONAL_SLIP_DESTRUCT_HOURS
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
                              One-month
                            </Dropdown.Item>
                          </DropdownButton>
                        </ComponentAuthorizer>
                        <ComponentAuthorizer
                          requiredPermission={USER_ACCESS_LEVELS.CONDUCTOR}
                          userPermission={userAccessLevel}
                        >
                          <>
                            {addressElement.assigneeCount > 0 && (
                              <Badge bg="danger" pill>
                                {`${addressElement.assigneeCount}`}
                              </Badge>
                            )}
                            <Button
                              size="sm"
                              variant="outline-primary"
                              className="m-1"
                              onClick={(_) => {
                                shareTimedLink(
                                  LINK_TYPES.ASSIGNMENT,
                                  `${addressElement.postalcode}`,
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
                                    addressElement.postalcode,
                                    addressLinkId
                                  );
                                  territoryWindow!.location.href = `${domain}/${addressElement.postalcode}/${code}/${addressLinkId}`;
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
                        <ComponentAuthorizer
                          requiredPermission={
                            USER_ACCESS_LEVELS.TERRITORY_SERVANT
                          }
                          userPermission={userAccessLevel}
                        >
                          <>
                            <Button
                              size="sm"
                              variant="outline-primary"
                              className="m-1"
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
                            <Button
                              size="sm"
                              variant="outline-primary"
                              className="m-1"
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
                            <Button
                              size="sm"
                              variant="outline-primary"
                              className="m-1"
                              onClick={(event) => {
                                addFloorToBlock(addressElement.postalcode);
                              }}
                            >
                              Add Higher Floor
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-primary"
                              className="m-1"
                              onClick={(event) => {
                                addFloorToBlock(
                                  addressElement.postalcode,
                                  true
                                );
                              }}
                            >
                              Add Lower Floor
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-primary"
                              className="m-1"
                              onClick={() =>
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
                                              This action will reset all unit
                                              status of {addressElement.name}.
                                            </Card.Text>
                                            <Button
                                              className="m-1"
                                              variant="primary"
                                              onClick={() => {
                                                resetBlock(
                                                  addressElement.postalcode
                                                );
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
                            <Button
                              size="sm"
                              variant="outline-primary"
                              className="m-1"
                              onClick={() =>
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
                                              The action will completely delete,{" "}
                                              {addressElement.name}.
                                            </Card.Text>
                                            <Button
                                              className="m-1"
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
                          </>
                        </ComponentAuthorizer>
                      </Container>
                    </Navbar>
                    <Table
                      key={`table-${addressElement.postalcode}`}
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
                                        addressElement.postalcode,
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
                      <tbody key={`tbody-${addressElement.postalcode}`}>
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
                                                      of{" "}
                                                      {
                                                        addressElement.postalcode
                                                      }
                                                      .
                                                    </Card.Text>
                                                    <Button
                                                      className="m-1"
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
                                      className="inline-cell"
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
                  setIsNotHome(false);
                  setIsDnc(false);
                  if (toggleValue.toString() === STATUS_CODES.NOT_HOME) {
                    setIsNotHome(true);
                  } else if (
                    toggleValue.toString() === STATUS_CODES.DO_NOT_CALL
                  ) {
                    setIsDnc(true);
                    dnctime = new Date().getTime();
                  }
                  setValues({
                    ...values,
                    nhcount: NOT_HOME_STATUS_CODES.DEFAULT,
                    dnctime: dnctime,
                    status: toggleValue
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
              userAccessLevel={userAccessLevel}
            />
          </Form>
        </Modal>
        <Modal show={isProfile}>
          <Modal.Header>
            <Modal.Title>{`My profile`}</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmitProfile}>
            <Modal.Body>
              <Form.Label htmlFor="inputMaxTries">Max Tries</Form.Label>
              <Form.Select
                id="inputMaxTries"
                name="maxTries"
                value={`${(values as Preferences).maxTries}`}
                onChange={onFormChange}
              >
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
              </Form.Select>
              <Form.Label htmlFor="inputHomeLanguage">Your Language</Form.Label>
              <Form.Select
                id="inputHomeLanguage"
                name="homeLanguage"
                value={`${(values as Preferences).homeLanguage}`}
                onChange={onFormChange}
              >
                <option value={HOUSEHOLD_LANGUAGES.ENGLISH.CODE}>
                  {HOUSEHOLD_LANGUAGES.ENGLISH.DISPLAY}
                </option>
                <option value={HOUSEHOLD_LANGUAGES.CHINESE.CODE}>
                  {HOUSEHOLD_LANGUAGES.CHINESE.DISPLAY}
                </option>
                <option value={HOUSEHOLD_LANGUAGES.INDONESIAN.CODE}>
                  {HOUSEHOLD_LANGUAGES.INDONESIAN.DISPLAY}
                </option>
                <option value={HOUSEHOLD_LANGUAGES.TAGALOG.CODE}>
                  {HOUSEHOLD_LANGUAGES.TAGALOG.DISPLAY}
                </option>
                <option value={HOUSEHOLD_LANGUAGES.TAMIL.CODE}>
                  {HOUSEHOLD_LANGUAGES.TAMIL.DISPLAY}
                </option>
                <option value={HOUSEHOLD_LANGUAGES.BURMESE.CODE}>
                  {HOUSEHOLD_LANGUAGES.BURMESE.DISPLAY}
                </option>
              </Form.Select>
            </Modal.Body>
            <ModalFooter
              handleClick={() => toggleModal(ADMIN_MODAL_TYPES.PROFILE)}
              userAccessLevel={userAccessLevel}
              isSaving={isSaving}
            />
          </Form>
        </Modal>
      </div>
    </Fade>
  );
}

export default Admin;
