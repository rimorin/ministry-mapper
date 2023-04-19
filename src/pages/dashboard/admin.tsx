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
  off,
  DataSnapshot,
  orderByChild,
  equalTo
} from "firebase/database";
import "../../css/admin.css";
import { signOut, updatePassword, User } from "firebase/auth";
import { nanoid } from "nanoid";
import {
  MouseEvent,
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
  useCallback,
  useMemo
} from "react";
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
  ListGroup,
  Modal,
  Navbar,
  ProgressBar,
  Spinner
} from "react-bootstrap";
import { database, auth } from "../../firebase";
import {
  Policy,
  valuesDetails,
  floorDetails,
  territoryDetails,
  addressDetails,
  adminProps,
  unitMaps
} from "../../utils/interface";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { useParams } from "react-router-dom";
import {
  AdminLinkField,
  DncDateField,
  FloorField,
  GenericTextAreaField,
  GenericInputField,
  HHLangField,
  HHNotHomeField,
  HHStatusField,
  HHTypeField,
  ModalFooter,
  ModalUnitTitle,
  InstructionsButton,
  ModalSubmitButton
} from "../../components/form";
import "react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css";
import { useRollbar } from "@rollbar/react";
import { RacePolicy, LanguagePolicy, LinkSession } from "../../utils/policies";
import { zeroPad } from "react-countdown";
import getUA from "ua-parser-js";
import { AdminTable } from "../../components/table";
import PasswordChecklist from "react-password-checklist";
import {
  pollingVoidFunction,
  processAddressData,
  processLinkCounts,
  errorHandler,
  processHHLanguages,
  ZeroPad,
  addHours,
  triggerPostalCodeListeners,
  assignmentMessage,
  getMaxUnitLength,
  getCompletedPercent,
  checkTraceLangStatus,
  checkTraceRaceStatus,
  parseHHLanguages,
  getLanguageDisplayByCode,
  checkCongregationExpireHours,
  processPropertyNumber,
  isValidPostal,
  SetPollerInterval,
  pollingQueryFunction,
  isValidPostalSequence,
  LinkTypeDescription,
  LinkDateFormatter
} from "../../utils/helpers";
import {
  EnvironmentIndicator,
  TerritoryListing,
  NavBarBranding,
  AggregationBadge,
  ComponentAuthorizer,
  TerritoryHeader,
  BackToTopButton,
  UnauthorizedPage
} from "../../components/navigation";
import { Loader, Welcome } from "../../components/static";
import {
  STATUS_CODES,
  HOUSEHOLD_TYPES,
  NOT_HOME_STATUS_CODES,
  MUTABLE_CODES,
  ADMIN_MODAL_TYPES,
  DEFAULT_FLOOR_PADDING,
  DEFAULT_SELF_DESTRUCT_HOURS,
  LINK_TYPES,
  UNSUPPORTED_BROWSER_MSG,
  UA_DEVICE_MAKES,
  RELOAD_INACTIVITY_DURATION,
  RELOAD_CHECK_INTERVAL_MS,
  USER_ACCESS_LEVELS,
  TERRITORY_VIEW_WINDOW_WELCOME_TEXT,
  MIN_START_FLOOR,
  PIXELS_TILL_BK_TO_TOP_BUTTON_DISPLAY,
  TERRITORY_TYPES,
  MINIMUM_PASSWORD_LENGTH,
  PASSWORD_POLICY,
  LINK_SELECTOR_VIEWPORT_HEIGHT
} from "../../utils/constants";
import Calendar from "react-calendar";
function Admin({ user }: adminProps) {
  const { code } = useParams();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isFeedback, setIsFeedback] = useState<boolean>(false);
  const [isLinkRevoke, setIsLinkRevoke] = useState<boolean>(false);
  const [isCreatePublic, setIsCreatePublic] = useState<boolean>(false);
  const [isCreatePrivate, setIsCreatePrivate] = useState<boolean>(false);
  const [isAddressRename, setIsAddressRename] = useState<boolean>(false);
  const [isSettingPersonalLink, setIsSettingPersonalLink] =
    useState<boolean>(false);
  const [isSettingAssignLink, setIsSettingAssignLink] =
    useState<boolean>(false);
  const [selectedPostal, setSelectedPostal] = useState<string>();
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
  const [isChangePostal, setIsChangePostal] = useState<boolean>(false);
  const [isChangeTerritoryCode, setIsChangeTerritoryCode] =
    useState<boolean>(false);
  const [showBkTopButton, setShowBkTopButton] = useState(false);
  const [showTerritoryListing, setShowTerritoryListing] =
    useState<boolean>(false);
  const [trackRace, setTrackRace] = useState<boolean>(true);
  const [trackLanguages, setTrackLanguages] = useState<boolean>(true);
  const [showChangeAddressTerritory, setShowChangeAddressTerritory] =
    useState<boolean>(false);
  const [isChangePassword, setIsChangePassword] = useState<boolean>(false);
  const [isChangePasswordOk, setIsChangePasswordOk] = useState<boolean>(false);
  const [name, setName] = useState<string>();
  const [values, setValues] = useState<object>({});
  const [territories, setTerritories] = useState(
    new Map<string, territoryDetails>()
  );
  const [sortedAddressList, setSortedAddressList] = useState<
    Array<territoryDetails>
  >([]);
  const [selectedTerritoryCode, setSelectedTerritoryCode] = useState<string>();
  const [selectedTerritoryName, setSelectedTerritoryName] = useState<string>();
  const [addressData, setAddressData] = useState(
    new Map<string, addressDetails>()
  );
  const [accordingKeys, setAccordionKeys] = useState<Array<string>>([]);
  const [policy, setPolicy] = useState<Policy>();
  const [userAccessLevel, setUserAccessLevel] = useState<number>();
  const [defaultExpiryHours, setDefaultExpiryHours] = useState<number>(
    DEFAULT_SELF_DESTRUCT_HOURS
  );
  const [isInstructions, setIsInstructions] = useState<boolean>(false);
  const [isPersonalSlip, setIsPersonalSlip] = useState<boolean>(false);
  const [isAssignments, setIsAssignments] = useState<boolean>(false);
  const [assignments, setAssignments] = useState<Array<LinkSession>>([]);
  const domain = process.env.PUBLIC_URL;
  const rollbar = useRollbar();
  let unsubscribers = new Array<Unsubscribe>();

  const refreshAddressState = () => {
    unsubscribers.forEach((unsubFunction) => {
      unsubFunction();
    });
    setAddressData(new Map<string, addressDetails>());
  };

  const clearAdminState = () => {
    refreshAddressState();
    const congregationReference = child(ref(database), `congregations/${code}`);
    off(congregationReference);
  };

  const logoutUser = async () => {
    clearAdminState();
    await signOut(auth);
  };

  const processSelectedTerritory = async (selectedTerritoryCode: string) => {
    const territoryAddsResult = await pollingQueryFunction(() =>
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

    const territoryNameResult = await pollingQueryFunction(() =>
      get(
        child(
          ref(database),
          `congregations/${code}/territories/${selectedTerritoryCode}/name`
        )
      )
    );
    setSelectedTerritoryCode(selectedTerritoryCode);
    setSelectedTerritoryName(territoryNameResult.val());
    // detach unsubscribers listeners first then clear them.
    refreshAddressState();
    unsubscribers = [] as Array<Unsubscribe>;
    const detailsListing = [] as Array<territoryDetails>;
    territoryAddsResult.forEach((addElement: DataSnapshot) => {
      detailsListing.push({
        code: addElement.val(),
        name: "",
        addresses: ""
      });
      return false;
    });
    setSortedAddressList(detailsListing);
    const pollerId = SetPollerInterval();
    for (const details of detailsListing) {
      const postalCode = details.code;
      setAccordionKeys((existingKeys) => [...existingKeys, `${postalCode}`]);
      unsubscribers.push(
        onValue(child(ref(database), `/${postalCode}`), async (snapshot) => {
          clearInterval(pollerId);
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
              feedback: postalSnapshot.feedback,
              type: postalSnapshot.type,
              instructions: postalSnapshot.instructions
            };
            setAddressData(
              (existingAddresses) =>
                new Map<string, addressDetails>(
                  existingAddresses.set(postalCode, addressData)
                )
            );
          }
        })
      );
    }
  };

  const deleteBlockFloor = async (postalcode: string, floor: string) => {
    try {
      await pollingVoidFunction(() =>
        remove(ref(database, `${postalcode}/units/${floor}`))
      );
    } catch (error) {
      errorHandler(error, rollbar);
    }
  };

  const getTerritoryAddress = async (territoryCode: string) => {
    return await pollingQueryFunction(() =>
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
          await pollingVoidFunction(() =>
            remove(ref(database, `${postalcode}`))
          );
        }
      }
      await pollingVoidFunction(() =>
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
                `congregations/${code}/territories/${selectedTerritoryCode}/addresses/${addkey}`
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
    if (!selectedTerritoryCode) return;
    try {
      await remove(ref(database, `${postalCode}`));
      await deleteTerritoryAddress(selectedTerritoryCode, postalCode);
      if (showAlert) alert(`Deleted address, ${name}.`);
      await refreshCongregationTerritory(`${selectedTerritoryCode}`);
    } catch (error) {
      errorHandler(error, rollbar);
    }
  };

  const addFloorToBlock = async (postalcode: string, lowerFloor = false) => {
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
      await pollingVoidFunction(() => update(ref(database), unitUpdates));
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

  const resetBlock = async (postalcode: string) => {
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
      await pollingVoidFunction(() => update(ref(database), unitUpdates));
    } catch (error) {
      errorHandler(error, rollbar);
    }
  };

  const onLanguageChange = (languages: string[]) => {
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
      case ADMIN_MODAL_TYPES.CREATE_PUBLIC_ADDRESS:
        setIsCreatePublic(!isCreatePublic);
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
      case ADMIN_MODAL_TYPES.UPDATE_POSTAL:
        setIsChangePostal(!isChangePostal);
        break;
      case ADMIN_MODAL_TYPES.UPDATE_TERRITORY_CODE:
        setIsChangeTerritoryCode(!isChangeTerritoryCode);
        break;
      case ADMIN_MODAL_TYPES.CREATE_PRIVATE_ADDRESS:
        setIsCreatePrivate(!isCreatePrivate);
        break;
      case ADMIN_MODAL_TYPES.CHANGE_PASSWORD:
        setIsChangePassword(!isChangePassword);
        break;
      case ADMIN_MODAL_TYPES.INSTRUCTIONS:
        setIsInstructions(!isInstructions);
        break;
      case ADMIN_MODAL_TYPES.PERSONAL_SLIP:
        setIsPersonalSlip(!isPersonalSlip);
        break;
      case ADMIN_MODAL_TYPES.ASSIGNMENTS:
        setIsAssignments(!isAssignments);
        break;
      default:
        setIsOpen(!isOpen);
    }
  };

  const handleClickModal = (
    _: MouseEvent<HTMLElement>,
    postal: string,
    floor: string,
    floors: Array<floorDetails>,
    unit: string,
    type: string,
    note: string,
    status: string,
    nhcount: string,
    languages: string,
    dnctime: string | undefined,
    maxUnitNumber: number,
    sequence: string | undefined,
    name: string,
    territoryType = TERRITORY_TYPES.PUBLIC
  ) => {
    const floorUnits = floors.find((e) => e.floor === floor);
    const unitDetails = floorUnits?.units.find((e) => e.number === unit);
    setValues({
      ...values,
      floor: floor,
      floorDisplay: ZeroPad(floor, DEFAULT_FLOOR_PADDING),
      unit: unit,
      propertyPostal:
        unitDetails?.propertyPostal === undefined
          ? ""
          : unitDetails?.propertyPostal,
      newPropertyPostal:
        unitDetails?.newPropertyPostal === undefined
          ? ""
          : unitDetails?.newPropertyPostal,
      unitDisplay: ZeroPad(unit, maxUnitNumber),
      type: type,
      note: note,
      postal: postal,
      status: status,
      nhcount: nhcount,
      languages: languages,
      dnctime: dnctime === undefined ? "" : Number(dnctime),
      sequence: sequence === undefined ? "" : Number(sequence),
      territoryType: territoryType,
      name: name
    });
    setIsNotHome(status === STATUS_CODES.NOT_HOME);
    setIsDnc(status === STATUS_CODES.DO_NOT_CALL);
    toggleModal();
  };

  const handleSubmitClick = async (event: FormEvent<HTMLElement>) => {
    event.preventDefault();
    const details = values as valuesDetails;
    const updateData: {
      type: string;
      note: string;
      status: string;
      nhcount: string | undefined;
      languages: string | undefined;
      dnctime: number | undefined;
      sequence?: number;
      x_zip?: string;
    } = {
      type: details.type,
      note: details.note,
      status: details.status,
      nhcount: details.nhcount,
      languages: details.languages,
      dnctime: details.dnctime
    };
    // Include sequence update value only when administering private territories
    const administeringPrivate =
      details.territoryType === TERRITORY_TYPES.PRIVATE &&
      userAccessLevel === USER_ACCESS_LEVELS.TERRITORY_SERVANT;
    if (administeringPrivate && details.sequence) {
      updateData.sequence = Number(details.sequence);
    }
    if (
      administeringPrivate &&
      details.propertyPostal !== details.newPropertyPostal
    ) {
      updateData.x_zip = details.newPropertyPostal;
    }
    setIsSaving(true);
    try {
      await pollingVoidFunction(() =>
        update(
          ref(
            database,
            `/${details.postal}/units/${details.floor}/${details.unit}`
          ),
          updateData
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
    postalCode: string,
    postalName: string,
    addressLinkId: string,
    hours: number
  ) => {
    const link = new LinkSession();
    link.tokenEndtime = addHours(hours);
    link.postalCode = postalCode;
    link.linkType = linktype;
    let currentPolicy = policy;
    if (currentPolicy === undefined) {
      currentPolicy = new LanguagePolicy();
    }
    link.homeLanguage = currentPolicy.getHomeLanguage();
    link.maxTries = currentPolicy.getMaxTries();
    // dont set user if its view type link. This will prevent this kind of links from appearing in assignments
    if (linktype != LINK_TYPES.VIEW) link.userId = user.uid;
    link.congregation = code;
    link.name = postalName;
    return pollingVoidFunction(async () => {
      await set(ref(database, `links/${addressLinkId}`), link);
      await triggerPostalCodeListeners(link.postalCode);
    });
  };

  const handleClickInstructions = (
    _: MouseEvent<HTMLElement>,
    postalcode: string,
    name: string,
    instructions: string
  ) => {
    setValues({
      ...values,
      instructions: instructions || "",
      postal: postalcode,
      name: name
    });
    toggleModal(ADMIN_MODAL_TYPES.INSTRUCTIONS);
  };

  const handleClickFeedback = (
    _: MouseEvent<HTMLElement>,
    postalcode: string,
    name: string,
    feedback: string
  ) => {
    setValues({
      ...values,
      feedback: feedback,
      postal: postalcode,
      name: name
    });
    toggleModal(ADMIN_MODAL_TYPES.FEEDBACK);
  };

  const handleClickAddUnit = (postalcode: string, floors: number) => {
    setValues({ ...values, postal: postalcode, floors: floors, unit: "" });
    toggleModal(ADMIN_MODAL_TYPES.ADD_UNIT);
  };

  const handleClickUpdateUnit = (
    postalcode: string,
    unitlength: number,
    unitseq: number | undefined,
    unit: string,
    maxUnitNumber: number,
    territoryType: number
  ) => {
    setValues({
      ...values,
      postal: postalcode,
      unit: unit,
      unitDisplay: zeroPad(`${unit}`, maxUnitNumber),
      unitlength: unitlength,
      sequence: unitseq === undefined ? "" : unitseq,
      territoryType: territoryType
    });
    toggleModal(ADMIN_MODAL_TYPES.UPDATE_UNIT);
  };

  const handleSubmitFeedback = async (event: FormEvent<HTMLElement>) => {
    event.preventDefault();
    const details = values as valuesDetails;
    setIsSaving(true);
    try {
      await pollingVoidFunction(() =>
        set(ref(database, `/${details.postal}/feedback`), details.feedback)
      );
      if (details.feedback)
        rollbar.info(
          `Conductor feedback on postalcode ${details.postal} of the ${code} congregation: ${details.feedback}`
        );
      toggleModal(ADMIN_MODAL_TYPES.FEEDBACK);
    } catch (error) {
      errorHandler(error, rollbar);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitInstructions = async (event: FormEvent<HTMLElement>) => {
    event.preventDefault();
    const details = values as valuesDetails;
    setIsSaving(true);
    try {
      await pollingVoidFunction(() =>
        set(
          ref(database, `/${details.postal}/instructions`),
          details.instructions
        )
      );
      if (details.instructions)
        rollbar.info(
          `Admin instructions on postalcode ${details.postal} of the ${code} congregation: ${details.instructions}`
        );
      toggleModal(ADMIN_MODAL_TYPES.INSTRUCTIONS);
    } catch (error) {
      errorHandler(error, rollbar);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClickPersonalSlip = (
    postalcode: string,
    name: string,
    linkid: string
  ) => {
    setValues({
      ...values,
      linkid: linkid,
      postal: postalcode,
      name: name,
      linkExpiryHrs: undefined
    });
    toggleModal(ADMIN_MODAL_TYPES.PERSONAL_SLIP);
  };

  const handleSubmitPersonalSlip = async (event: FormEvent<HTMLElement>) => {
    event.preventDefault();
    const details = values as valuesDetails;
    if (!details.postal || !details.name || !details.linkid) return;
    if (!details.linkExpiryHrs) {
      alert("Please select an expiry date.");
      return;
    }

    setIsSaving(true);
    try {
      if (isSpecialDevice) {
        specialShareTimedLink(
          LINK_TYPES.PERSONAL,
          details.postal,
          details.name,
          details.linkid,
          details.linkExpiryHrs
        );
        toggleModal(ADMIN_MODAL_TYPES.PERSONAL_SLIP);
        return;
      }
      shareTimedLink(
        LINK_TYPES.PERSONAL,
        details.postal,
        details.name,
        details.linkid,
        `Units for ${details.name}`,
        assignmentMessage(details.name),
        `${domain}/${details.postal}/${code}/${details.linkid}`,
        details.linkExpiryHrs
      );
      toggleModal(ADMIN_MODAL_TYPES.PERSONAL_SLIP);
    } catch (error) {
      errorHandler(error, rollbar);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClickChangeAddressName = (postalcode: string, name: string) => {
    setValues({ ...values, name: name, postal: postalcode });
    toggleModal(ADMIN_MODAL_TYPES.RENAME_ADDRESS_NAME);
  };

  const handleUpdateTerritoryName = async (event: FormEvent<HTMLElement>) => {
    event.preventDefault();
    const details = values as valuesDetails;
    const territoryName = details.name;
    setIsSaving(true);
    try {
      await pollingVoidFunction(() =>
        set(
          ref(
            database,
            `congregations/${code}/territories/${selectedTerritoryCode}/name`
          ),
          territoryName
        )
      );
      setSelectedTerritoryName(territoryName);
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
      await pollingVoidFunction(() =>
        set(ref(database, `/${details.postal}/name`), details.name)
      );
      toggleModal(ADMIN_MODAL_TYPES.RENAME_ADDRESS_NAME);
    } catch (error) {
      errorHandler(error, rollbar);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateTerritoryCode = async (event: FormEvent<HTMLElement>) => {
    event.preventDefault();
    const details = values as valuesDetails;
    const newTerritoryCode = `${details.code}`;
    setIsSaving(true);
    try {
      const newCodeRef = ref(
        database,
        `congregations/${code}/territories/${newTerritoryCode}`
      );
      const existingTerritory = await get(newCodeRef);
      if (existingTerritory.exists()) {
        alert(`Territory code, ${newTerritoryCode} already exist.`);
        return;
      }
      const oldCodeRef = ref(
        database,
        `congregations/${code}/territories/${selectedTerritoryCode}`
      );
      const oldTerritoryData = await get(oldCodeRef);
      await pollingVoidFunction(() => set(newCodeRef, oldTerritoryData.val()));
      await pollingVoidFunction(() => remove(oldCodeRef));
      toggleModal(ADMIN_MODAL_TYPES.UPDATE_TERRITORY_CODE);
      processSelectedTerritory(newTerritoryCode);
    } catch (error) {
      errorHandler(error, rollbar);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClickChangePostal = (postalcode: string) => {
    setValues({ ...values, postal: postalcode, newPostal: "" });
    toggleModal(ADMIN_MODAL_TYPES.UPDATE_POSTAL);
  };

  const handleUpdatePostalcode = async (event: FormEvent<HTMLElement>) => {
    event.preventDefault();
    const details = values as valuesDetails;
    const newPostalCode = `${details.newPostal}`;
    const oldPostalCode = `${details.postal}`;
    setIsSaving(true);
    try {
      const newPostalRef = ref(database, newPostalCode);
      const existingAddress = await get(newPostalRef);
      if (existingAddress.exists()) {
        alert(`Postal address, ${newPostalCode} already exist.`);
        return;
      }
      const oldPostalData = await get(ref(database, oldPostalCode));
      await pollingVoidFunction(() => set(newPostalRef, oldPostalData.val()));
      await pollingVoidFunction(() =>
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
      await pollingVoidFunction(() => deleteBlock(oldPostalCode, "", false));
      await toggleModal(ADMIN_MODAL_TYPES.UPDATE_POSTAL);
    } catch (error) {
      errorHandler(error, rollbar);
    } finally {
      setIsSaving(false);
    }
  };

  const refreshCongregationTerritory = async (selectTerritoryCode: string) => {
    if (!selectTerritoryCode) return;
    processSelectedTerritory(selectTerritoryCode);
  };

  const processPostalUnitNumber = async (
    postalCode: string,
    unitNumber: string,
    isDelete = false
  ) => {
    const blockAddresses = addressData.get(`${postalCode}`);
    if (!blockAddresses) return;

    if (!isDelete) {
      const existingUnitNo = await get(
        ref(
          database,
          `/${postalCode}/units/${blockAddresses.floors[0].floor}/${unitNumber}`
        )
      );
      if (existingUnitNo.exists()) {
        alert(`Unit number, ${unitNumber} already exist.`);
        return;
      }
    }

    const unitUpdates: unitMaps = {};
    const lastSequenceNo = blockAddresses.floors[0].units.length + 1;
    for (const index in blockAddresses.floors) {
      const floorDetails = blockAddresses.floors[index];
      floorDetails.units.forEach(() => {
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
              languages: "",
              sequence: lastSequenceNo
            };
      });
    }
    setIsSaving(true);
    try {
      await pollingVoidFunction(() => update(ref(database), unitUpdates));
    } catch (error) {
      errorHandler(error, rollbar);
    } finally {
      setIsSaving(false);
    }
  };

  const processPostalUnitSequence = async (
    postalCode: string,
    unitNumber: string,
    sequence: number | undefined
  ) => {
    const blockAddresses = addressData.get(`${postalCode}`);
    if (!blockAddresses) return;

    const unitUpdates: unitMaps = {};
    for (const index in blockAddresses.floors) {
      const floorDetails = blockAddresses.floors[index];
      floorDetails.units.forEach(() => {
        unitUpdates[
          `/${postalCode}/units/${floorDetails.floor}/${unitNumber}/sequence`
        ] = sequence === undefined ? {} : sequence;
      });
    }
    setIsSaving(true);
    try {
      await pollingVoidFunction(() => update(ref(database), unitUpdates));
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
    const newPostalCode = details.newPostal || "";
    const noOfFloors = details.floors || 1;
    const unitSequence = details.units || "";
    const newPostalName = details.name;
    const addressType = Number(details.type);

    if (!isValidPostal(`${newPostalCode}`)) {
      alert("Invalid postal code");
      return;
    }

    if (!isValidPostalSequence(unitSequence, addressType)) {
      alert("Invalid sequence");
      return;
    }

    // Add empty details for 0 floor
    const floorDetails = [{}];
    const units = unitSequence.split(",");
    for (let i = 0; i < noOfFloors; i++) {
      const floorMap = {} as unitMaps;
      units.forEach((unitNo, index) => {
        const processedUnitNumber = processPropertyNumber(unitNo, addressType);
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
      const addressReference = ref(database, `${newPostalCode}`);
      const existingAddress = await get(addressReference);
      if (existingAddress.exists()) {
        alert(`Postal address, ${newPostalCode} already exist.`);
        return;
      }
      await pollingVoidFunction(() =>
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
      await pollingVoidFunction(() =>
        set(addressReference, {
          name: newPostalName,
          feedback: "",
          units: floorDetails,
          type: addressType
        })
      );
      let createdMsg = `Created postal address, ${newPostalCode}.`;
      if (addressType === TERRITORY_TYPES.PRIVATE)
        createdMsg = `Created private estate, ${newPostalName}`;
      alert(createdMsg);
      await refreshCongregationTerritory(`${selectedTerritoryCode}`);
      if (addressType === TERRITORY_TYPES.PUBLIC)
        toggleModal(ADMIN_MODAL_TYPES.CREATE_PUBLIC_ADDRESS);

      if (addressType === TERRITORY_TYPES.PRIVATE)
        toggleModal(ADMIN_MODAL_TYPES.CREATE_PRIVATE_ADDRESS);
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
      const existingTerritory = await pollingQueryFunction(() =>
        get(territoryCodeReference)
      );
      if (existingTerritory.exists()) {
        alert(`Territory code, ${newTerritoryCode} already exist.`);
        return;
      }
      await pollingVoidFunction(() =>
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
    setIsSaving(true);
    try {
      new URL(link);
    } catch (err) {
      alert(`Invalid territory slip link.`);
      return;
    } finally {
      setIsSaving(false);
    }
    try {
      const linkId = link.substring(link.lastIndexOf("/") + 1);
      await pollingVoidFunction(() => remove(ref(database, `links/${linkId}`)));
      rollbar.info(`Publisher slip has been revoked! Link: ${link}`);
      alert(`Revoked territory link token, ${linkId}.`);
    } catch (error) {
      errorHandler(error, rollbar);
      return;
    } finally {
      setIsSaving(false);
    }
    toggleModal(ADMIN_MODAL_TYPES.LINK);
  };

  const handleChangePassword = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();
    const newPassword = event.currentTarget.password.value;
    try {
      setIsSaving(true);
      await updatePassword(user, newPassword);
      rollbar.info(
        `User updated password! Email: ${user.email}, Name: ${user.displayName}`
      );
      alert("Password updated.");
    } catch (error) {
      errorHandler(error, rollbar);
      return;
    } finally {
      setIsSaving(false);
    }
    toggleModal(ADMIN_MODAL_TYPES.CHANGE_PASSWORD);
  };

  const onFormChange = (e: ChangeEvent<HTMLElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    setValues({ ...values, [name]: value });
  };

  const shareTimedLink = async (
    linktype: number,
    postalcode: string,
    postalname: string,
    linkId: string,
    title: string,
    body: string,
    url: string,
    hours: number
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
        await setTimedLink(linktype, postalcode, postalname, linkId, hours);
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

  const processCongregationTerritories = (snapshot: DataSnapshot) => {
    if (!snapshot) return;
    const data = snapshot.val();
    if (!data) return;
    document.title = `${data["name"]}`;
    const congregationTerritories = data["territories"];
    const territoryList = new Map<string, territoryDetails>();
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
  const specialShareTimedLink = async (
    linktype: number,
    postalcode: string,
    name: string,
    linkId: string,
    hours = DEFAULT_SELF_DESTRUCT_HOURS
  ) => {
    if (navigator.share) {
      if (linktype === LINK_TYPES.PERSONAL) {
        setIsSettingPersonalLink(true);
        try {
          await setTimedLink(linktype, postalcode, name, linkId, hours);
          await navigator.share({
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
        return;
      }
      confirmAlert({
        customUI: ({ onClose }) => {
          return (
            <Container>
              <Card bg="Light" className="text-center">
                <Card.Header>
                  Confirmation on assignment for {name} ✅
                </Card.Header>
                <Card.Body>
                  <Card.Title>Do you want to proceed ?</Card.Title>
                  <Button
                    className="m-1"
                    variant="primary"
                    onClick={async () => {
                      onClose();
                      setSelectedPostal(postalcode);
                      setIsSettingAssignLink(true);
                      await setTimedLink(
                        linktype,
                        postalcode,
                        name,
                        linkId,
                        hours
                      );

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

  const handleTerritorySelect = useCallback(
    (eventKey: string | null) => {
      processSelectedTerritory(`${eventKey}`);
      toggleTerritoryListing();
    },
    // Reset cache when the territory dropdown is selected
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [showTerritoryListing]
  );

  const toggleTerritoryListing = useCallback(() => {
    setShowTerritoryListing(!showTerritoryListing);
  }, [showTerritoryListing]);

  const handleAddressTerritorySelect = useCallback(
    async (newTerritoryCode: string | null) => {
      const details = values as valuesDetails;
      const selectedPostalcode = `${details.postal}`;
      await pollingVoidFunction(() =>
        set(
          push(
            ref(
              database,
              `congregations/${code}/territories/${`${newTerritoryCode}`}/addresses`
            )
          ),
          selectedPostalcode
        )
      );
      await deleteTerritoryAddress(
        `${selectedTerritoryCode}`,
        selectedPostalcode
      );
      toggleAddressTerritoryListing();
      await refreshCongregationTerritory(`${selectedTerritoryCode}`);
      alert(
        `Changed territory of ${selectedPostalcode} from ${selectedTerritoryCode} to ${newTerritoryCode}.`
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [showChangeAddressTerritory]
  );

  const toggleAddressTerritoryListing = useCallback(() => {
    setShowChangeAddressTerritory(!showChangeAddressTerritory);
  }, [showChangeAddressTerritory]);

  const congregationTerritoryList = useMemo(
    () => Array.from(territories.values()),
    [territories]
  );

  const getTerritoryAddressData = (
    addresses: Map<string, addressDetails>,
    policy: Policy
  ) => {
    const unitLengths = new Map();
    const completedPercents = new Map();
    let totalPercent = 0;

    addresses.forEach((address) => {
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
        setPolicy(new LanguagePolicy(await user.getIdTokenResult(true)));
      }
    });
    checkTraceRaceStatus(`${code}`).then(async (snapshot) => {
      const isTrackRace = snapshot.val();
      setTrackRace(isTrackRace);
      if (isTrackRace) {
        setPolicy(new RacePolicy(await user.getIdTokenResult(true)));
      }
    });
    checkCongregationExpireHours(`${code}`).then((snapshot) => {
      if (!snapshot.exists()) return;
      setDefaultExpiryHours(snapshot.val());
    });
    // Huawei is considered special due to its unusual behaviour in their OS native share functionality.
    setIsSpecialDevice(getUA().device.vendor === UA_DEVICE_MAKES.HUAWEI);

    const congregationReference = child(ref(database), `congregations/${code}`);
    const pollerId = SetPollerInterval();
    onValue(
      congregationReference,
      (snapshot) => {
        clearInterval(pollerId);
        setIsLoading(false);
        if (snapshot.exists()) {
          processCongregationTerritories(snapshot);
        }
      },
      (reason) => {
        clearInterval(pollerId);
        setIsLoading(false);
        errorHandler(reason, rollbar, false);
      }
    );

    const linksReference = query(
      ref(database, "links"),
      orderByChild("userId"),
      equalTo(user.uid)
    );

    const linkPollerId = SetPollerInterval();
    onValue(
      linksReference,
      (snapshot) => {
        clearInterval(linkPollerId);
        const linkListing = new Array<LinkSession>();
        if (snapshot.exists()) {
          const linkData = snapshot.val();
          for (const linkId in linkData) {
            linkListing.push(new LinkSession(linkData[linkId], linkId));
          }
        }
        setAssignments(linkListing);
      },
      (reason) => {
        clearInterval(linkPollerId);
        errorHandler(reason, rollbar, false);
      }
    );

    let currentTime = new Date().getTime();

    const setActivityTime = () => {
      currentTime = new Date().getTime();
    };

    const refreshPage = () => {
      const inactivityPeriod = new Date().getTime() - currentTime;
      if (inactivityPeriod >= RELOAD_INACTIVITY_DURATION) {
        window.location.reload();
      } else {
        setTimeout(refreshPage, RELOAD_CHECK_INTERVAL_MS);
      }
    };

    document.body.addEventListener("mousemove", setActivityTime);
    document.body.addEventListener("keypress", setActivityTime);
    document.body.addEventListener("touchstart", setActivityTime);
    window.addEventListener("scroll", () => {
      setShowBkTopButton(window.scrollY > PIXELS_TILL_BK_TO_TOP_BUTTON_DISPLAY);
    });

    setTimeout(refreshPage, RELOAD_CHECK_INTERVAL_MS);
  }, [user, code, rollbar]);

  const territoryAddressData = useMemo(
    () => getTerritoryAddressData(addressData, policy as Policy),
    [addressData, policy]
  );

  if (isLoading) return <Loader />;
  if (isUnauthorised)
    return (
      <UnauthorizedPage handleClick={logoutUser} name={`${user.displayName}`} />
    );
  const isDataCompletelyFetched = addressData.size === sortedAddressList.length;
  const isAdmin = userAccessLevel === USER_ACCESS_LEVELS.TERRITORY_SERVANT;
  const isReadonly = userAccessLevel === USER_ACCESS_LEVELS.READ_ONLY;

  return (
    <Fade appear={true} in={true}>
      <>
        <EnvironmentIndicator />
        <TerritoryListing
          showListing={showTerritoryListing}
          territories={congregationTerritoryList}
          selectedTerritory={selectedTerritoryCode}
          hideFunction={toggleTerritoryListing}
          handleSelect={handleTerritorySelect}
        />
        <TerritoryListing
          showListing={showChangeAddressTerritory}
          territories={congregationTerritoryList}
          selectedTerritory={selectedTerritoryCode}
          hideFunction={toggleAddressTerritoryListing}
          handleSelect={handleAddressTerritorySelect}
          hideSelectedTerritory={true}
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
                    {selectedTerritoryCode ? (
                      <>
                        <AggregationBadge
                          isDataFetched={isDataCompletelyFetched}
                          aggregate={territoryAddressData.aggregate}
                        />
                        {selectedTerritoryCode}
                      </>
                    ) : (
                      "Select Territory"
                    )}
                  </Button>
                )}
              {!selectedTerritoryCode && (
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
              {selectedTerritoryCode && (
                <ComponentAuthorizer
                  requiredPermission={USER_ACCESS_LEVELS.TERRITORY_SERVANT}
                  userPermission={userAccessLevel}
                >
                  <DropdownButton
                    className="dropdown-btn"
                    variant="outline-primary"
                    size="sm"
                    title="Territory"
                  >
                    <Dropdown.Item
                      onClick={() => {
                        setValues({ ...values, name: "", code: "" });
                        toggleModal(ADMIN_MODAL_TYPES.CREATE_TERRITORY);
                      }}
                    >
                      Create New
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => {
                        setValues({ ...values, code: "" });
                        toggleModal(ADMIN_MODAL_TYPES.UPDATE_TERRITORY_CODE);
                      }}
                    >
                      Change Code
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
                                    <Card.Title>Are You Very Sure ?</Card.Title>
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
                                    <Card.Title>Are You Very Sure ?</Card.Title>
                                    <Card.Text>
                                      <p>
                                        This action will reset the status of all
                                        addresses in the territory,{" "}
                                        {selectedTerritoryCode} -{" "}
                                        {selectedTerritoryName}.
                                      </p>
                                      <p>
                                        Certain statuses such as DNC and Invalid
                                        will not be affected.
                                      </p>
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
                        })
                      }
                    >
                      Reset status
                    </Dropdown.Item>
                  </DropdownButton>
                </ComponentAuthorizer>
              )}
              {selectedTerritoryCode && (
                <ComponentAuthorizer
                  requiredPermission={USER_ACCESS_LEVELS.TERRITORY_SERVANT}
                  userPermission={userAccessLevel}
                >
                  <DropdownButton
                    className="dropdown-btn"
                    variant="outline-primary"
                    size="sm"
                    title="New Address"
                    align="end"
                  >
                    <Dropdown.Item
                      onClick={() => {
                        setValues({
                          ...values,
                          name: "",
                          units: "",
                          floors: 1,
                          newPostal: "",
                          type: TERRITORY_TYPES.PUBLIC
                        });
                        toggleModal(ADMIN_MODAL_TYPES.CREATE_PUBLIC_ADDRESS);
                      }}
                    >
                      Public
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => {
                        setValues({
                          ...values,
                          name: "",
                          units: "",
                          floors: 1,
                          newPostal: "",
                          type: TERRITORY_TYPES.PRIVATE
                        });
                        toggleModal(ADMIN_MODAL_TYPES.CREATE_PRIVATE_ADDRESS);
                      }}
                    >
                      Private
                    </Dropdown.Item>
                  </DropdownButton>
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
              <DropdownButton
                className="dropdown-btn"
                size="sm"
                variant="outline-primary"
                title="Account"
                align="end"
              >
                <Dropdown.Item
                  onClick={() => toggleModal(ADMIN_MODAL_TYPES.PROFILE)}
                >
                  Profile
                </Dropdown.Item>
                {assignments && assignments.length > 0 && (
                  <Dropdown.Item
                    onClick={() => toggleModal(ADMIN_MODAL_TYPES.ASSIGNMENTS)}
                  >
                    Assignments
                  </Dropdown.Item>
                )}
                <Dropdown.Item
                  onClick={() => {
                    setIsChangePasswordOk(false);
                    setValues({ ...values, password: "", cpassword: "" });
                    toggleModal(ADMIN_MODAL_TYPES.CHANGE_PASSWORD);
                  }}
                >
                  Change Password
                </Dropdown.Item>
                <Dropdown.Item onClick={logoutUser}>Logout</Dropdown.Item>
              </DropdownButton>
            </Navbar.Collapse>
          </Container>
        </Navbar>
        {!selectedTerritoryCode && <Welcome name={`${user.displayName}`} />}
        <TerritoryHeader name={selectedTerritoryName} />
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
                  <span className="fluid-bolding fluid-text">
                    {currentPostalname}
                  </span>
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
                          <Button
                            key={`assigndrop-${currentPostalcode}`}
                            size="sm"
                            variant="outline-primary"
                            onClick={() =>
                              handleClickPersonalSlip(
                                currentPostalcode,
                                currentPostalname,
                                addressLinkId
                              )
                            }
                          >
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
                          </Button>
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
                              onClick={() => {
                                if (isSpecialDevice) {
                                  specialShareTimedLink(
                                    LINK_TYPES.ASSIGNMENT,
                                    currentPostalcode,
                                    currentPostalname,
                                    addressLinkId,
                                    defaultExpiryHours
                                  );
                                  return;
                                }
                                shareTimedLink(
                                  LINK_TYPES.ASSIGNMENT,
                                  currentPostalcode,
                                  currentPostalname,
                                  addressLinkId,
                                  `Units for ${currentPostalname}`,
                                  assignmentMessage(currentPostalname),
                                  `${domain}/${currentPostalcode}/${code}/${addressLinkId}`,
                                  defaultExpiryHours
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
                                  const territoryWindow = window.open("");
                                  if (territoryWindow) {
                                    territoryWindow.document.body.innerHTML =
                                      TERRITORY_VIEW_WINDOW_WELCOME_TEXT;
                                  }
                                  await setTimedLink(
                                    LINK_TYPES.VIEW,
                                    currentPostalcode,
                                    currentPostalname,
                                    addressLinkId,
                                    defaultExpiryHours
                                  );
                                  if (territoryWindow) {
                                    territoryWindow.location.href = `${domain}/${currentPostalcode}/${code}/${addressLinkId}`;
                                  }
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
                          onClick={() => {
                            window.open(
                              `http://maps.google.com.sg/maps?q=${zipcode}`
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
                              currentPostalname,
                              addressElement.feedback
                            );
                          }}
                        >
                          <span
                            className={
                              addressElement.feedback ? "blinking" : ""
                            }
                          >
                            Feedback
                          </span>
                        </Button>
                        <InstructionsButton
                          instructions={addressElement.instructions}
                          handleSave={(event) => {
                            handleClickInstructions(
                              event,
                              currentPostalcode,
                              currentPostalname,
                              addressElement.instructions
                            );
                          }}
                          userAcl={userAccessLevel}
                        />
                        <ComponentAuthorizer
                          requiredPermission={
                            USER_ACCESS_LEVELS.TERRITORY_SERVANT
                          }
                          userPermission={userAccessLevel}
                        >
                          <DropdownButton
                            className="dropdown-btn"
                            align="end"
                            variant="outline-primary"
                            size="sm"
                            title="Address"
                          >
                            <Dropdown.Item
                              onClick={() => {
                                handleClickChangePostal(currentPostalcode);
                              }}
                            >
                              Change Postal Code
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() => {
                                setValues({
                                  ...values,
                                  postal: currentPostalcode
                                });
                                toggleAddressTerritoryListing();
                              }}
                            >
                              Change Territory
                            </Dropdown.Item>
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
                              Add{" "}
                              {addressElement.type === TERRITORY_TYPES.PRIVATE
                                ? "Property"
                                : "Unit"}{" "}
                              No.
                            </Dropdown.Item>
                            {(!addressElement.type ||
                              addressElement.type ===
                                TERRITORY_TYPES.PUBLIC) && (
                              <Dropdown.Item
                                onClick={() => {
                                  addFloorToBlock(currentPostalcode);
                                }}
                              >
                                Add Higher Floor
                              </Dropdown.Item>
                            )}
                            {(!addressElement.type ||
                              addressElement.type ===
                                TERRITORY_TYPES.PUBLIC) && (
                              <Dropdown.Item
                                onClick={() => {
                                  addFloorToBlock(currentPostalcode, true);
                                }}
                              >
                                Add Lower Floor
                              </Dropdown.Item>
                            )}
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
                                          <Card.Header>Warning ⚠️</Card.Header>
                                          <Card.Body>
                                            <Card.Title>
                                              Are You Very Sure ?
                                            </Card.Title>
                                            <Card.Text>
                                              <p>
                                                This action will reset all
                                                property status of{" "}
                                                {currentPostalname}.
                                              </p>
                                              <p>
                                                Certain statuses such as DNC and
                                                Invalid will not be affected.
                                              </p>
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
                                          <Card.Header>Warning ⚠️</Card.Header>
                                          <Card.Body>
                                            <Card.Title>
                                              Are You Very Sure ?
                                            </Card.Title>
                                            <Card.Text>
                                              The action will completely delete,{" "}
                                              {currentPostalname}.
                                            </Card.Text>
                                            <Button
                                              className="m-1"
                                              variant="primary"
                                              onClick={() => {
                                                deleteBlock(
                                                  currentPostalcode,
                                                  currentPostalname,
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
                                })
                              }
                            >
                              Delete
                            </Dropdown.Item>
                          </DropdownButton>
                        </ComponentAuthorizer>
                      </Container>
                    </Navbar>
                    <AdminTable
                      floors={addressElement.floors}
                      maxUnitNumberLength={maxUnitNumberLength}
                      policy={policy}
                      completedPercent={completedPercent}
                      trackRace={trackRace}
                      trackLanguages={trackLanguages}
                      postalCode={`${currentPostalcode}`}
                      territoryType={addressElement.type}
                      userAccessLevel={userAccessLevel}
                      handleUnitStatusUpdate={(event) => {
                        const {
                          floor,
                          unitno,
                          hhtype,
                          hhnote,
                          hhstatus,
                          nhcount,
                          languages,
                          dnctime,
                          sequence
                        } = event.currentTarget.dataset;
                        handleClickModal(
                          event,
                          currentPostalcode,
                          floor || "",
                          addressElement.floors,
                          unitno || "",
                          hhtype || "",
                          hhnote || "",
                          hhstatus || "",
                          nhcount || "",
                          languages || "",
                          dnctime,
                          maxUnitNumberLength,
                          sequence,
                          currentPostalname,
                          addressElement.type
                        );
                      }}
                      adminUnitHeaderStyle={`${
                        isAdmin ? "admin-unit-header " : ""
                      }`}
                      handleUnitNoUpdate={(event) => {
                        const { sequence, unitno, length } =
                          event.currentTarget.dataset;
                        if (!isAdmin) return;
                        handleClickUpdateUnit(
                          currentPostalcode,
                          Number(length),
                          sequence === undefined ? undefined : Number(sequence),
                          unitno || "",
                          maxUnitNumberLength,
                          addressElement.type
                        );
                      }}
                      handleFloorDelete={(event) => {
                        const { floor } = event.currentTarget.dataset;
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
                                <Card bg="warning" className="text-center">
                                  <Card.Header>Warning ⚠️</Card.Header>
                                  <Card.Body>
                                    <Card.Title>Are You Very Sure ?</Card.Title>
                                    <Card.Text>
                                      This action will delete floor {`${floor}`}{" "}
                                      of {currentPostalcode}.
                                    </Card.Text>
                                    <Button
                                      className="m-1"
                                      variant="primary"
                                      onClick={() => {
                                        deleteBlockFloor(
                                          currentPostalcode,
                                          `${floor}`
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
                    ></AdminTable>
                  </div>
                </Accordion.Body>
              </Accordion.Item>
            );
          })}
        </Accordion>
        <BackToTopButton showButton={showBkTopButton} />
        {isAdmin && (
          <Modal show={isTerritoryRename}>
            <Modal.Header>
              <Modal.Title>Change Territory Name</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleUpdateTerritoryName}>
              <Modal.Body>
                <GenericInputField
                  label="Name"
                  name="name"
                  handleChange={onFormChange}
                  changeValue={`${(values as valuesDetails).name}`}
                  required={true}
                />
              </Modal.Body>
              <ModalFooter
                handleClick={() =>
                  toggleModal(ADMIN_MODAL_TYPES.RENAME_TERRITORY)
                }
                userAccessLevel={userAccessLevel}
                isSaving={isSaving}
              />
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
              <Modal.Footer className="justify-content-around">
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
                <ModalSubmitButton isSaving={isSaving} btnLabel="Revoke" />
              </Modal.Footer>
            </Form>
          </Modal>
        )}
        {isAdmin && (
          <Modal show={isChangeTerritoryCode}>
            <Modal.Header>
              <Modal.Title>Change territory code</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleUpdateTerritoryCode}>
              <Modal.Body>
                <Form.Group className="mb-3">
                  <Form.Label htmlFor="userid">
                    Existing Territory Code
                  </Form.Label>
                  <Form.Control
                    readOnly
                    id="existingcode"
                    defaultValue={`${selectedTerritoryCode}`}
                  />
                </Form.Group>
                <GenericInputField
                  label="New Territory Code"
                  name="code"
                  handleChange={(e: ChangeEvent<HTMLElement>) => {
                    const { value } = e.target as HTMLInputElement;
                    setValues({ ...values, code: value });
                  }}
                  changeValue={`${(values as valuesDetails).code}`}
                  required={true}
                  placeholder={"Territory code. For eg, M01, W12, etc."}
                />
              </Modal.Body>
              <ModalFooter
                handleClick={() =>
                  toggleModal(ADMIN_MODAL_TYPES.UPDATE_TERRITORY_CODE)
                }
                userAccessLevel={userAccessLevel}
                isSaving={isSaving}
                submitLabel="Change"
              />
            </Form>
          </Modal>
        )}
        {isAdmin && (
          <Modal show={isChangePostal}>
            <Modal.Header>
              <Modal.Title>Change address postal code</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleUpdatePostalcode}>
              <Modal.Body>
                <Form.Group className="mb-3">
                  <Form.Label htmlFor="userid">Existing Postal Code</Form.Label>
                  <Form.Control
                    readOnly
                    id="existingcode"
                    defaultValue={`${(values as valuesDetails).postal}`}
                  />
                </Form.Group>
                <GenericInputField
                  inputType="number"
                  label="New Postal Code"
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
              </Modal.Body>
              <ModalFooter
                handleClick={() => toggleModal(ADMIN_MODAL_TYPES.UPDATE_POSTAL)}
                userAccessLevel={userAccessLevel}
                isSaving={isSaving}
                submitLabel="Change"
              />
            </Form>
          </Modal>
        )}
        {isAdmin && (
          <Modal show={isAddressRename}>
            <Modal.Header>
              <Modal.Title>Change Address Name</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleUpdateBlockName}>
              <Modal.Body>
                <GenericInputField
                  label="Name"
                  name="name"
                  handleChange={onFormChange}
                  changeValue={`${(values as valuesDetails).name}`}
                  required={true}
                />
              </Modal.Body>
              <ModalFooter
                handleClick={() =>
                  toggleModal(ADMIN_MODAL_TYPES.RENAME_ADDRESS_NAME)
                }
                userAccessLevel={userAccessLevel}
                isSaving={isSaving}
              />
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
                <GenericInputField
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
                <GenericInputField
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
              <ModalFooter
                handleClick={() =>
                  toggleModal(ADMIN_MODAL_TYPES.CREATE_TERRITORY)
                }
                userAccessLevel={userAccessLevel}
                isSaving={isSaving}
              />
            </Form>
          </Modal>
        )}
        {isAdmin && (
          <Modal show={isCreatePublic}>
            <Modal.Header>
              <Modal.Title>Create Public Address</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleCreateTerritoryAddress}>
              <Modal.Body>
                <p>
                  These are governmental owned residential properties that
                  usually consist of rental flats.
                </p>
                <GenericInputField
                  inputType="number"
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
                <GenericInputField
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
              <ModalFooter
                handleClick={() =>
                  toggleModal(ADMIN_MODAL_TYPES.CREATE_PUBLIC_ADDRESS)
                }
                userAccessLevel={userAccessLevel}
                isSaving={isSaving}
              />
            </Form>
          </Modal>
        )}
        {isAdmin && (
          <Modal show={isCreatePrivate}>
            <Modal.Header>
              <Modal.Title>Create Private Address</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleCreateTerritoryAddress}>
              <Modal.Body>
                <p>
                  These are non-governmental owned residential properties such
                  as terrace houses, semi-detached houses, bungalows or cluster
                  houses.
                </p>
                <GenericInputField
                  inputType="number"
                  label="Postal Code"
                  name="postalcode"
                  handleChange={(e: ChangeEvent<HTMLElement>) => {
                    const { value } = e.target as HTMLInputElement;
                    setValues({ ...values, newPostal: value });
                  }}
                  changeValue={`${(values as valuesDetails).newPostal}`}
                  required={true}
                  placeholder={"Estate postal code"}
                  information="A postal code within the private estate. This code will be used for locating the estate."
                />
                <GenericInputField
                  label="Address Name"
                  name="name"
                  handleChange={onFormChange}
                  changeValue={`${(values as valuesDetails).name}`}
                  required={true}
                  placeholder={"For eg, Sembawang Boulevard Crescent"}
                />
                <GenericTextAreaField
                  label="House Sequence"
                  name="units"
                  placeholder="House sequence with comma seperator. For eg, 1A,1B,2A ..."
                  handleChange={onFormChange}
                  changeValue={`${(values as valuesDetails).units}`}
                  required={true}
                />
              </Modal.Body>
              <ModalFooter
                handleClick={() =>
                  toggleModal(ADMIN_MODAL_TYPES.CREATE_PRIVATE_ADDRESS)
                }
                userAccessLevel={userAccessLevel}
                isSaving={isSaving}
              />
            </Form>
          </Modal>
        )}
        {isAdmin && (
          <Modal show={isNewUnit}>
            <Modal.Header>
              <Modal.Title>
                {`Add ${
                  (values as valuesDetails).territoryType ===
                  TERRITORY_TYPES.PRIVATE
                    ? "property"
                    : "unit"
                } to ${
                  (values as valuesDetails).territoryType ===
                  TERRITORY_TYPES.PRIVATE
                    ? (values as valuesDetails).name
                    : (values as valuesDetails).postal
                }`}
              </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleCreateNewUnit}>
              <Modal.Body>
                <GenericInputField
                  label={`${
                    (values as valuesDetails).territoryType ===
                    TERRITORY_TYPES.PRIVATE
                      ? "Property"
                      : "Unit"
                  } number`}
                  name="unit"
                  handleChange={(e: ChangeEvent<HTMLElement>) => {
                    const { value } = e.target as HTMLInputElement;
                    setValues({ ...values, unit: value });
                  }}
                  changeValue={`${(values as valuesDetails).unit}`}
                  required={true}
                />
              </Modal.Body>
              <ModalFooter
                handleClick={() => toggleModal(ADMIN_MODAL_TYPES.ADD_UNIT)}
                userAccessLevel={userAccessLevel}
                isSaving={isSaving}
              />
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
                <GenericInputField
                  inputType="number"
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
              <Modal.Footer className="justify-content-around">
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
        )}
        <Modal show={isFeedback}>
          <Modal.Header>
            <Modal.Title>{`Feedback on ${
              (values as valuesDetails).name
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
            propertyPostal={`${(values as valuesDetails).propertyPostal}`}
            floor={`${(values as valuesDetails).floorDisplay}`}
            postal={(values as valuesDetails).postal}
            type={(values as valuesDetails).territoryType}
            name={`${(values as valuesDetails).name}`}
          />
          <Form onSubmit={handleSubmitClick}>
            <Modal.Body>
              <HHStatusField
                handleGroupChange={(toggleValue) => {
                  let dnctime = null;
                  setIsNotHome(false);
                  setIsDnc(false);
                  if (toggleValue === STATUS_CODES.NOT_HOME) {
                    setIsNotHome(true);
                  } else if (toggleValue === STATUS_CODES.DO_NOT_CALL) {
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
                    handleGroupChange={(toggleValue) => {
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
              {(values as valuesDetails).territoryType ===
                TERRITORY_TYPES.PRIVATE && (
                <ComponentAuthorizer
                  requiredPermission={USER_ACCESS_LEVELS.TERRITORY_SERVANT}
                  userPermission={userAccessLevel}
                >
                  <>
                    <GenericInputField
                      inputType="number"
                      label="Territory Sequence"
                      name="sequence"
                      handleChange={onFormChange}
                      changeValue={`${(values as valuesDetails).sequence}`}
                    />
                    <GenericInputField
                      inputType="string"
                      label="Property Postal"
                      name="newPropertyPostal"
                      placeholder="Optional postal code for direction to this property"
                      handleChange={onFormChange}
                      changeValue={`${
                        (values as valuesDetails).newPropertyPostal
                      }`}
                    />
                  </>
                </ComponentAuthorizer>
              )}
            </Modal.Body>
            <ModalFooter
              propertyPostal={`${(values as valuesDetails).propertyPostal}`}
              handleClick={() => toggleModal(ADMIN_MODAL_TYPES.UNIT)}
              isSaving={isSaving}
              userAccessLevel={userAccessLevel}
              handleDelete={() => {
                toggleModal(ADMIN_MODAL_TYPES.UNIT);
                confirmAlert({
                  customUI: ({ onClose }) => {
                    return (
                      <Container>
                        <Card bg="warning" className="text-center">
                          <Card.Header>Warning ⚠️</Card.Header>
                          <Card.Body>
                            <Card.Title>Are You Very Sure ?</Card.Title>
                            <Card.Text>
                              This action will delete private property number{" "}
                              {(values as valuesDetails).unit} of{" "}
                              {(values as valuesDetails).name}.
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
              type={(values as valuesDetails).territoryType}
            />
          </Form>
        </Modal>
        <Modal show={isProfile}>
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
                  defaultValue={`${user.email}`}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label htmlFor="userid">Name</Form.Label>
                <Form.Control
                  readOnly
                  id="userid"
                  defaultValue={`${user.displayName}`}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label htmlFor="txtMaxTries">Max Tries</Form.Label>
                <Form.Control
                  readOnly
                  id="txtMaxTries"
                  defaultValue={`${policy?.getMaxTries()}`}
                />
                <Form.Text muted>
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
              <Form.Group className="mb-3">
                <Form.Label htmlFor="userid">Application Version</Form.Label>
                <Form.Control
                  readOnly
                  id="appversionno"
                  defaultValue={process.env.REACT_APP_VERSION}
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer className="justify-content-around">
              <Button
                variant="secondary"
                onClick={() => toggleModal(ADMIN_MODAL_TYPES.PROFILE)}
              >
                Close
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
        <Modal show={isChangePassword}>
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
                    setValues({
                      ...values,
                      password: value
                    });
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
                    setValues({
                      ...values,
                      cpassword: value
                    });
                  }}
                  required
                />
              </Form.Group>
              <PasswordChecklist
                rules={PASSWORD_POLICY}
                minLength={MINIMUM_PASSWORD_LENGTH}
                value={(values as valuesDetails).password || ""}
                valueAgain={(values as valuesDetails).cpassword || ""}
                onChange={(isValid) => setIsChangePasswordOk(isValid)}
              />
            </Modal.Body>
            <ModalFooter
              handleClick={() => toggleModal(ADMIN_MODAL_TYPES.CHANGE_PASSWORD)}
              userAccessLevel={userAccessLevel}
              isSaving={isSaving}
              disableSubmitBtn={!isChangePasswordOk}
            />
          </Form>
        </Modal>
        <Modal show={isInstructions}>
          <Modal.Header>
            <Modal.Title>{`Instructions on ${
              (values as valuesDetails).name
            }`}</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmitInstructions}>
            <Modal.Body>
              <GenericTextAreaField
                name="instructions"
                rows={5}
                handleChange={onFormChange}
                changeValue={`${(values as valuesDetails).instructions}`}
                readOnly={
                  userAccessLevel !== USER_ACCESS_LEVELS.TERRITORY_SERVANT
                }
              />
            </Modal.Body>
            <ModalFooter
              handleClick={() => toggleModal(ADMIN_MODAL_TYPES.INSTRUCTIONS)}
              userAccessLevel={userAccessLevel}
              requiredAcLForSave={USER_ACCESS_LEVELS.TERRITORY_SERVANT}
              isSaving={isSaving}
            />
          </Form>
        </Modal>
        <Modal show={isPersonalSlip}>
          <Modal.Header>
            <Modal.Title>{`Select personal slip expiry date for ${
              (values as valuesDetails).name
            }`}</Modal.Title>
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
                  setValues({ ...values, linkExpiryHrs: expiryInHours });
                }}
                className="w-100 mb-1"
              />
            </Modal.Body>
            <ModalFooter
              handleClick={() => toggleModal(ADMIN_MODAL_TYPES.PERSONAL_SLIP)}
              userAccessLevel={userAccessLevel}
              requiredAcLForSave={USER_ACCESS_LEVELS.TERRITORY_SERVANT}
              isSaving={isSaving}
              submitLabel="Assign"
            />
          </Form>
        </Modal>
        <Modal show={isAssignments && assignments.length > 0}>
          <Modal.Header>
            <Modal.Title>Assignments</Modal.Title>
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
                          target="blank"
                        >
                          {assignment.name}
                        </a>
                      </div>
                      <div className="fluid-text">
                        {LinkTypeDescription(assignment.linkType)}
                      </div>
                      <div className="fluid-text">
                        Created Dt:{" "}
                        {LinkDateFormatter.format(
                          new Date(assignment.tokenCreatetime)
                        )}
                      </div>
                      <div className="fluid-text">
                        Expiry Dt:{" "}
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
          <Modal.Footer className="justify-content-around">
            <Button
              variant="secondary"
              onClick={() => toggleModal(ADMIN_MODAL_TYPES.ASSIGNMENTS)}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    </Fade>
  );
}

export default Admin;
