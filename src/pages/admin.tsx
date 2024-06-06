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
  DataSnapshot,
  orderByChild,
  equalTo
} from "firebase/database";
import "../css/admin.css";
import { IdTokenResult, signOut } from "firebase/auth";
import { nanoid } from "nanoid";
import {
  useEffect,
  useState,
  useCallback,
  useMemo,
  lazy,
  useRef,
  MouseEvent
} from "react";
import {
  Accordion,
  Badge,
  Button,
  Card,
  Container,
  Dropdown,
  DropdownButton,
  Navbar,
  ProgressBar,
  Spinner,
  ButtonGroup
} from "react-bootstrap";
import { database, auth, functions } from "../firebase";
import { httpsCallable } from "firebase/functions";
import {
  valuesDetails,
  floorDetails,
  territoryDetails,
  addressDetails,
  adminProps,
  unitMaps,
  userDetails,
  OptionProps,
  CongregationAccessObject,
  DropDirections,
  DropDirection
} from "../utils/interface";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import InstructionsButton from "../components/form/instructions";
import "react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css";
import { useRollbar } from "@rollbar/react";
import { LinkSession, Policy } from "../utils/policies";
import AdminTable from "../components/table/admin";
import pollingQueryFunction from "../utils/helpers/pollingquery";
import processAddressData from "../utils/helpers/processadddata";
import processLinkDetails from "../utils/helpers/processlinkct";
import errorHandler from "../utils/helpers/errorhandler";
import ZeroPad from "../utils/helpers/zeropad";
import assignmentMessage from "../utils/helpers/assignmentmsg";
import getMaxUnitLength from "../utils/helpers/maxunitlength";
import getCompletedPercent from "../utils/helpers/getcompletedpercent";
import checkCongregationExpireHours from "../utils/helpers/checkcongexp";
import SetPollerInterval from "../utils/helpers/pollinginterval";
import pollingVoidFunction from "../utils/helpers/pollingvoid";
import processCompletedPercentage from "../utils/helpers/processcompletedpercent";
import checkCongregationMaxTries from "../utils/helpers/checkmaxtries";
import TerritoryListing from "../components/navigation/territorylist";
import UserListing from "../components/navigation/userlist";
import NavBarBranding from "../components/navigation/branding";
import AggregationBadge from "../components/navigation/aggrbadge";
import ComponentAuthorizer from "../components/navigation/authorizer";
import TerritoryHeader from "../components/navigation/territoryheader";
import BackToTopButton from "../components/navigation/backtotop";
import HelpButton from "../components/navigation/help";
import Loader from "../components/statics/loader";
import Welcome from "../components/statics/welcome";
import {
  STATUS_CODES,
  NOT_HOME_STATUS_CODES,
  MUTABLE_CODES,
  DEFAULT_FLOOR_PADDING,
  DEFAULT_SELF_DESTRUCT_HOURS,
  LINK_TYPES,
  UNSUPPORTED_BROWSER_MSG,
  RELOAD_INACTIVITY_DURATION,
  RELOAD_CHECK_INTERVAL_MS,
  USER_ACCESS_LEVELS,
  TERRITORY_VIEW_WINDOW_WELCOME_TEXT,
  PIXELS_TILL_BK_TO_TOP_BUTTON_DISPLAY,
  TERRITORY_TYPES,
  WIKI_CATEGORIES,
  DEFAULT_CONGREGATION_MAX_TRIES,
  DEFAULT_CONGREGATION_OPTION_IS_MULTIPLE,
  DEFAULT_MAP_DIRECTION_CONGREGATION_LOCATION
} from "../utils/constants";
import ModalManager from "@ebay/nice-modal-react";
import SuspenseComponent from "../components/utils/suspense";
import getOptions from "../utils/helpers/getcongoptions";
import GetDirection from "../utils/helpers/directiongenerator";
import getOptionIsMultiSelect from "../utils/helpers/getoptionmultiselect";
import getCongregationOrigin from "../utils/helpers/getcongorigin";
import useLocalStorage from "../utils/helpers/storage";
import CongListing from "../components/navigation/conglist";
import getCongregationDetails from "../utils/helpers/getcongdetails";
import setLink from "../utils/helpers/setlink";
import getTerritoryData from "../utils/helpers/getterritorydetails";

const UnauthorizedPage = SuspenseComponent(
  lazy(() => import("../components/statics/unauth"))
);
const UpdateUser = lazy(() => import("../components/modal/updateuser"));
const UpdateUnitStatus = lazy(() => import("../components/modal/updatestatus"));
const UpdateUnit = lazy(() => import("../components/modal/updateunit"));
const ConfirmSlipDetails = lazy(
  () => import("../components/modal/slipdetails")
);
const UpdateCongregationSettings = lazy(
  () => import("../components/modal/congsettings")
);
const UpdateCongregationOptions = lazy(
  () => import("../components/modal/congoptions")
);
const UpdateAddressInstructions = lazy(
  () => import("../components/modal/instructions")
);
const UpdateAddressFeedback = lazy(
  () => import("../components/modal/updateaddfeedback")
);
const NewUnit = lazy(() => import("../components/modal/newunit"));
const NewTerritoryCode = lazy(
  () => import("../components/modal/newterritorycd")
);
const NewPublicAddress = lazy(() => import("../components/modal/newpublicadd"));
const NewPrivateAddress = lazy(
  () => import("../components/modal/newprivateadd")
);
const InviteUser = lazy(() => import("../components/modal/inviteuser"));
const GetProfile = lazy(() => import("../components/modal/profile"));
const GetAssignments = lazy(() => import("../components/modal/assignments"));
const ChangeTerritoryName = lazy(
  () => import("../components/modal/changeterritoryname")
);
const ChangeTerritoryCode = lazy(
  () => import("../components/modal/changeterritorycd")
);
const ChangePassword = lazy(() => import("../components/modal/changepassword"));
const ChangeAddressPostalCode = lazy(
  () => import("../components/modal/changepostalcd")
);
const ChangeAddressGeoLocation = lazy(
  () => import("../components/modal/changegeolocation")
);
const ChangeAddressName = lazy(
  () => import("../components/modal/changeaddname")
);

