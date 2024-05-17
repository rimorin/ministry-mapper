import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { ref, child, onValue } from "firebase/database";
import { database } from "../../firebase";
import { Container, Fade, Navbar, NavDropdown } from "react-bootstrap";
import {
  OptionProps,
  floorDetails,
  latlongInterface,
  valuesDetails
} from "../../utils/interface";
import PublisherTerritoryTable from "../../components/table/publisher";
import { Policy } from "../../utils/policies";
import ZeroPad from "../../utils/helpers/zeropad";
import processAddressData from "../../utils/helpers/processadddata";
import getMaxUnitLength from "../../utils/helpers/maxunitlength";
import getCompletedPercent from "../../utils/helpers/getcompletedpercent";
import getOptions from "../../utils/helpers/getcongoptions";
import Legend from "../../components/navigation/legend";
import EnvironmentIndicator from "../../components/navigation/environment";
import NavBarBranding from "../../components/navigation/branding";
import Loader from "../../components/statics/loader";
import {
  DEFAULT_FLOOR_PADDING,
  RELOAD_INACTIVITY_DURATION,
  RELOAD_CHECK_INTERVAL_MS,
  TERRITORY_TYPES,
  USER_ACCESS_LEVELS,
  WIKI_CATEGORIES,
  DEFAULT_CONGREGATION_OPTION_IS_MULTIPLE,
  DEFAULT_MAP_DIRECTION_CONGREGATION_LOCATION,
  DEFAULT_COORDINATES
} from "../../utils/constants";
import "../../css/slip.css";
import Countdown from "react-countdown";
import InfoImg from "../../assets/information.svg?react";
import ModalManager from "@ebay/nice-modal-react";
import UpdateAddressFeedback from "../../components/modal/updateaddfeedback";
import UpdateAddressInstructions from "../../components/modal/instructions";
import UpdateUnitStatus from "../../components/modal/updatestatus";
import GetDirection from "../../utils/helpers/directiongenerator";
import getOptionIsMultiSelect from "../../utils/helpers/getoptionmultiselect";
import getCongregationOrigin from "../../utils/helpers/getcongorigin";
const Slip = ({
  tokenEndtime = 0,
  postalcode = "",
  congregationcode = "",
  maxTries = 0,
  pubName = ""
}) => {
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

  const handleUnitUpdate = (
    floor: string,
    unit: string,
    maxUnitNumber: number,
    options: Array<OptionProps>
  ) => {
    const floorUnits = floors.find((e) => e.floor === floor);
    const unitDetails = floorUnits?.units.find((e) => e.number === unit);

    ModalManager.show(UpdateUnitStatus, {
      options: options,
      addressName: postalName,
      // CONDUCTOR ACL because publishers should be able to update status
      userAccessLevel: USER_ACCESS_LEVELS.CONDUCTOR.CODE,
      territoryType: territoryType,
      congregation: congregationcode,
      postalCode: postalcode,
      unitNo: unit,
      unitNoDisplay: ZeroPad(unit, maxUnitNumber),
      floor: floor,
      floorDisplay: ZeroPad(floor, DEFAULT_FLOOR_PADDING),
      unitDetails: unitDetails,
      addressData: undefined,
      defaultOption: policy.defaultType,
      isMultiselect: policy.isMultiselect,
      origin: policy.origin
    });
  };

  const toggleLegend = useCallback(() => {
    setShowLegend(!showLegend);
  }, [showLegend]);

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
    Promise.all([
      getOptions(congregationcode),
      getOptionIsMultiSelect(congregationcode),
      getCongregationOrigin(congregationcode)
    ]).then(([options, isMultiselect, origin]) => {
      setOptions(options);
      setPolicy(
        new Policy(
          undefined,
          options,
          maxTries,
          isMultiselect.exists()
            ? isMultiselect.val()
            : DEFAULT_CONGREGATION_OPTION_IS_MULTIPLE,
          origin.exists()
            ? origin.val()
            : DEFAULT_MAP_DIRECTION_CONGREGATION_LOCATION
        )
      );
      onValue(
        child(ref(database), `addresses/${congregationcode}/${postalcode}`),
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
            processAddressData(
              congregationcode,
              postalcode,
              postalSnapshot.units
            )
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
    });

    document.body.addEventListener("mousemove", setActivityTime);
    document.body.addEventListener("keypress", setActivityTime);
    document.body.addEventListener("touchstart", setActivityTime);
    setTimeout(refreshPage, RELOAD_CHECK_INTERVAL_MS);
  }, [tokenEndtime, postalcode, congregationcode, maxTries]);

  const maxUnitNumberLength = useMemo(() => getMaxUnitLength(floors), [floors]);
  const completedPercent = useMemo(
    () => getCompletedPercent(policy as Policy, floors),
    [policy, floors]
  );
  if (isLoading) return <Loader />;

  const instructions = (values as valuesDetails).instructions;
  return (
    <Fade appear={true} in={true}>
      <>
        <Legend showLegend={showLegend} hideFunction={toggleLegend} />
        <EnvironmentIndicator
          environment={import.meta.env.VITE_ROLLBAR_ENVIRONMENT}
        />
        <Navbar bg="light" expand="sm">
          <Container fluid>
            <NavBarBranding naming={postalName as string} />
            <NavDropdown
              title={
                <InfoImg className={`${instructions ? "blinking" : ""}`} />
              }
              align={{ sm: "end" }}
            >
              {instructions && (
                <NavDropdown.Item
                  onClick={() =>
                    ModalManager.show(UpdateAddressInstructions, {
                      congregation: congregationcode,
                      postalCode: postalcode,
                      userAccessLevel: USER_ACCESS_LEVELS.READ_ONLY.CODE,
                      addressName: postalName as string,
                      instructions: instructions,
                      userName: ""
                    })
                  }
                >
                  <span className="text-highlight">Instructions</span>
                </NavDropdown.Item>
              )}
              <NavDropdown.Item onClick={toggleLegend}>Legend</NavDropdown.Item>
              <NavDropdown.Item
                onClick={() => window.open(GetDirection(coordinates), "_blank")}
              >
                Direction
              </NavDropdown.Item>
              <NavDropdown.Item
                onClick={() =>
                  ModalManager.show(UpdateAddressFeedback, {
                    footerSaveAcl: USER_ACCESS_LEVELS.CONDUCTOR.CODE,
                    name: postalcode,
                    congregation: congregationcode,
                    postalCode: postalcode,
                    currentFeedback: (values as valuesDetails).feedback,
                    currentName: pubName,
                    helpLink: WIKI_CATEGORIES.PUBLISHER_ADDRESS_FEEDBACK
                  })
                }
              >
                Feedback
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item className="fluid-bolding fluid-text" disabled>
                <Countdown
                  className="m-1"
                  date={tokenEndtime}
                  daysInHours={true}
                  renderer={(props) => {
                    const daysDisplay =
                      props.days !== 0 ? <>{props.days}d </> : <></>;
                    const hoursDisplay =
                      props.hours !== 0 ? <>{props.hours}h </> : <></>;
                    const minsDisplay =
                      props.minutes !== 0 ? <>{props.minutes}m </> : <></>;
                    return (
                      <>
                        ⏱️{" "}
                        <span>
                          {daysDisplay}
                          {hoursDisplay}
                          {minsDisplay}
                          {props.formatted.seconds}s
                        </span>
                      </>
                    );
                  }}
                />
              </NavDropdown.Item>
            </NavDropdown>
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
      </>
    </Fade>
  );
};

export default Slip;
