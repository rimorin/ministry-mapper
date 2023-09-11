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
import { signOut, User } from "firebase/auth";
import { nanoid } from "nanoid";
import { useEffect, useState, useCallback, useMemo, lazy } from "react";
import {
  Accordion,
  Badge,
  Button,
  Card,
  Container,
  Dropdown,
  DropdownButton,
  Fade,
  Navbar,
  ProgressBar,
  Spinner
} from "react-bootstrap";
import { database, auth, functions } from "../../firebase";
import { httpsCallable } from "firebase/functions";
import {
  valuesDetails,
  floorDetails,
  territoryDetails,
  addressDetails,
  adminProps,
  unitMaps,
  userDetails,
  OptionProps
} from "../../utils/interface";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { useParams } from "react-router-dom";
import InstructionsButton from "../../components/form/instructions";
import "react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css";
import { useRollbar } from "@rollbar/react";
import { LinkSession, Policy } from "../../utils/policies";
import AdminTable from "../../components/table/admin";
import pollingQueryFunction from "../../utils/helpers/pollingquery";
import processAddressData from "../../utils/helpers/processadddata";
import processLinkCounts from "../../utils/helpers/processlinkct";
import errorHandler from "../../utils/helpers/errorhandler";
import ZeroPad from "../../utils/helpers/zeropad";
import addHours from "../../utils/helpers/addhours";
import triggerPostalCodeListeners from "../../utils/helpers/postalcodelistener";
import assignmentMessage from "../../utils/helpers/assignmentmsg";
import getMaxUnitLength from "../../utils/helpers/maxunitlength";
import getCompletedPercent from "../../utils/helpers/getcompletedpercent";
import checkCongregationExpireHours from "../../utils/helpers/checkcongexp";
import SetPollerInterval from "../../utils/helpers/pollinginterval";
import pollingVoidFunction from "../../utils/helpers/pollingvoid";
import processCompletedPercentage from "../../utils/helpers/processcompletedpercent";
import checkCongregationMaxTries from "../../utils/helpers/checkmaxtries";
import EnvironmentIndicator from "../../components/navigation/environment";
import TerritoryListing from "../../components/navigation/territorylist";
import UserListing from "../../components/navigation/userlist";
import NavBarBranding from "../../components/navigation/branding";
import AggregationBadge from "../../components/navigation/aggrbadge";
import ComponentAuthorizer from "../../components/navigation/authorizer";
import TerritoryHeader from "../../components/navigation/territoryheader";
import BackToTopButton from "../../components/navigation/backtotop";
import HelpButton from "../../components/navigation/help";
import Loader from "../../components/statics/loader";
import Welcome from "../../components/statics/welcome";
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
  DEFAULT_CONGREGATION_MAX_TRIES
} from "../../utils/constants";
import ModalManager from "@ebay/nice-modal-react";
import SuspenseComponent from "../../components/utils/suspense";
import getOptions from "../../utils/helpers/getcongoptions";
const UnauthorizedPage = SuspenseComponent(
  lazy(() => import("../../components/statics/unauth"))
);
const UpdateUser = lazy(() => import("../../components/modal/updateuser"));
const UpdateUnitStatus = lazy(
  () => import("../../components/modal/updatestatus")
);
const UpdateUnit = lazy(() => import("../../components/modal/updateunit"));
const ConfirmSlipDetails = lazy(
  () => import("../../components/modal/slipdetails")
);
const UpdateCongregationSettings = lazy(
  () => import("../../components/modal/congsettings")
);
const UpdateAddressInstructions = lazy(
  () => import("../../components/modal/instructions")
);
const UpdateAddressFeedback = lazy(
  () => import("../../components/modal/updateaddfeedback")
);
const NewUnit = lazy(() => import("../../components/modal/newunit"));
const NewTerritoryCode = lazy(
  () => import("../../components/modal/newterritorycd")
);
const NewPublicAddress = lazy(
  () => import("../../components/modal/newpublicadd")
);
const NewPrivateAddress = lazy(
  () => import("../../components/modal/newprivateadd")
);
const InviteUser = lazy(() => import("../../components/modal/inviteuser"));
const GetProfile = lazy(() => import("../../components/modal/profile"));
const GetAssignments = lazy(() => import("../../components/modal/assignments"));
const ChangeTerritoryName = lazy(
  () => import("../../components/modal/changeterritoryname")
);
const ChangeTerritoryCode = lazy(
  () => import("../../components/modal/changeterritorycd")
);
const ChangePassword = lazy(
  () => import("../../components/modal/changepassword")
);
const ChangeAddressPostalCode = lazy(
  () => import("../../components/modal/changepostalcd")
);
const ChangeAddressName = lazy(
  () => import("../../components/modal/changeaddname")
);