function Admin({ user }: adminProps) {
  const [code, setCode] = useState<string>("");
  const [isSettingPersonalLink, setIsSettingPersonalLink] =
    useState<boolean>(false);
  const [isSettingAssignLink, setIsSettingAssignLink] =
    useState<boolean>(false);
  const [selectedPostal, setSelectedPostal] = useState<string>();
  const [isSettingViewLink, setIsSettingViewLink] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUnauthorised, setIsUnauthorised] = useState<boolean>(false);
  const [showBkTopButton, setShowBkTopButton] = useState(false);
  const [showTerritoryListing, setShowTerritoryListing] =
    useState<boolean>(false);
  const [showUserListing, setShowUserListing] = useState<boolean>(false);
  const [showCongregationListing, setShowCongregationListing] =
    useState<boolean>(false);
  const [isShowingUserListing, setIsShowingUserListing] =
    useState<boolean>(false);
  const [congUsers, setCongUsers] = useState(new Map<string, userDetails>());
  const [showChangeAddressTerritory, setShowChangeAddressTerritory] =
    useState<boolean>(false);
  const [name, setName] = useState<string>("");
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
  const [userAccessLevel, setUserAccessLevel] = useState<number>();
  const [defaultExpiryHours, setDefaultExpiryHours] = useState<number>(
    DEFAULT_SELF_DESTRUCT_HOURS
  );
  const [policy, setPolicy] = useState<Policy>(new Policy());
  const [options, setOptions] = useState<Array<OptionProps>>([]);
  const [isAssignmentLoading, setIsAssignmentLoading] =
    useState<boolean>(false);
  const [userCongregationAccesses, setUserCongregationAccesses] = useState<
    CongregationAccessObject[]
  >([]);
  const [dropDirections, setDropDirections] = useState<DropDirections>({});
  const rollbar = useRollbar();
  const unsubscribers = useRef<Array<Unsubscribe>>([]);
  const congregationAccess = useRef<Record<string, number>>({});
  const loginUserClaims = useRef<IdTokenResult>();
  const currentTime = useRef<number>(new Date().getTime());

  const [congregationCode, setCongregationCode] = useLocalStorage(
    "congregationCode",
    ""
  );

  const handleDropdownDirection = (
    event: MouseEvent<HTMLElement, globalThis.MouseEvent>,
    dropdownId: string
  ) => {
    const clickPositionY = event.clientY;
    const dropdownHeight = 300;
    const windowInnerHeight = window.innerHeight;

    let dropdownDirection: DropDirection = "down";
    if (windowInnerHeight - clickPositionY < dropdownHeight) {
      dropdownDirection = "up";
    }
    setDropDirections((prev) => ({ ...prev, [dropdownId]: dropdownDirection }));
  };

  const refreshAddressState = () => {
    unsubscribers.current.forEach((unsubFunction) => {
      unsubFunction();
    });
    setAddressData(new Map<string, addressDetails>());
  };

  const getUsers = useCallback(async () => {
    const getCongregationUsers = httpsCallable(
      functions,
      "getCongregationUsersV2"
    );
    try {
      setIsShowingUserListing(true);
      const result = (await getCongregationUsers({
        congregation: code
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      })) as any;
      if (Object.keys(result.data).length === 0) {
        alert("There are no users to manage.");
        return;
      }
      const userListing = new Map<string, userDetails>();
      for (const key in result.data) {
        const data = result.data[key];
        userListing.set(key, {
          uid: key,
          name: data.name,
          verified: data.verified,
          email: data.email,
          role: data.role
        });
      }
      setCongUsers(userListing);
      toggleUserListing();
    } catch (error) {
      errorHandler(error, rollbar);
    } finally {
      setIsShowingUserListing(false);
    }
  }, [code]);

  const logoutUser = useCallback(async () => {
    refreshAddressState();
    await signOut(auth);
  }, []);

  const processSelectedTerritory = async (selectedTerritoryCode: string) => {
    try {
      const { territoryAddsResult, territoryNameResult } =
        await getTerritoryData(code, selectedTerritoryCode);

      setSelectedTerritoryCode(selectedTerritoryCode);
      setSelectedTerritoryName(territoryNameResult.val());

      refreshAddressState();
      unsubscribers.current = [] as Array<Unsubscribe>;

      const detailsListing = getDetailsListing(territoryAddsResult);
      setSortedAddressList(detailsListing);

      const pollerId = SetPollerInterval();

      await processDetailsListing(detailsListing, pollerId);
    } catch (error) {
      console.error("Error processing selected territory: ", error);
      errorHandler(error, rollbar);
    }
  };

  const getDetailsListing = (territoryAddsResult: DataSnapshot) => {
    const detailsListing = [] as Array<territoryDetails>;
    territoryAddsResult.forEach((addElement: DataSnapshot) => {
      detailsListing.push({
        code: addElement.val(),
        name: "",
        addresses: ""
      });
      return false;
    });
    return detailsListing;
  };

  const processDetailsListing = async (
    detailsListing: Array<territoryDetails>,
    pollerId: NodeJS.Timeout
  ) => {
    for (const details of detailsListing) {
      const postalCode = details.code;
      setAccordionKeys((existingKeys) => [...existingKeys, postalCode]);
      unsubscribers.current.push(
        onValue(
          child(ref(database), `addresses/${code}/${postalCode}`),
          async (snapshot) => {
            clearInterval(pollerId);
            if (snapshot.exists()) {
              const addressData = await getAddressData(
                code,
                postalCode,
                snapshot.val()
              );
              setAddressData(
                (existingAddresses) =>
                  new Map<string, addressDetails>(
                    existingAddresses.set(postalCode, addressData)
                  )
              );
            }
          }
        )
      );
    }
  };

  const getAddressData = async (
    code: string,
    postalCode: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    postalSnapshot: any
  ) => {
    const floorData = await processAddressData(
      code,
      postalCode,
      postalSnapshot.units
    );
    const linkDetails = await processLinkDetails(code, postalCode);
    return {
      assigneeDetailsList: linkDetails.assigneeDetailsList,
      personalDetailsList: linkDetails.personalDetailsList,
      name: postalSnapshot.name,
      postalCode: postalCode,
      floors: floorData,
      feedback: postalSnapshot.feedback,
      type: postalSnapshot.type,
      instructions: postalSnapshot.instructions,
      location: postalSnapshot.location,
      coordinates: postalSnapshot.coordinates
    };
  };

  const deleteBlockFloor = useCallback(
    async (postalcode: string, floor: string) => {
      try {
        await pollingVoidFunction(() =>
          remove(
            ref(database, `addresses/${code}/${postalcode}/units/${floor}`)
          )
        );
      } catch (error) {
        errorHandler(error, rollbar);
      }
    },
    [code]
  );

  const getTerritoryAddress = useCallback(
    async (territoryCode: string) => {
      return await pollingQueryFunction(() =>
        get(
          ref(
            database,
            `congregations/${code}/territories/${territoryCode}/addresses`
          )
        )
      );
    },
    [code]
  );

  const deleteTerritory = useCallback(async () => {
    if (!selectedTerritoryCode) return;
    try {
      const addressesSnapshot = await getTerritoryAddress(
        selectedTerritoryCode
      );
      if (addressesSnapshot.exists()) {
        const addressData = addressesSnapshot.val();
        for (const addkey in addressData) {
          const postalcode = addressData[addkey];
          const postalPath = `addresses/${code}/${postalcode}`;
          await pollingVoidFunction(() => remove(ref(database, postalPath)));
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
  }, [selectedTerritoryCode, code]);

  const deleteTerritoryAddress = useCallback(
    async (territoryCode: string, postalCode: string) => {
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
    },
    [code, selectedTerritoryCode]
  );

  const deleteBlock = useCallback(
    async (postalCode: string, name: string, showAlert: boolean) => {
      if (!selectedTerritoryCode) return;
      try {
        await remove(ref(database, `addresses/${code}/${postalCode}`));
        await deleteTerritoryAddress(selectedTerritoryCode, postalCode);
        if (showAlert) alert(`Deleted address, ${name}.`);
        await refreshCongregationTerritory(selectedTerritoryCode);
      } catch (error) {
        errorHandler(error, rollbar);
      }
    },
    [selectedTerritoryCode, code]
  );

  const addFloorToBlock = useCallback(
    async (postalcode: string, lowerFloor = false) => {
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
        unitUpdates[
          `addresses/${code}/${postalcode}/units/${newFloor}/${element.number}`
        ] = {
          status: STATUS_CODES.DEFAULT,
          type: policy.defaultType,
          note: "",
          nhcount: NOT_HOME_STATUS_CODES.DEFAULT,
          sequence: element.sequence ? element.sequence : 0
        };
      });
      try {
        await pollingVoidFunction(() => update(ref(database), unitUpdates));
      } catch (error) {
        errorHandler(error, rollbar);
      }
    },
    [code]
  );

  const resetTerritory = useCallback(async () => {
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
  }, [selectedTerritoryCode]);

  const resetBlock = useCallback(
    async (postalcode: string) => {
      const blockAddresses = addressData.get(postalcode);
      if (!blockAddresses) return;
      const unitUpdates: unitMaps = {};
      for (const floorDetails of blockAddresses.floors) {
        floorDetails.units.forEach((element) => {
          const unitPath = `addresses/${code}/${postalcode}/units/${floorDetails.floor}/${element.number}`;
          const updatedStatus = MUTABLE_CODES.includes(element.status)
            ? STATUS_CODES.DEFAULT
            : element.status;
          unitUpdates[`${unitPath}/type`] = element.type;
          unitUpdates[`${unitPath}/note`] = element.note;
          unitUpdates[`${unitPath}/status`] = updatedStatus;
          unitUpdates[`${unitPath}/nhcount`] = NOT_HOME_STATUS_CODES.DEFAULT;
          unitUpdates[`${unitPath}/dnctime`] = element.dnctime;
        });
      }
      try {
        await pollingVoidFunction(() => update(ref(database), unitUpdates));
      } catch (error) {
        console.error("Error updating units in resetBlock: ", error);
        errorHandler(error, rollbar);
      }
    },
    [code]
  );

  const handleUnitUpdate = (
    postal: string,
    floor: string,
    floors: Array<floorDetails>,
    unit: string,
    maxUnitNumber: number,
    name: string,
    addressData: addressDetails,
    options: Array<OptionProps>
  ) => {
    const floorUnits = floors.find((e) => e.floor === floor);
    const unitDetails = floorUnits?.units.find((e) => e.number === unit);

    ModalManager.show(SuspenseComponent(UpdateUnitStatus), {
      options: options,
      addressName: name,
      userAccessLevel: userAccessLevel,
      territoryType: addressData.type,
      congregation: code,
      postalCode: postal,
      unitNo: unit,
      unitNoDisplay: ZeroPad(unit, maxUnitNumber),
      floor: floor,
      floorDisplay: ZeroPad(floor, DEFAULT_FLOOR_PADDING),
      unitDetails: unitDetails,
      addressData: addressData,
      isMultiselect: policy.isMultiselect,
      origin: policy.origin
    });
  };

  const handleSubmitPersonalSlip = async (
    postalCode: string,
    name: string,
    linkExpiryHrs: number,
    publisherName: string
  ) => {
    if (!postalCode || !name) return;
    try {
      const linkid = nanoid();
      shareTimedLink(
        LINK_TYPES.PERSONAL,
        postalCode,
        name,
        linkid,
        `Units for ${name}`,
        assignmentMessage(name),
        `${code}/${linkid}`,
        linkExpiryHrs,
        publisherName
      );
    } catch (error) {
      errorHandler(error, rollbar);
    }
  };

  const refreshCongregationTerritory = async (selectTerritoryCode: string) => {
    if (!selectTerritoryCode) return;
    processSelectedTerritory(selectTerritoryCode);
  };

  const shareTimedLink = async (
    linktype: number,
    postalcode: string,
    postalname: string,
    linkId: string,
    title: string,
    body: string,
    url: string,
    hours: number,
    publisherName = ""
  ) => {
    if (!navigator.share) {
      alert(UNSUPPORTED_BROWSER_MSG);
      return;
    }
    try {
      setSelectedPostal(postalcode);
      if (linktype === LINK_TYPES.ASSIGNMENT) setIsSettingAssignLink(true);
      if (linktype === LINK_TYPES.PERSONAL) setIsSettingPersonalLink(true);
      await setLink(
        linktype,
        code,
        user.uid,
        postalcode,
        postalname,
        linkId,
        hours,
        policy.maxTries,
        publisherName
      );
      const absoluteUrl = new URL(url, window.location.href);
      await navigator.share({
        title: title,
        text: body,
        url: absoluteUrl.toString()
      });
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
  };

  const processCongregationTerritories = (
    snapshot: DataSnapshot | undefined
  ) => {
    try {
      if (!snapshot) return;
      const data = snapshot.val();
      if (!data) return;
      document.title = data["name"] as string;
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
      setName(data["name"] as string);
      return territoryList;
    } catch (error) {
      console.error("Error processing congregation territories: ", error);
    }
  };
  const getUserAccessLevel = async (congregationCode: string) => {
    return congregationAccess.current[congregationCode];
  };

  const handleTerritorySelect = useCallback(
    (eventKey: string | null) => {
      processSelectedTerritory(eventKey as string);
      toggleTerritoryListing();
    },
    // Reset cache when the territory dropdown is selected
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [showTerritoryListing]
  );

  const toggleTerritoryListing = useCallback(() => {
    setShowTerritoryListing(!showTerritoryListing);
  }, [showTerritoryListing]);

  const handleUserSelect = useCallback(
    (userKey: string | null) => {
      if (!userKey) return;
      const details = congUsers.get(userKey);
      if (!details) return;
      ModalManager.show(SuspenseComponent(UpdateUser), {
        uid: userKey,
        congregation: code,
        footerSaveAcl: userAccessLevel,
        name: details.name,
        role: details.role
      }).then((updatedRole) => {
        setCongUsers((existingUsers) => {
          if (updatedRole === USER_ACCESS_LEVELS.NO_ACCESS.CODE) {
            existingUsers.delete(userKey);
            return new Map<string, userDetails>(existingUsers);
          }
          details.role = updatedRole as number;
          return new Map<string, userDetails>(
            existingUsers.set(userKey, details)
          );
        });
      });
    },
    [congUsers, code, userAccessLevel]
  );

  const toggleUserListing = useCallback(() => {
    setShowUserListing(!showUserListing);
  }, [showUserListing]);

  const toggleCongregationListing = useCallback(() => {
    setShowCongregationListing(!showCongregationListing);
  }, [showCongregationListing]);

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
        selectedTerritoryCode as string,
        selectedPostalcode
      );
      toggleAddressTerritoryListing();
      await refreshCongregationTerritory(selectedTerritoryCode as string);
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

  const handleCongregationSelect = useCallback(
    async (newCongCode: string | null) => {
      setCongregationCode(newCongCode as string);
      setCode(newCongCode as string);
      refreshAddressState();
      setName("");
      setSelectedPostal("");
      setSelectedTerritoryCode("");
      setSelectedTerritoryName("");
      toggleCongregationListing();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [showCongregationListing]
  );

  const getAssignments = useCallback(async (code: string, uid: string) => {
    setIsAssignmentLoading(true);
    try {
      const snapshot = await pollingQueryFunction(() =>
        get(
          query(
            ref(database, `links/${code}`),
            orderByChild("userId"),
            equalTo(uid)
          )
        )
      );

      if (!snapshot.exists()) {
        alert("No assignments found.");
        return;
      }

      const assignmentListing = snapshot.val();
      const linkListing = new Array<LinkSession>();
      for (const linkId in assignmentListing) {
        linkListing.push(new LinkSession(assignmentListing[linkId], linkId));
      }

      ModalManager.show(SuspenseComponent(GetAssignments), {
        assignments: linkListing,
        congregation: code
      });
    } finally {
      setIsAssignmentLoading(false);
    }
  }, []);

  const refreshPage = () => {
    const inactivityPeriod = new Date().getTime() - currentTime.current;
    if (inactivityPeriod >= RELOAD_INACTIVITY_DURATION) {
      window.location.reload();
    } else {
      setTimeout(refreshPage, RELOAD_CHECK_INTERVAL_MS);
    }
  };

  const setActivityTime = () => {
    currentTime.current = new Date().getTime();
  };

  useEffect(() => {
    const fetchData = async () => {
      const userData = await user.getIdTokenResult(true);
      loginUserClaims.current = userData;
      const userClaims = userData.claims;
      const congData = userClaims["congregations"] as Record<string, number>;
      if (!congData) {
        setIsLoading(false);
        setIsUnauthorised(true);
        errorHandler(`Unauthorised access by ${user.email}`, rollbar, false);
        return;
      }
      congregationAccess.current = congData;
      const congregationAccessesPromises = Object.entries(congData).map(
        async ([key, access]) => {
          const congName = await pollingQueryFunction(() =>
            get(child(ref(database), `congregations/${key}/name`))
          );

          return {
            code: key,
            access: Number(access),
            name: congName.exists() ? congName.val() : ""
          };
        }
      );

      const congregationAccesses: CongregationAccessObject[] =
        await Promise.all(congregationAccessesPromises);
      setUserCongregationAccesses(congregationAccesses);
      const initialSelectedCode =
        congregationCode || congregationAccesses[0].code;
      setCode(initialSelectedCode);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowBkTopButton(window.scrollY > PIXELS_TILL_BK_TO_TOP_BUTTON_DISPLAY);
    };

    document.body.addEventListener("mousemove", setActivityTime);
    document.body.addEventListener("keypress", setActivityTime);
    document.body.addEventListener("touchstart", setActivityTime);
    window.addEventListener("scroll", handleScroll);
    const timeoutId = setTimeout(refreshPage, RELOAD_CHECK_INTERVAL_MS);
    return () => {
      document.body.removeEventListener("mousemove", setActivityTime);
      document.body.removeEventListener("keypress", setActivityTime);
      document.body.removeEventListener("touchstart", setActivityTime);
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (!code) return;
    refreshAddressState();

    Promise.all([
      getUserAccessLevel(code),
      checkCongregationExpireHours(code),
      checkCongregationMaxTries(code),
      getOptions(code),
      getOptionIsMultiSelect(code),
      getCongregationDetails(code),
      getCongregationOrigin(code)
    ])
      .then(
        ([
          userAccessLevel,
          expireHours,
          maxTries,
          options,
          optionIsMultiselect,
          congregationDetails,
          origin
        ]) => {
          setUserAccessLevel(Number(userAccessLevel));
          setDefaultExpiryHours(
            expireHours.exists()
              ? expireHours.val()
              : DEFAULT_SELF_DESTRUCT_HOURS
          );
          setOptions(options);
          setPolicy(
            new Policy(
              loginUserClaims.current,
              options,
              maxTries.exists()
                ? maxTries.val()
                : DEFAULT_CONGREGATION_MAX_TRIES,
              optionIsMultiselect.exists()
                ? optionIsMultiselect.val()
                : DEFAULT_CONGREGATION_OPTION_IS_MULTIPLE,
              origin.exists()
                ? origin.val()
                : DEFAULT_MAP_DIRECTION_CONGREGATION_LOCATION
            )
          );
          processCongregationTerritories(
            congregationDetails.exists() ? congregationDetails : undefined
          );
          setIsLoading(false);
        }
      )
      .catch((error) => {
        // Handle the error here
        console.error(error);
      });
  }, [code]);

  const territoryAddressData = useMemo(() => {
    const addressDataMap = new Map();
    let totalPercent = 0;

    addressData.forEach((address) => {
      const postalCode = address.postalCode;
      const maxUnitNumberLength = getMaxUnitLength(address.floors);
      const completedPercent = getCompletedPercent(policy, address.floors);
      addressDataMap.set(postalCode, {
        length: maxUnitNumberLength,
        percent: completedPercent
      });
      totalPercent += completedPercent.completedValue;
    });

    const { completedValue } = processCompletedPercentage(
      totalPercent,
      100 * addressData.size
    );

    return {
      total: completedValue,
      aggregates: addressDataMap,
      data: addressData
    };
  }, [addressData, policy]);

  if (isLoading) return <Loader />;
  if (isUnauthorised)
    return (
      <UnauthorizedPage handleClick={logoutUser} name={`${user.displayName}`} />
    );

  const isDataCompletelyFetched = addressData.size === sortedAddressList.length;
  const isAdmin = userAccessLevel === USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE;
  const isReadonly = userAccessLevel === USER_ACCESS_LEVELS.READ_ONLY.CODE;

  return (
    <>
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
      <UserListing
        showListing={showUserListing}
        users={Array.from(congUsers.values())}
        currentUid={user.uid}
        hideFunction={toggleUserListing}
        handleSelect={handleUserSelect}
      />
      <CongListing
        showListing={showCongregationListing}
        congregations={userCongregationAccesses}
        currentCongCode={code}
        hideFunction={toggleCongregationListing}
        handleSelect={handleCongregationSelect}
      />
      <Navbar bg="light" variant="light" expand="lg">
        <Container fluid>
          {name ? (
            <NavBarBranding naming={name} />
          ) : (
            <Spinner animation="border" as="span" size="sm" variant="primary" />
          )}
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse
            id="basic-navbar-nav"
            className="justify-content-end mt-1"
          >
            {userCongregationAccesses.length > 1 && (
              <Button
                className="m-1"
                size="sm"
                variant="outline-primary"
                onClick={toggleCongregationListing}
              >
                Select Congregation
              </Button>
            )}
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
                        aggregate={territoryAddressData.total}
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
                requiredPermission={USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE}
                userPermission={userAccessLevel}
              >
                <Button
                  className="m-1"
                  size="sm"
                  variant="outline-primary"
                  onClick={() =>
                    ModalManager.show(SuspenseComponent(NewTerritoryCode), {
                      footerSaveAcl: userAccessLevel,
                      congregation: code
                    })
                  }
                >
                  Create Territory
                </Button>
              </ComponentAuthorizer>
            )}
            {selectedTerritoryCode && (
              <ComponentAuthorizer
                requiredPermission={USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE}
                userPermission={userAccessLevel}
              >
                <DropdownButton
                  className="dropdown-btn"
                  variant="outline-primary"
                  size="sm"
                  title="Territory"
                >
                  <Dropdown.Item
                    onClick={() =>
                      ModalManager.show(SuspenseComponent(NewTerritoryCode), {
                        footerSaveAcl: userAccessLevel,
                        congregation: code
                      })
                    }
                  >
                    Create New
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() =>
                      ModalManager.show(
                        SuspenseComponent(ChangeTerritoryCode),
                        {
                          footerSaveAcl: userAccessLevel,
                          congregation: code,
                          territoryCode: selectedTerritoryCode
                        }
                      ).then((updatedCode) => {
                        processSelectedTerritory(updatedCode as string);
                        const updatedTerritories = new Map();
                        for (const [key, value] of territories) {
                          if (key === selectedTerritoryCode && value) {
                            value.code = updatedCode as string;
                            updatedTerritories.set(
                              updatedCode as string,
                              value
                            );
                          } else {
                            updatedTerritories.set(key, value);
                          }
                        }
                        setTerritories(updatedTerritories);
                      })
                    }
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
                                <Card.Header>
                                  Warning ⚠️
                                  <HelpButton
                                    link={WIKI_CATEGORIES.DELETE_TERRITORIES}
                                    isWarningButton={true}
                                  />
                                </Card.Header>
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
                    onClick={() =>
                      ModalManager.show(
                        SuspenseComponent(ChangeTerritoryName),
                        {
                          footerSaveAcl: userAccessLevel,
                          congregation: code,
                          territoryCode: selectedTerritoryCode,
                          name: selectedTerritoryName
                        }
                      ).then((updatedName) => {
                        setSelectedTerritoryName(updatedName as string);
                        setTerritories(
                          new Map<string, territoryDetails>(
                            Array.from(territories).map(([key, value]) => {
                              if (key === selectedTerritoryCode) {
                                value.name = updatedName as string;
                              }
                              return [key, value];
                            })
                          )
                        );
                      })
                    }
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
                                <Card.Header>
                                  Warning ⚠️
                                  <HelpButton
                                    link={WIKI_CATEGORIES.RESET_TERRITORIES}
                                    isWarningButton={true}
                                  />
                                </Card.Header>
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
                requiredPermission={USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE}
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
                    onClick={() =>
                      ModalManager.show(SuspenseComponent(NewPublicAddress), {
                        footerSaveAcl: userAccessLevel,
                        congregation: code,
                        territoryCode: selectedTerritoryCode,
                        defaultType: policy.defaultType,
                        origin: policy.origin
                      }).then(
                        async () =>
                          await refreshCongregationTerritory(
                            selectedTerritoryCode || ""
                          )
                      )
                    }
                  >
                    Public
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() =>
                      ModalManager.show(SuspenseComponent(NewPrivateAddress), {
                        footerSaveAcl: userAccessLevel,
                        congregation: code,
                        territoryCode: selectedTerritoryCode,
                        defaultType: policy.defaultType,
                        origin: policy.origin
                      }).then(
                        async () =>
                          await refreshCongregationTerritory(
                            selectedTerritoryCode || ""
                          )
                      )
                    }
                  >
                    Private
                  </Dropdown.Item>
                </DropdownButton>
              </ComponentAuthorizer>
            )}
            <ComponentAuthorizer
              requiredPermission={USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE}
              userPermission={userAccessLevel}
            >
              <DropdownButton
                className="dropdown-btn"
                size="sm"
                variant="outline-primary"
                title={
                  <>
                    {isShowingUserListing && (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          aria-hidden="true"
                        />{" "}
                      </>
                    )}{" "}
                    Congregation
                  </>
                }
                align={{ lg: "end" }}
              >
                <Dropdown.Item
                  onClick={() =>
                    ModalManager.show(
                      SuspenseComponent(UpdateCongregationSettings),
                      {
                        currentName: name,
                        currentCongregation: code,
                        currentMaxTries:
                          policy?.maxTries || DEFAULT_CONGREGATION_MAX_TRIES,
                        currentDefaultExpiryHrs: defaultExpiryHours,
                        currentIsMultipleSelection: policy?.isMultiselect
                      }
                    )
                  }
                >
                  Settings
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() =>
                    ModalManager.show(
                      SuspenseComponent(UpdateCongregationOptions),
                      {
                        currentCongregation: code
                      }
                    )
                  }
                >
                  Household Options
                </Dropdown.Item>
                <Dropdown.Item onClick={async () => await getUsers()}>
                  Manage Users
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    ModalManager.show(SuspenseComponent(InviteUser), {
                      email: user.email,
                      congregation: code,
                      footerSaveAcl: userAccessLevel
                    });
                  }}
                >
                  Invite User
                </Dropdown.Item>
              </DropdownButton>
            </ComponentAuthorizer>
            <DropdownButton
              className="dropdown-btn"
              size="sm"
              variant="outline-primary"
              title={
                <>
                  {isAssignmentLoading && (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        aria-hidden="true"
                      />{" "}
                    </>
                  )}{" "}
                  Account
                </>
              }
              align={{ lg: "end" }}
            >
              <Dropdown.Item
                onClick={() => {
                  ModalManager.show(SuspenseComponent(GetProfile), {
                    user: user
                  });
                }}
              >
                Profile
              </Dropdown.Item>
              <Dropdown.Item onClick={() => getAssignments(code, user.uid)}>
                Assignments
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() =>
                  ModalManager.show(SuspenseComponent(ChangePassword), {
                    user: user,
                    userAccessLevel: userAccessLevel
                  })
                }
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
          const addressElement = territoryAddressData.data.get(currentAdd.code);

          if (!addressElement)
            return <div key={`empty-div-${currentPostalcode}`}></div>;

          const currentPostalname = addressElement.name;
          const aggregate =
            territoryAddressData.aggregates.get(currentPostalcode);

          if (!aggregate)
            throw new Error(
              `No aggregate found for postal code ${currentPostalcode}`
            );

          const maxUnitNumberLength = aggregate.length;
          const completedPercent = aggregate.percent;
          const assigneeCount = addressElement.assigneeDetailsList.length;
          const personalCount = addressElement.personalDetailsList.length;
          return (
            <Accordion.Item
              key={`accordion-${currentPostalcode}`}
              eventKey={currentPostalcode}
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
                          USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE
                        }
                        userPermission={userAccessLevel}
                      >
                        <ButtonGroup className="m-1">
                          <Button
                            key={`assigndrop-${currentPostalcode}`}
                            size="sm"
                            variant="outline-primary"
                            onClick={() => {
                              if (!navigator.share) {
                                alert(UNSUPPORTED_BROWSER_MSG);
                                return;
                              }
                              ModalManager.show(
                                SuspenseComponent(ConfirmSlipDetails),
                                {
                                  addressName: currentPostalname,
                                  userAccessLevel: userAccessLevel,
                                  isPersonalSlip: true
                                }
                              ).then((linkReturn) => {
                                const linkObject = linkReturn as Record<
                                  string,
                                  unknown
                                >;
                                handleSubmitPersonalSlip(
                                  currentPostalcode,
                                  currentPostalname,
                                  linkObject.linkExpiryHrs as number,
                                  linkObject.publisherName as string
                                );
                              });
                            }}
                          >
                            Personal
                          </Button>
                          {(isSettingPersonalLink &&
                            selectedPostal === currentPostalcode && (
                              <Button size="sm" variant="outline-primary">
                                <Spinner
                                  as="span"
                                  animation="border"
                                  size="sm"
                                  aria-hidden="true"
                                />{" "}
                              </Button>
                            )) ||
                            (personalCount > 0 && (
                              <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={() =>
                                  ModalManager.show(
                                    SuspenseComponent(GetAssignments),
                                    {
                                      assignments:
                                        addressElement.personalDetailsList,
                                      assignmentType: LINK_TYPES.PERSONAL,
                                      assignmentTerritory: currentPostalname,
                                      congregation: code
                                    }
                                  )
                                }
                              >
                                <Badge bg="danger" className="me-1">
                                  {personalCount}
                                </Badge>
                              </Button>
                            ))}
                        </ButtonGroup>
                      </ComponentAuthorizer>
                      <ComponentAuthorizer
                        requiredPermission={USER_ACCESS_LEVELS.CONDUCTOR.CODE}
                        userPermission={userAccessLevel}
                      >
                        <ButtonGroup className="m-1">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => {
                              if (!navigator.share) {
                                alert(UNSUPPORTED_BROWSER_MSG);
                                return;
                              }
                              ModalManager.show(
                                SuspenseComponent(ConfirmSlipDetails),
                                {
                                  addressName: currentPostalname,
                                  userAccessLevel: userAccessLevel,
                                  isPersonalSlip: false
                                }
                              ).then((linkReturn) => {
                                const linkObject = linkReturn as Record<
                                  string,
                                  unknown
                                >;
                                const addressLinkId = nanoid();
                                shareTimedLink(
                                  LINK_TYPES.ASSIGNMENT,
                                  currentPostalcode,
                                  currentPostalname,
                                  addressLinkId,
                                  `Units for ${currentPostalname}`,
                                  assignmentMessage(currentPostalname),
                                  `${code}/${addressLinkId}`,
                                  defaultExpiryHours,
                                  linkObject.publisherName as string
                                );
                              });
                            }}
                          >
                            Assign
                          </Button>
                          {(isSettingAssignLink &&
                            selectedPostal === currentPostalcode && (
                              <Button size="sm" variant="outline-primary">
                                <Spinner
                                  as="span"
                                  animation="border"
                                  size="sm"
                                  aria-hidden="true"
                                />{" "}
                              </Button>
                            )) ||
                            (assigneeCount > 0 && (
                              <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={() =>
                                  ModalManager.show(
                                    SuspenseComponent(GetAssignments),
                                    {
                                      assignments:
                                        addressElement.assigneeDetailsList,
                                      assignmentType: LINK_TYPES.ASSIGNMENT,
                                      assignmentTerritory: currentPostalname,
                                      congregation: code
                                    }
                                  )
                                }
                              >
                                <Badge bg="danger" className="me-1">
                                  {assigneeCount}
                                </Badge>
                              </Button>
                            ))}
                        </ButtonGroup>
                      </ComponentAuthorizer>
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
                            const addressLinkId = nanoid();
                            await setLink(
                              LINK_TYPES.VIEW,
                              code,
                              user.uid,
                              currentPostalcode,
                              currentPostalname,
                              addressLinkId,
                              defaultExpiryHours,
                              policy.maxTries,
                              user.displayName || ""
                            );
                            if (territoryWindow) {
                              territoryWindow.location.href = `${code}/${addressLinkId}`;
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
                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="m-1"
                        onClick={() =>
                          window.open(
                            GetDirection(addressElement.coordinates),
                            "_blank"
                          )
                        }
                      >
                        Direction
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="m-1"
                        onClick={() =>
                          ModalManager.show(
                            SuspenseComponent(UpdateAddressFeedback),
                            {
                              footerSaveAcl: userAccessLevel,
                              name: currentPostalname,
                              congregation: code,
                              postalCode: currentPostalcode,
                              currentFeedback: addressElement.feedback,
                              currentName: user.displayName,
                              helpLink:
                                WIKI_CATEGORIES.CONDUCTOR_ADDRESS_FEEDBACK
                            }
                          )
                        }
                      >
                        <span
                          className={addressElement.feedback ? "blinking" : ""}
                        >
                          Feedback
                        </span>
                      </Button>
                      <InstructionsButton
                        instructions={addressElement.instructions}
                        handleSave={() =>
                          ModalManager.show(
                            SuspenseComponent(UpdateAddressInstructions),
                            {
                              congregation: code,
                              postalCode: currentPostalcode,
                              userAccessLevel: userAccessLevel,
                              addressName: currentPostalname,
                              instructions: addressElement.instructions,
                              userName: user.displayName
                            }
                          )
                        }
                        userAcl={userAccessLevel}
                      />
                      <ComponentAuthorizer
                        requiredPermission={
                          USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE
                        }
                        userPermission={userAccessLevel}
                      >
                        <DropdownButton
                          className="dropdown-btn"
                          align="end"
                          variant="outline-primary"
                          size="sm"
                          title="Address"
                          drop={dropDirections[currentPostalcode]}
                          onClick={(e) =>
                            handleDropdownDirection(e, currentPostalcode)
                          }
                        >
                          <Dropdown.Item
                            onClick={() =>
                              ModalManager.show(
                                SuspenseComponent(ChangeAddressGeoLocation),
                                {
                                  footerSaveAcl: userAccessLevel,
                                  congregation: code,
                                  postalCode: currentPostalcode,
                                  coordinates: addressElement.coordinates,
                                  name: currentPostalname,
                                  origin: policy.origin
                                }
                              ).then(
                                async () =>
                                  await refreshCongregationTerritory(
                                    selectedTerritoryCode || ""
                                  )
                              )
                            }
                          >
                            Change Location
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() =>
                              ModalManager.show(
                                SuspenseComponent(ChangeAddressPostalCode),
                                {
                                  footerSaveAcl: userAccessLevel,
                                  congregation: code,
                                  postalCode: currentPostalcode,
                                  territoryCode: selectedTerritoryCode
                                }
                              ).then(
                                async () =>
                                  await refreshCongregationTerritory(
                                    selectedTerritoryCode || ""
                                  )
                              )
                            }
                          >
                            Change Map Number
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
                            onClick={() =>
                              ModalManager.show(
                                SuspenseComponent(ChangeAddressName),
                                {
                                  congregation: code,
                                  footerSaveAcl: userAccessLevel,
                                  postal: currentPostalcode,
                                  name: currentPostalname
                                }
                              )
                            }
                          >
                            Rename
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() =>
                              ModalManager.show(SuspenseComponent(NewUnit), {
                                footerSaveAcl: userAccessLevel,
                                postalCode: currentPostalcode,
                                addressData: addressElement,
                                defaultType: policy.defaultType,
                                congregation: code
                              })
                            }
                          >
                            Add{" "}
                            {addressElement.type === TERRITORY_TYPES.PRIVATE
                              ? "Property"
                              : "Unit"}{" "}
                            No.
                          </Dropdown.Item>
                          {(!addressElement.type ||
                            addressElement.type === TERRITORY_TYPES.PUBLIC) && (
                            <Dropdown.Item
                              onClick={() => {
                                addFloorToBlock(currentPostalcode);
                              }}
                            >
                              Add Higher Floor
                            </Dropdown.Item>
                          )}
                          {(!addressElement.type ||
                            addressElement.type === TERRITORY_TYPES.PUBLIC) && (
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
                                        <Card.Header>
                                          Warning ⚠️
                                          <HelpButton
                                            link={WIKI_CATEGORIES.RESET_ADDRESS}
                                            isWarningButton={true}
                                          />
                                        </Card.Header>
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
                                        <Card.Header>
                                          Warning ⚠️
                                          <HelpButton
                                            link={
                                              WIKI_CATEGORIES.DELETE_ADDRESS
                                            }
                                            isWarningButton={true}
                                          />
                                        </Card.Header>
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
                    postalCode={currentPostalcode}
                    territoryType={addressElement.type}
                    userAccessLevel={userAccessLevel}
                    handleUnitStatusUpdate={(event) => {
                      const { floor, unitno } = event.currentTarget.dataset;
                      handleUnitUpdate(
                        currentPostalcode,
                        floor || "",
                        addressElement.floors,
                        unitno || "",
                        maxUnitNumberLength,
                        currentPostalname,
                        addressElement,
                        options
                      );
                    }}
                    adminUnitHeaderStyle={`${
                      isAdmin ? "admin-unit-header " : ""
                    }`}
                    handleUnitNoUpdate={(event) => {
                      const { sequence, unitno, length } =
                        event.currentTarget.dataset;
                      if (!isAdmin) return;
                      ModalManager.show(SuspenseComponent(UpdateUnit), {
                        postalCode: currentPostalcode,
                        unitNo: unitno || "",
                        unitLength: Number(length),
                        unitSequence:
                          sequence === undefined ? undefined : Number(sequence),
                        unitDisplay: ZeroPad(unitno || "", maxUnitNumberLength),
                        addressData: addressElement,
                        congregation: code
                      });
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
                                <Card.Header>
                                  Warning ⚠️
                                  <HelpButton
                                    link={WIKI_CATEGORIES.DELETE_ADDRESS_FLOOR}
                                    isWarningButton={true}
                                  />
                                </Card.Header>
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
                                        floor as string
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
    </>
  );
}

export default Admin;
