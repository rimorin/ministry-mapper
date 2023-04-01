import {
  MouseEvent,
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
  useMemo,
  useCallback
} from "react";
import { ref, child, onValue, set, update } from "firebase/database";
import { database } from "../../firebase";
import {
  Button,
  Collapse,
  Container,
  Fade,
  Form,
  Modal,
  Navbar
} from "react-bootstrap";
import { floorDetails, valuesDetails, Policy } from "../../utils/interface";
import { PublisherTerritoryTable } from "../../components/table";
import {
  DncDateField,
  GenericTextAreaField,
  HHLangField,
  HHNotHomeField,
  HHStatusField,
  HHTypeField,
  ModalFooter,
  ModalUnitTitle
} from "../../components/form";
import { RacePolicy, LanguagePolicy } from "../../utils/policies";
import { useRollbar } from "@rollbar/react";
import {
  ZeroPad,
  pollingFunction,
  errorHandler,
  processHHLanguages,
  processAddressData,
  checkTraceLangStatus,
  checkTraceRaceStatus,
  getMaxUnitLength,
  getCompletedPercent,
  parseHHLanguages,
  SetPollerInterval
} from "../../utils/helpers";
import {
  Legend,
  EnvironmentIndicator,
  NavBarBranding,
  ExpiryButton
} from "../../components/navigation";
import { Loader } from "../../components/static";
import {
  DEFAULT_FLOOR_PADDING,
  NOT_HOME_STATUS_CODES,
  STATUS_CODES,
  RELOAD_INACTIVITY_DURATION,
  RELOAD_CHECK_INTERVAL_MS,
  TERRITORY_TYPES
} from "../../utils/constants";
import "../../css/slip.css";

