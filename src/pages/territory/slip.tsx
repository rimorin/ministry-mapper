import { useEffect, useState, useMemo, useCallback } from "react";
import { ref, child, onValue } from "firebase/database";
import { database } from "../../firebase";
import { Container, Fade, Navbar, NavDropdown } from "react-bootstrap";
import { floorDetails, valuesDetails, Policy } from "../../utils/interface";
import { PublisherTerritoryTable } from "../../components/table";
import { RacePolicy, LanguagePolicy } from "../../utils/policies";
import {
  ZeroPad,
  processAddressData,
  checkTraceLangStatus,
  checkTraceRaceStatus,
  getMaxUnitLength,
  getCompletedPercent,
  SetPollerInterval
} from "../../utils/helpers";
import {
  Legend,
  EnvironmentIndicator,
  NavBarBranding
} from "../../components/navigation";
import { Loader } from "../../components/static";
import {
  DEFAULT_FLOOR_PADDING,
  RELOAD_INACTIVITY_DURATION,
  RELOAD_CHECK_INTERVAL_MS,
  TERRITORY_TYPES,
  USER_ACCESS_LEVELS,
  WIKI_CATEGORIES
} from "../../utils/constants";
import "../../css/slip.css";
import Countdown from "react-countdown";
import { ReactComponent as InfoImg } from "../../assets/information.svg";
import ModalManager from "@ebay/nice-modal-react";
import {
  UpdateAddressFeedback,
  UpdateAddressInstructions,
  UpdateUnitStatus
} from "../../components/modals";
const Slip = ({
  tokenEndtime = 0,
  postalcode = "",
  congregationcode = "",
  maxTries = 0,
  homeLanguage = "",
  pubName = ""
}) => {
  const [showLegend, setShowLegend] = useState<boolean>(false);
  const [isPostalLoading, setIsPostalLoading] = useState<boolean>(true);
  const [trackRace, setTrackRace] = useState<boolean>(true);
  const [trackLanguages, setTrackLanguages] = useState<boolean>(true);
  const [floors, setFloors] = useState<Array<floorDetails>>([]);
  const [postalName, setPostalName] = useState<string>();
  const [postalZip, setPostalZip] = useState<string>();
  const [values, setValues] = useState<object>({});
  const [policy, setPolicy] = useState<Policy>();
  const [territoryType, setTerritoryType] = useState<number>(
    TERRITORY_TYPES.PUBLIC
  );

  const handleUnitUpdate = (
    floor: string,
    unit: string,
    maxUnitNumber: number
  ) => {
    const floorUnits = floors.find((e) => e.floor === floor);
    const unitDetails = floorUnits?.units.find((e) => e.number === unit);

    ModalManager.show(UpdateUnitStatus, {
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
      trackRace: trackRace,
      trackLanguages: trackLanguages,
      unitDetails: unitDetails,
      addressData: undefined
    });
  };

  const toggleLegend = useCallback(() => {
    setShowLegend(!showLegend);
  }, [showLegend]);

  useEffect(() => {
    checkTraceLangStatus(congregationcode).then((snapshot) => {
      const isTrackLanguages = snapshot.val();
      setTrackLanguages(isTrackLanguages);
      if (isTrackLanguages) {
        setPolicy(new LanguagePolicy(undefined, maxTries, homeLanguage));
      }
    });
    checkTraceRaceStatus(congregationcode).then((snapshot) => {
      const isTrackRace = snapshot.val();
      setTrackRace(isTrackRace);
      if (isTrackRace) {
        setPolicy(new RacePolicy(undefined, maxTries));
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const processData = async (data: any) => {
      setFloors(await processAddressData(postalcode, data.units));
    };
    const postalDataReference = child(ref(database), `/${postalcode}`);
    const pollerId = SetPollerInterval();
    onValue(postalDataReference, (snapshot) => {
      if (snapshot.exists()) {
        const dataSnapshot = snapshot.val();
        processData(dataSnapshot);
        setValues((values) => ({
          ...values,
          feedback: dataSnapshot.feedback,
          instructions: dataSnapshot.instructions
        }));
        setPostalZip(dataSnapshot.x_zip);
        setPostalName(dataSnapshot.name);
        setTerritoryType(dataSnapshot.type);
        document.title = dataSnapshot.name;
      }
      clearInterval(pollerId);
      setIsPostalLoading(false);
    });

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

    setTimeout(refreshPage, RELOAD_CHECK_INTERVAL_MS);
  }, [tokenEndtime, postalcode, congregationcode, maxTries, homeLanguage]);

  const maxUnitNumberLength = useMemo(() => getMaxUnitLength(floors), [floors]);
  const completedPercent = useMemo(
    () => getCompletedPercent(policy as Policy, floors),
    [policy, floors]
  );
  if (isPostalLoading) return <Loader />;

  const zipcode = postalZip == null ? postalcode : postalZip;
  const instructions = (values as valuesDetails).instructions;
  return (
    <Fade appear={true} in={true}>
      <>
        <Legend showLegend={showLegend} hideFunction={toggleLegend} />
        <EnvironmentIndicator />
        <Navbar bg="light" expand="sm">
          <Container fluid>
            <NavBarBranding naming={`${postalName}`} />
            <NavDropdown
              title={
                <InfoImg className={`${instructions ? "blinking" : ""}`} />
              }
              align="end"
            >
              {instructions && (
                <NavDropdown.Item
                  onClick={() =>
                    ModalManager.show(UpdateAddressInstructions, {
                      congregation: congregationcode,
                      postalCode: postalcode,
                      userAccessLevel: USER_ACCESS_LEVELS.READ_ONLY.CODE,
                      addressName: `${postalName}`,
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
                onClick={() =>
                  window.open(`http://maps.google.com.sg/maps?q=${zipcode}`)
                }
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
          trackLanguages={trackLanguages}
          trackRace={trackRace}
          territoryType={territoryType}
          handleUnitStatusUpdate={(event) => {
            const { floor, unitno } = event.currentTarget.dataset;
            handleUnitUpdate(floor || "", unitno || "", maxUnitNumberLength);
          }}
        />
      </>
    </Fade>
  );
};

export default Slip;
