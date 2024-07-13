import { useEffect, useState, useMemo, useCallback, useRef, lazy } from "react";
import { ref, child, onValue, onChildRemoved, get } from "firebase/database";
import { database } from "../firebase";
import { Container, Nav, Navbar } from "react-bootstrap";
import {
  OptionProps,
  floorDetails,
  latlongInterface,
  valuesDetails
} from "../utils/interface";
import PublisherTerritoryTable from "../components/table/publisher";
import { LinkSession, Policy } from "../utils/policies";
import ZeroPad from "../utils/helpers/zeropad";
import processAddressData from "../utils/helpers/processadddata";
import getMaxUnitLength from "../utils/helpers/maxunitlength";
import getCompletedPercent from "../utils/helpers/getcompletedpercent";
import getOptions from "../utils/helpers/getcongoptions";
import Legend from "../components/navigation/legend";
import Loader from "../components/statics/loader";
import {
  DEFAULT_FLOOR_PADDING,
  RELOAD_INACTIVITY_DURATION,
  RELOAD_CHECK_INTERVAL_MS,
  TERRITORY_TYPES,
  USER_ACCESS_LEVELS,
  WIKI_CATEGORIES,
  DEFAULT_CONGREGATION_OPTION_IS_MULTIPLE,
  DEFAULT_MAP_DIRECTION_CONGREGATION_LOCATION,
  DEFAULT_COORDINATES,
  DEFAULT_CONGREGATION_MAX_TRIES
} from "../utils/constants";
import "../css/slip.css";
import InfoImg from "../assets/information.svg?react";
import FeedbackImg from "../assets/feedback.svg?react";
import MapLocationImg from "../assets/maplocation.svg?react";
import InstructionImg from "../assets/instruction.svg?react";
import TimeImg from "../assets/time.svg?react";
import ModalManager from "@ebay/nice-modal-react";
import GetDirection from "../utils/helpers/directiongenerator";
import getOptionIsMultiSelect from "../utils/helpers/getoptionmultiselect";
import getCongregationOrigin from "../utils/helpers/getcongorigin";
import { useParams } from "react-router-dom";
import InvalidPage from "../components/statics/invalidpage";
import { useRollbar } from "@rollbar/react";
import SuspenseComponent from "../components/utils/suspense";
import { usePostHog } from "posthog-js/react";

const UpdateUnitStatus = lazy(() => import("../components/modal/updatestatus"));

const UpdateAddressFeedback = lazy(
  () => import("../components/modal/updateaddfeedback")
);
const UpdateAddressInstructions = lazy(
  () => import("../components/modal/instructions")
);
const ShowExpiry = lazy(() => import("../components/modal/slipexpiry"));