const Slip = ({
  tokenEndtime = 0,
  postalcode = "",
  congregationcode = "",
  maxTries = 0,
  homeLanguage = ""
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isFeedback, setIsFeedback] = useState<boolean>(false);
  const [showLegend, setShowLegend] = useState<boolean>(false);
  const [isPostalLoading, setIsPostalLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isNotHome, setIsNotHome] = useState<boolean>(false);
  const [isDnc, setIsDnc] = useState<boolean>(false);
  const [trackRace, setTrackRace] = useState<boolean>(true);
  const [trackLanguages, setTrackLanguages] = useState<boolean>(true);
  const [floors, setFloors] = useState<Array<floorDetails>>([]);
  const [postalName, setPostalName] = useState<String>();
  const [postalZip, setPostalZip] = useState<String>();
  const [values, setValues] = useState<Object>({});
  const [policy, setPolicy] = useState<Policy>();
  const [territoryType, setTerritoryType] = useState<number>(
    TERRITORY_TYPES.PUBLIC
  );
  const rollbar = useRollbar();

  const toggleModal = (isModal: boolean) => {
    if (isModal) {
      setIsOpen(!isOpen);
    } else {
      setIsFeedback(!isFeedback);
    }
  };

  const handleClick = (_: MouseEvent<HTMLElement>, isModal: boolean) => {
    toggleModal(isModal);
  };

  const handleClickModal = (
    _: MouseEvent<HTMLElement>,
    floor: String,
    unit: String,
    maxUnitNumber: number
  ) => {
    const floorUnits = floors.find((e) => e.floor === floor);
    const unitDetails = floorUnits?.units.find((e) => e.number === unit);
    const unitStatus = unitDetails?.status;
    setValues({
      ...values,
      floor: floor,
      floorDisplay: ZeroPad(floor, DEFAULT_FLOOR_PADDING),
      unit: unit,
      unitDisplay: ZeroPad(unit, maxUnitNumber),
      type: unitDetails?.type,
      note: unitDetails?.note,
      status: unitDetails?.status,
      nhcount: unitDetails?.nhcount || NOT_HOME_STATUS_CODES.DEFAULT,
      languages: unitDetails?.languages,
      dnctime: unitDetails?.dnctime
    });
    setIsNotHome(unitStatus === STATUS_CODES.NOT_HOME);
    setIsDnc(unitStatus === STATUS_CODES.DO_NOT_CALL);
    toggleModal(true);
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
            `/${postalcode}/units/${details.floor}/${details.unit}`
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
      toggleModal(true);
    } catch (error) {
      errorHandler(error, rollbar);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClickFeedback = (event: MouseEvent<HTMLElement>) => {
    toggleModal(false);
  };

  const toggleLegend = useCallback(() => {
    setShowLegend(!showLegend);
  }, [showLegend]);

  const handleSubmitFeedback = async (event: FormEvent<HTMLElement>) => {
    event.preventDefault();
    const details = values as valuesDetails;
    setIsSaving(true);
    try {
      await pollingFunction(() =>
        set(ref(database, `/${postalcode}/feedback`), details.feedback)
      );
      if (details.feedback)
        rollbar.info(
          `Publisher feedback on postalcode ${postalcode} of the ${congregationcode} congregation: ${details.feedback}`
        );
      toggleModal(false);
    } catch (error) {
      errorHandler(error, rollbar);
    } finally {
      setIsSaving(false);
    }
  };

  const onFormChange = (e: ChangeEvent<HTMLElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    setValues({ ...values, [name]: value });
  };

  const onLanguageChange = (languages: any[]) => {
    setValues({ ...values, languages: processHHLanguages(languages) });
  };

  useEffect(() => {
    checkTraceLangStatus(congregationcode).then((snapshot) => {
      const isTrackLanguages = snapshot.val();
      setTrackLanguages(isTrackLanguages);
      if (isTrackLanguages) {
        const languagePolicy = new LanguagePolicy();
        languagePolicy.maxTries = maxTries;
        languagePolicy.homeLanguage = homeLanguage;
        setPolicy(languagePolicy);
      }
    });
    checkTraceRaceStatus(congregationcode).then((snapshot) => {
      const isTrackRace = snapshot.val();
      setTrackRace(isTrackRace);
      if (isTrackRace) {
        const racePolicy = new RacePolicy();
        racePolicy.maxTries = maxTries;
        setPolicy(racePolicy);
      }
    });

    const processData = async (data: any) => {
      setFloors(await processAddressData(postalcode, data.units));
    };
    const postalDataReference = child(ref(database), `/${postalcode}`);
    const pollerId = SetPollerInterval();
    onValue(postalDataReference, (snapshot) => {
      if (snapshot.exists()) {
        const dataSnapshot = snapshot.val();
        processData(dataSnapshot);
        setValues((values) => ({ ...values, feedback: dataSnapshot.feedback }));
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
  return (
    <Fade appear={true} in={true}>
      <>
        <Legend showLegend={showLegend} hideFunction={toggleLegend} />
        <EnvironmentIndicator />
        <Navbar bg="light" expand="sm">
          <Container fluid>
            <NavBarBranding naming={`${postalName}`} />
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse
              id="basic-navbar-nav"
              className="justify-content-end mt-1"
            >
              <ExpiryButton endtime={tokenEndtime} />
              <Button className="me-2 mb-1 fluid-button" onClick={toggleLegend}>
                Legend
              </Button>
              <Button
                className="me-2 mb-1 fluid-button"
                onClick={() => {
                  window.open(`http://maps.google.com.sg/maps?q=${zipcode}`);
                }}
              >
                Direction
              </Button>
              <Button
                className="me-2 mb-1 fluid-button"
                onClick={handleClickFeedback}
              >
                Feedback
              </Button>
            </Navbar.Collapse>
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
            handleClickModal(
              event,
              floor || "",
              unitno || "",
              maxUnitNumberLength
            );
          }}
        />
        <Modal show={isFeedback}>
          <Modal.Header>
            <Modal.Title>{`Feedback on ${postalName}`}</Modal.Title>
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
              handleClick={(e) => handleClick(e, false)}
              isSaving={isSaving}
            />
          </Form>
        </Modal>
        <Modal show={isOpen}>
          <ModalUnitTitle
            unit={`${(values as valuesDetails).unitDisplay}`}
            floor={`${(values as valuesDetails).floorDisplay}`}
            name={`${postalName}`}
            type={territoryType}
          />
          <Form onSubmit={handleSubmitClick}>
            <Modal.Body>
              <HHStatusField
                handleGroupChange={(toggleValue, _) => {
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
                    handleGroupChange={(toggleValue, _) => {
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
              handleClick={(e) => handleClick(e, true)}
              isSaving={isSaving}
            />
          </Form>
        </Modal>
      </>
    </Fade>
  );
};

export default Slip;
