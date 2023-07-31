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
import { useEffect, useState, useCallback, useMemo } from "react";
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
  Policy,
  valuesDetails,
  floorDetails,
  territoryDetails,
  addressDetails,
  adminProps,
  unitMaps,
  userDetails
} from "../../utils/interface";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { useParams } from "react-router-dom";
import { InstructionsButton } from "../../components/form";
import "react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css";
import { useRollbar } from "@rollbar/react";
import { RacePolicy, LanguagePolicy, LinkSession } from "../../utils/policies";
import getUA from "ua-parser-js";
import { AdminTable } from "../../components/table";
import {
  pollingVoidFunction,
  processAddressData,
  processLinkCounts,
  errorHandler,
  ZeroPad,
  addHours,
  triggerPostalCodeListeners,
  assignmentMessage,
  getMaxUnitLength,
  getCompletedPercent,
  checkTraceLangStatus,
  checkTraceRaceStatus,
  getLanguageDisplayByCode,
  checkCongregationExpireHours,
  SetPollerInterval,
  pollingQueryFunction,
  processCompletedPercentage,
  checkCongregationMaxTries
} from "../../utils/helpers";
import {
  EnvironmentIndicator,
  TerritoryListing,
  UserListing,
  NavBarBranding,
  AggregationBadge,
  ComponentAuthorizer,
  TerritoryHeader,
  BackToTopButton,
  UnauthorizedPage,
  HelpButton
} from "../../components/navigation";
import { Loader, Welcome } from "../../components/static";
import {
  STATUS_CODES,
  HOUSEHOLD_TYPES,
  NOT_HOME_STATUS_CODES,
  MUTABLE_CODES,
  DEFAULT_FLOOR_PADDING,
  DEFAULT_SELF_DESTRUCT_HOURS,
  LINK_TYPES,
  UNSUPPORTED_BROWSER_MSG,
  UA_DEVICE_MAKES,
  RELOAD_INACTIVITY_DURATION,
  RELOAD_CHECK_INTERVAL_MS,
  USER_ACCESS_LEVELS,
  TERRITORY_VIEW_WINDOW_WELCOME_TEXT,
  PIXELS_TILL_BK_TO_TOP_BUTTON_DISPLAY,
  TERRITORY_TYPES,
  ASSIGNMENT_MODAL_ID,
  WIKI_CATEGORIES,
  DEFAULT_CONGREGATION_MAX_TRIES
} from "../../utils/constants";
import ModalManager from "@ebay/nice-modal-react";
import {
  ChangeAddressName,
  ChangeAddressPostalCode,
  ChangePassword,
  ChangeTerritoryCode,
  ChangeTerritoryName,
  GetAssignments,
  GetProfile,
  InviteUser,
  NewPrivateAddress,
  NewPublicAddress,
  NewTerritoryCode,
  NewUnit,
  UpdateAddressFeedback,
  UpdateAddressInstructions,
  UpdateCongregationSettings,
  UpdatePersonalSlipExpiry,
  UpdateUnit,
  UpdateUnitStatus,
  UpdateUser
} from "../../components/modals";
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
  const [isSpecialDevice, setIsSpecialDevice] = useState<boolean>(false);
  useState<boolean>(false);
  const [showBkTopButton, setShowBkTopButton] = useState(false);
  const [showTerritoryListing, setShowTerritoryListing] =
    useState<boolean>(false);
  const [showUserListing, setShowUserListing] = useState<boolean>(false);
  const [isShowingUserListing, setIsShowingUserListing] =
    useState<boolean>(false);
  const [congUsers, setCongUsers] = useState(new Map<string, userDetails>());
  const [trackRace, setTrackRace] = useState<boolean>(true);
  const [trackLanguages, setTrackLanguages] = useState<boolean>(true);
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
  const [policy, setPolicy] = useState<Policy>();
  const [userAccessLevel, setUserAccessLevel] = useState<number>();
  const [defaultExpiryHours, setDefaultExpiryHours] = useState<number>(
    DEFAULT_SELF_DESTRUCT_HOURS
  );
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

  const handleUnitUpdate = (
    postal: string,
    floor: string,
    floors: Array<floorDetails>,
    unit: string,
    maxUnitNumber: number,
    name: string,
    addressData: addressDetails
  ) => {
    const floorUnits = floors.find((e) => e.floor === floor);
    const unitDetails = floorUnits?.units.find((e) => e.number === unit);

    ModalManager.show(UpdateUnitStatus, {
      addressName: name,
      userAccessLevel: userAccessLevel,
      territoryType: addressData.type,
      congregation: code,
      postalCode: postal,
      unitNo: unit,
      unitNoDisplay: ZeroPad(unit, maxUnitNumber),
      floor: floor,
      floorDisplay: ZeroPad(floor, DEFAULT_FLOOR_PADDING),
      trackRace: trackRace,
      trackLanguages: trackLanguages,
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
      if (isSpecialDevice) {
        specialShareTimedLink(
          LINK_TYPES.PERSONAL,
          postalCode,
          name,
          linkid,
          linkExpiryHrs,
          publisherName
        );
        return;
      }
      shareTimedLink(
        LINK_TYPES.PERSONAL,
        postalCode,
        name,
        linkid,
        `Units for ${name}`,
        assignmentMessage(name),
        `${domain}/${postalCode}/${code}/${linkid}`,
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
        await setTimedLink(
          linktype,
          postalcode,
          postalname,
          linkId,
          hours,
          publisherName
        );
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
    hours = DEFAULT_SELF_DESTRUCT_HOURS,
    publisherName = ""
  ) => {
    if (navigator.share) {
      if (linktype === LINK_TYPES.PERSONAL) {
        setIsSettingPersonalLink(true);
        try {
          await setTimedLink(
            linktype,
            postalcode,
            name,
            linkId,
            hours,
            publisherName
          );
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

  const handleUserSelect = (userKey: string | null) => {
    if (!userKey) return;
    const details = congUsers.get(userKey);
    if (!details) return;
    ModalManager.show(UpdateUser, {
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
      checkTraceLangStatus(`${code}`).then(async (snapshot) => {
        const isTrackLanguages = snapshot.val();
        setTrackLanguages(isTrackLanguages);
        if (isTrackLanguages) {
          setPolicy(
            new LanguagePolicy(await user.getIdTokenResult(true), maxTries)
          );
        }
      });
      checkTraceRaceStatus(`${code}`).then(async (snapshot) => {
        const isTrackRace = snapshot.val();
        setTrackRace(isTrackRace);
        if (isTrackRace) {
          setPolicy(
            new RacePolicy(await user.getIdTokenResult(true), maxTries)
          );
        }
      });
    });
    // Huawei is considered special due to its unusual behaviour in their OS native share functionality.
    // Device is also special if there is an undefined vendor.
    const currentDeviceMake = getUA().device.vendor;
    setIsSpecialDevice(
      currentDeviceMake === undefined ||
        currentDeviceMake === UA_DEVICE_MAKES.HUAWEI
    );

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
        if (linkListing.length === 0) ModalManager.hide(ASSIGNMENT_MODAL_ID);
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
                      ModalManager.show(NewTerritoryCode, {
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
                      ModalManager.show(InviteUser, {
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
                        ModalManager.show(NewTerritoryCode, {
                          footerSaveAcl: userAccessLevel,
                          congregation: code
                        })
                      }
                    >
                      Create New
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() =>
                        ModalManager.show(ChangeTerritoryCode, {
                          footerSaveAcl: userAccessLevel,
                          congregation: code,
                          territoryCode: selectedTerritoryCode
                        }).then((updatedCode) =>
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
                        ModalManager.show(ChangeTerritoryName, {
                          footerSaveAcl: userAccessLevel,
                          congregation: code,
                          territoryCode: selectedTerritoryCode,
                          name: selectedTerritoryName
                        }).then((updatedName) =>
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
                        ModalManager.show(NewPublicAddress, {
                          footerSaveAcl: userAccessLevel,
                          congregation: code,
                          territoryCode: selectedTerritoryCode
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
                        ModalManager.show(NewPrivateAddress, {
                          footerSaveAcl: userAccessLevel,
                          congregation: code,
                          territoryCode: selectedTerritoryCode
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
              <DropdownButton
                className="dropdown-btn"
                size="sm"
                variant="outline-primary"
                title="Account"
                align={{ lg: "end" }}
              >
                <Dropdown.Item
                  onClick={() => {
                    ModalManager.show(GetProfile, {
                      email: user.email,
                      name: user.displayName,
                      homeLanguage: trackLanguages
                        ? getLanguageDisplayByCode(
                            policy?.getHomeLanguage() as string
                          )
                        : undefined
                    });
                  }}
                >
                  Profile
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() =>
                    ModalManager.show(UpdateCongregationSettings, {
                      currentCongregation: `${code}`,
                      currentMaxTries:
                        policy?.getMaxTries() || DEFAULT_CONGREGATION_MAX_TRIES,
                      currentDefaultExpiryHrs: defaultExpiryHours
                    })
                  }
                >
                  Congregation
                </Dropdown.Item>
                {assignments && assignments.length > 0 && (
                  <Dropdown.Item
                    onClick={() => ModalManager.show(ASSIGNMENT_MODAL_ID)}
                  >
                    Assignments
                  </Dropdown.Item>
                )}
                <Dropdown.Item
                  onClick={() =>
                    ModalManager.show(ChangePassword, {
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
                            onClick={() =>
                              ModalManager.show(UpdatePersonalSlipExpiry, {
                                addressName: currentPostalname,
                                userAccessLevel: userAccessLevel
                              }).then((linkReturn) => {
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
                              })
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
                          requiredPermission={USER_ACCESS_LEVELS.CONDUCTOR.CODE}
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
                          onClick={() =>
                            ModalManager.show(UpdateAddressFeedback, {
                              footerSaveAcl: userAccessLevel,
                              name: currentPostalname,
                              congregation: code,
                              postalCode: currentPostalcode,
                              currentFeedback: addressElement.feedback,
                              helpLink:
                                WIKI_CATEGORIES.CONDUCTOR_ADDRESS_FEEDBACK
                            })
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
                            ModalManager.show(UpdateAddressInstructions, {
                              congregation: code,
                              postalCode: currentPostalcode,
                              userAccessLevel: userAccessLevel,
                              addressName: currentPostalname,
                              instructions: addressElement.instructions
                            })
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
                                ModalManager.show(ChangeAddressPostalCode, {
                                  footerSaveAcl: userAccessLevel,
                                  congregation: code,
                                  postalCode: currentPostalcode,
                                  territoryCode: selectedTerritoryCode
                                }).then(
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
                                ModalManager.show(ChangeAddressName, {
                                  footerSaveAcl: userAccessLevel,
                                  postal: currentPostalcode,
                                  name: currentPostalname
                                })
                              }
                            >
                              Rename
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() =>
                                ModalManager.show(NewUnit, {
                                  footerSaveAcl: userAccessLevel,
                                  postalCode: currentPostalcode,
                                  addressData: addressElement
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
                      trackRace={trackRace}
                      trackLanguages={trackLanguages}
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
                          addressElement
                        );
                      }}
                      adminUnitHeaderStyle={`${
                        isAdmin ? "admin-unit-header " : ""
                      }`}
                      handleUnitNoUpdate={(event) => {
                        const { sequence, unitno, length } =
                          event.currentTarget.dataset;
                        if (!isAdmin) return;
                        ModalManager.show(UpdateUnit, {
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
        <GetAssignments id={ASSIGNMENT_MODAL_ID} assignments={assignments} />
      </>
    </Fade>
  );
}

export default Admin;