const Map = () => {
  const { id, code } = useParams();
  const [isLinkExpired, setIsLinkExpired] = useState<boolean>(true);
  const [tokenEndTime, setTokenEndTime] = useState<number>(0);
  const [publisherName, setPublisherName] = useState<string>("");
  const [congregationMaxTries, setCongregationMaxTries] = useState<number>(
    DEFAULT_CONGREGATION_MAX_TRIES
  );
  const [postalcode, setPostalcode] = useState<string>("");

  const [showLegend, setShowLegend] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [floors, setFloors] = useState<Array<floorDetails>>([]);
  const [postalName, setPostalName] = useState<string>();
  const [coordinates, setCoordinates] = useState<latlongInterface>(
    DEFAULT_COORDINATES.Singapore
  );
  const [values, setValues] = useState<object>({});
  const [policy, setPolicy] = useState<Policy>(new Policy());
  const [options, setOptions] = useState<Array<OptionProps>>([]);
  const [territoryType, setTerritoryType] = useState<number>(
    TERRITORY_TYPES.PUBLIC
  );
  const currentTime = useRef<number>(new Date().getTime());
  const rollbar = useRollbar();
  const posthog = usePostHog();

  const handleUnitUpdate = (
    floor: string,
    unit: string,
    maxUnitNumber: number,
    options: Array<OptionProps>
  ) => {
    const floorUnits = floors.find((e) => e.floor === floor);
    const unitDetails = floorUnits?.units.find((e) => e.number === unit);

    ModalManager.show(SuspenseComponent(UpdateUnitStatus), {
      options: options,
      addressName: postalName,
      // CONDUCTOR ACL because publishers should be able to update status
      userAccessLevel: USER_ACCESS_LEVELS.CONDUCTOR.CODE,
      territoryType: territoryType,
      congregation: code,
      postalCode: postalcode,
      unitNo: unit,
      unitNoDisplay: ZeroPad(unit, maxUnitNumber),
      floor: floor,
      floorDisplay: ZeroPad(floor, DEFAULT_FLOOR_PADDING),
      unitDetails: unitDetails,
      addressData: undefined,
      defaultOption: policy.defaultType,
      isMultiselect: policy.isMultiselect,
      origin: policy.origin,
      publisherName: publisherName
    });
  };

  const toggleLegend = useCallback(() => {
    setShowLegend(!showLegend);
  }, [showLegend]);

  useEffect(() => {
    if (!code || !id) return;
    const getLinkData = async () => {
      const linkRef = ref(database, `links/${code}/${id}`);
      const linkSnapshot = await get(linkRef);
      if (!linkSnapshot.exists()) {
        setIsLoading(false);
        return;
      }
      const linkrec = new LinkSession(linkSnapshot.val());
      const tokenEndtime = linkrec.tokenEndtime;

      setPublisherName(linkrec.publisherName);
      setCongregationMaxTries(linkrec.maxTries);
      setPostalcode(linkrec.postalCode);
      const currentTimestamp = new Date().getTime();
      setTokenEndTime(tokenEndtime);
      const isLinkExpired = currentTimestamp > tokenEndtime;
      setIsLinkExpired(isLinkExpired);
      rollbar.configure({
        payload: {
          link: {
            id: id,
            publisher: linkrec.publisherName,
            congregation: code,
            map: linkrec.postalCode,
            maxTries: linkrec.maxTries,
            tokenEndtime: new Date(tokenEndtime).toLocaleDateString()
          }
        }
      });
      posthog?.identify(code);
      if (isLinkExpired) {
        setIsLoading(false);
        posthog?.capture("expired_link", {
          mapId: linkrec.postalCode
        });
        return;
      }
      onChildRemoved(linkRef, () => window.location.reload());
    };

    const refreshPage = () => {
      const inactivityPeriod = new Date().getTime() - currentTime.current;
      if (inactivityPeriod >= RELOAD_INACTIVITY_DURATION) {
        window.location.reload();
      } else {
        setTimeout(refreshPage, RELOAD_CHECK_INTERVAL_MS);
      }
    };
    getLinkData();

    const setActivityTime = () => {
      currentTime.current = new Date().getTime();
    };
    document.body.addEventListener("mousemove", setActivityTime);
    document.body.addEventListener("keypress", setActivityTime);
    document.body.addEventListener("touchstart", setActivityTime);
    const timeoutId = setTimeout(refreshPage, RELOAD_CHECK_INTERVAL_MS);

    return () => {
      document.body.removeEventListener("mousemove", setActivityTime);
      document.body.removeEventListener("keypress", setActivityTime);
      document.body.removeEventListener("touchstart", setActivityTime);
      clearTimeout(timeoutId);
    };
  }, [code, id]);

  useEffect(() => {
    const getMapData = async () => {
      if (!code || !postalcode) return;
      const options = await getOptions(code);
      const isMultiselect = await getOptionIsMultiSelect(code);
      const origin = await getCongregationOrigin(code);
      setOptions(options);
      setPolicy(
        new Policy(
          undefined,
          options,
          congregationMaxTries,
          isMultiselect.exists()
            ? isMultiselect.val()
            : DEFAULT_CONGREGATION_OPTION_IS_MULTIPLE,
          origin.exists()
            ? origin.val()
            : DEFAULT_MAP_DIRECTION_CONGREGATION_LOCATION
        )
      );
      onValue(
        child(ref(database), `addresses/${code}/${postalcode}`),
        (snapshot) => {
          if (snapshot.exists()) {
            const postalSnapshot = snapshot.val();
            setValues((values) => ({
              ...values,
              feedback: postalSnapshot.feedback,
              instructions: postalSnapshot.instructions
            }));
            setPostalName(postalSnapshot.name);
            setTerritoryType(postalSnapshot.type);
            setCoordinates(
              postalSnapshot.coordinates || DEFAULT_COORDINATES.Singapore
            );
            processAddressData(code, postalcode, postalSnapshot.units)
              .then((data) => {
                setFloors(data);
              })
              .finally(() => {
                setIsLoading(false);
              });
            document.title = postalSnapshot.name;
          }
        }
      );
    };

    getMapData();
  }, [postalcode, code]);

  const maxUnitNumberLength = useMemo(() => getMaxUnitLength(floors), [floors]);
  const completedPercent = useMemo(
    () => getCompletedPercent(policy as Policy, floors),
    [policy, floors]
  );
  if (isLoading) return <Loader />;
  if (isLinkExpired) {
    document.title = "Ministry Mapper";
    posthog?.capture("expired_link", {
      mapId: postalcode
    });
    return <InvalidPage />;
  }

  const instructions = (values as valuesDetails).instructions;
  return (
    <>
      <Legend showLegend={showLegend} hideFunction={toggleLegend} />
      <Navbar bg="light" expand="sm">
        <Container fluid>
          <Navbar.Brand
            className="brand-wrap d-flex align-items-center"
            style={{ width: "100%", marginRight: 0 }}
          >
            <div style={{ flex: 0, textAlign: "left", marginRight: 10 }}>
              <img
                alt=""
                src="/favicon-32x32.png"
                width="32"
                height="32"
                className="d-inline-block align-top"
              />
            </div>
            <div style={{ flex: 1, textAlign: "left" }}>
              <Navbar.Text className="fluid-bolding fluid-text">
                {postalName}
              </Navbar.Text>
            </div>
            <div style={{ flex: 0, textAlign: "right", marginLeft: 10 }}>
              <InfoImg
                onClick={() => {
                  posthog?.capture("info_button_clicked", {
                    mapId: postalcode
                  });
                  toggleLegend();
                }}
              />
            </div>
          </Navbar.Brand>
        </Container>
      </Navbar>
      <PublisherTerritoryTable
        postalCode={postalcode}
        floors={floors}
        maxUnitNumberLength={maxUnitNumberLength}
        policy={policy}
        completedPercent={completedPercent}
        territoryType={territoryType}
        handleUnitStatusUpdate={(event) => {
          const { floor, unitno } = event.currentTarget.dataset;
          handleUnitUpdate(
            floor || "",
            unitno || "",
            maxUnitNumberLength,
            options
          );
        }}
      />
      <Navbar bg="light">
        <Nav className="w-100 justify-content-between mx-4">
          <Nav.Item
            className="text-center nav-item-hover"
            onClick={() =>
              ModalManager.show(SuspenseComponent(UpdateAddressFeedback), {
                footerSaveAcl: USER_ACCESS_LEVELS.CONDUCTOR.CODE,
                name: postalcode,
                congregation: code,
                postalCode: postalcode,
                currentFeedback: (values as valuesDetails).feedback,
                currentName: publisherName,
                helpLink: WIKI_CATEGORIES.PUBLISHER_ADDRESS_FEEDBACK
              })
            }
          >
            <FeedbackImg />
            <div className="small">Feedback</div>
          </Nav.Item>
          {instructions && (
            <Nav.Item
              className="text-center nav-item-hover"
              onClick={() => {
                posthog?.capture("instructions_button_clicked", {
                  mapId: postalcode
                });
                ModalManager.show(
                  SuspenseComponent(UpdateAddressInstructions),
                  {
                    congregation: code,
                    postalCode: postalcode,
                    userAccessLevel: USER_ACCESS_LEVELS.READ_ONLY.CODE,
                    addressName: postalName as string,
                    instructions: instructions,
                    userName: ""
                  }
                );
              }}
            >
              <InstructionImg />
              <div className="small">Instructions</div>
            </Nav.Item>
          )}
          <Nav.Item
            className="text-center nav-item-hover"
            onClick={() => {
              posthog?.capture("directions_button_clicked", {
                mapId: postalcode
              });
              window.open(GetDirection(coordinates), "_blank");
            }}
          >
            <MapLocationImg />
            <div className="small">Directions</div>
          </Nav.Item>
          <Nav.Item
            className="text-center nav-item-hover"
            onClick={() => {
              posthog?.capture("expiry_button_clicked", {
                mapId: postalcode
              });
              ModalManager.show(SuspenseComponent(ShowExpiry), {
                endtime: tokenEndTime
              });
            }}
          >
            <TimeImg />
            <div>Expiry</div>
          </Nav.Item>
        </Nav>
      </Navbar>
    </>
  );
};

export default Map;