function Admin({ user }: adminProps) {
  const { code } = useParams();
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
  const [isShowingUserListing, setIsShowingUserListing] =
    useState<boolean>(false);
  const [congUsers, setCongUsers] = useState(new Map<string, userDetails>());
  const [showChangeAddressTerritory, setShowChangeAddressTerritory] =
    useState<boolean>(false);
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
  const [userAccessLevel, setUserAccessLevel] = useState<number>();
  const [defaultExpiryHours, setDefaultExpiryHours] = useState<number>(
    DEFAULT_SELF_DESTRUCT_HOURS
  );
  const [assignments, setAssignments] = useState<Array<LinkSession>>([]);
  const [policy, setPolicy] = useState<Policy>(new Policy());
  const [options, setOptions] = useState<Array<OptionProps>>([]);
  const rollbar = useRollbar();
  let unsubscribers = new Array<Unsubscribe>();

  const refreshAddressState = () => {
    unsubscribers.forEach((unsubFunction) => {
      unsubFunction();
    });
    setAddressData(new Map<string, addressDetails>());
  };

  const getUsers = async () => {
    const getCongregationUsers = httpsCallable(
      functions,
      "getCongregationUsers"
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
        unitUpdates[`${unitPath}/dnctime`] = element.dnctime;
      });
    }
    try {
      await pollingVoidFunction(() => update(ref(database), unitUpdates));
    } catch (error) {
      errorHandler(error, rollbar);
    }
  };

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
      addressData: addressData
    });
  };

  const setTimedLink = (
    linktype: number,
    postalCode: string,
    postalName: string,
    addressLinkId: string,
    hours: number,
    publisherName = ""
  ) => {
    const link = new LinkSession();
    link.tokenEndtime = addHours(hours);
    link.postalCode = postalCode;
    link.linkType = linktype;
    link.maxTries = policy.maxTries;
    // dont set user if its view type link. This will prevent this kind of links from appearing in assignments
    if (linktype != LINK_TYPES.VIEW) link.userId = user.uid;
    link.congregation = code;
    link.name = postalName;
    link.publisherName = publisherName;
    return pollingVoidFunction(async () => {
      await set(ref(database, `links/${addressLinkId}`), link);
      await triggerPostalCodeListeners(link.postalCode);
    });
  };

  const handleSubmitPersonalSlip = async (
    postalCode: string,
    name: string,
    linkid: string,
    linkExpiryHrs: number,
    publisherName: string
  ) => {
    if (!postalCode || !name || !linkid) return;
    try {
      shareTimedLink(
        LINK_TYPES.PERSONAL,
        postalCode,
        name,
        linkid,
        `Units for ${name}`,
        assignmentMessage(name),
        `/${postalCode}/${code}/${linkid}`,
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
      await setTimedLink(
        linktype,
        postalcode,
        postalname,
        linkId,
        hours,
        publisherName
      );
      await navigator.share({
        title: title,
        text: body,
        url: url
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

  const handleUserSelect = (userKey: string | null) => {
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
  };

  const toggleUserListing = useCallback(() => {
    setShowUserListing(!showUserListing);
  }, [showUserListing]);

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

    const { completedValue } = processCompletedPercentage(
      totalPercent,
      100 * addresses.size
    );

    return {
      aggregate: completedValue,
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
    checkCongregationExpireHours(`${code}`).then((snapshot) => {
      if (!snapshot.exists()) return;
      setDefaultExpiryHours(snapshot.val());
    });
    checkCongregationMaxTries(`${code}`).then((snapshot) => {
      const maxTries = snapshot.exists()
        ? snapshot.val()
        : DEFAULT_CONGREGATION_MAX_TRIES;
      getOptions(`${code}`).then(async (options) => {
        setOptions(options);
        setPolicy(
          new Policy(await user.getIdTokenResult(true), options, maxTries)
        );
      });
    });

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
  const isAdmin = userAccessLevel === USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE;
  const isReadonly = userAccessLevel === USER_ACCESS_LEVELS.READ_ONLY.CODE;

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
        <UserListing
          showListing={showUserListing}
          users={Array.from(congUsers.values())}
          currentUid={user.uid}
          hideFunction={toggleUserListing}
          handleSelect={handleUserSelect}
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
              <ComponentAuthorizer
                requiredPermission={USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE}
                userPermission={userAccessLevel}
              >
                <DropdownButton
                  className="dropdown-btn"
                  variant="outline-primary"
                  size="sm"
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
                      Users
                    </>
                  }
                >
                  <Dropdown.Item onClick={async () => await getUsers()}>
                    {isShowingUserListing && (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          aria-hidden="true"
                        />{" "}
                      </>
                    )}
                    Manage
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
                    Invite
                  </Dropdown.Item>
                </DropdownButton>
              </ComponentAuthorizer>
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
                        ).then((updatedCode) =>
                          processSelectedTerritory(updatedCode as string)
                        )
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
                        ).then((updatedName) =>
                          setSelectedTerritoryName(updatedName as string)
                        )
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
                          defaultType: policy.defaultType
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
                        ModalManager.show(
                          SuspenseComponent(NewPrivateAddress),
                          {
                            footerSaveAcl: userAccessLevel,
                            congregation: code,
                            territoryCode: selectedTerritoryCode,
                            defaultType: policy.defaultType
                          }
                        ).then(
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
              <DropdownButton
                className="dropdown-btn"
                size="sm"
                variant="outline-primary"
                title="Account"
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
                <Dropdown.Item
                  onClick={() =>
                    ModalManager.show(
                      SuspenseComponent(UpdateCongregationSettings),
                      {
                        currentName: `${name}`,
                        currentCongregation: `${code}`,
                        currentMaxTries:
                          policy?.maxTries || DEFAULT_CONGREGATION_MAX_TRIES,
                        currentDefaultExpiryHrs: defaultExpiryHours
                      }
                    )
                  }
                >
                  Congregation
                </Dropdown.Item>
                {assignments && assignments.length > 0 && (
                  <Dropdown.Item
                    onClick={() =>
                      ModalManager.show(SuspenseComponent(GetAssignments), {
                        assignments: assignments
                      })
                    }
                  >
                    Assignments
                  </Dropdown.Item>
                )}
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
                            USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE
                          }
                          userPermission={userAccessLevel}
                        >
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
                                  addressLinkId,
                                  linkObject.linkExpiryHrs as number,
                                  linkObject.publisherName as string
                                );
                              });
                            }}
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
                          requiredPermission={USER_ACCESS_LEVELS.CONDUCTOR.CODE}
                          userPermission={userAccessLevel}
                        >
                          <>
                            <Button
                              size="sm"
                              variant="outline-primary"
                              className="m-1"
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
                                  shareTimedLink(
                                    LINK_TYPES.ASSIGNMENT,
                                    currentPostalcode,
                                    currentPostalname,
                                    addressLinkId,
                                    `Units for ${currentPostalname}`,
                                    assignmentMessage(currentPostalname),
                                    `/${currentPostalcode}/${code}/${addressLinkId}`,
                                    defaultExpiryHours,
                                    linkObject.publisherName as string
                                  );
                                });
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
                                    defaultExpiryHours,
                                    user.displayName || ""
                                  );
                                  if (territoryWindow) {
                                    territoryWindow.location.href = `/${currentPostalcode}/${code}/${addressLinkId}`;
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
                          onClick={() =>
                            ModalManager.show(
                              SuspenseComponent(UpdateAddressFeedback),
                              {
                                footerSaveAcl: userAccessLevel,
                                name: currentPostalname,
                                congregation: code || "",
                                postalCode: currentPostalcode,
                                currentFeedback: addressElement.feedback,
                                currentName: user.displayName || "",
                                helpLink:
                                  WIKI_CATEGORIES.CONDUCTOR_ADDRESS_FEEDBACK
                              }
                            )
                          }
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
                          handleSave={() =>
                            ModalManager.show(
                              SuspenseComponent(UpdateAddressInstructions),
                              {
                                congregation: code || "",
                                postalCode: currentPostalcode,
                                userAccessLevel: userAccessLevel,
                                addressName: currentPostalname,
                                instructions: addressElement.instructions,
                                userName: user.displayName || ""
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
                          >
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
                              onClick={() =>
                                ModalManager.show(
                                  SuspenseComponent(ChangeAddressName),
                                  {
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
                                  defaultType: policy.defaultType
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
                                          <Card.Header>
                                            Warning ⚠️
                                            <HelpButton
                                              link={
                                                WIKI_CATEGORIES.RESET_ADDRESS
                                              }
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
                      postalCode={`${currentPostalcode}`}
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
                            sequence === undefined
                              ? undefined
                              : Number(sequence),
                          unitDisplay: ZeroPad(
                            unitno || "",
                            maxUnitNumberLength
                          ),
                          addressData: addressElement
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
                                      link={
                                        WIKI_CATEGORIES.DELETE_ADDRESS_FLOOR
                                      }
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
      </>
    </Fade>
  );
}

export default Admin;
