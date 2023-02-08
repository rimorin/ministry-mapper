import { MouseEvent, ChangeEvent, FormEvent, useEffect, useState } from "react";
import { ref, child, onValue, set, update } from "firebase/database";
import { database } from "../firebase";
import {
  Button,
  Collapse,
  Container,
  Fade,
  Form,
  Modal,
  Navbar,
  OverlayTrigger,
  Table
} from "react-bootstrap";
import { floorDetails, valuesDetails, Policy } from "./interface";
import TableHeader from "./table";
import UnitStatus from "./unit";
import {
  pollingFunction,
  DEFAULT_FLOOR_PADDING,
  errorHandler,
  getMaxUnitLength,
  Legend,
  ModalUnitTitle,
  NavBarBranding,
  NOT_HOME_STATUS_CODES,
  parseHHLanguages,
  processHHLanguages,
  RELOAD_CHECK_INTERVAL_MS,
  RELOAD_INACTIVITY_DURATION,
  STATUS_CODES,
  ZeroPad,
  checkTraceLangStatus,
  checkTraceRaceStatus,
  processAddressData,
  ExpiryTimePopover,
  EnvironmentIndicator,
  getCompletedPercent
} from "./util";
import {
  DncDateField,
  GenericTextAreaField,
  HHLangField,
  HHNotHomeField,
  HHStatusField,
  HHTypeField,
  ModalFooter
} from "./form";
import Loader from "./loader";
import { RacePolicy, LanguagePolicy } from "./policies";
import { useRollbar } from "@rollbar/react";
import "react-calendar/dist/Calendar.css";
import "../css/slip.css";
import "../css/common.css";

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

  const toggleLegend = () => {
    setShowLegend(!showLegend);
  };

  const handleSubmitFeedback = async (event: FormEvent<HTMLElement>) => {
    event.preventDefault();
    const details = values as valuesDetails;
    setIsSaving(true);
    try {
      await pollingFunction(() =>
        set(ref(database, `/${postalcode}/feedback`), details.feedback)
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
    const postalNameReference = child(ref(database), `/${postalcode}/name`);
    const postalUnitReference = child(ref(database), `/${postalcode}/units`);
    const postalZipReference = child(ref(database), `/${postalcode}/x_zip`);
    const postalFeedbackReference = child(
      ref(database),
      `/${postalcode}/feedback`
    );

    const processData = async (data: any) => {
      setFloors(await processAddressData(postalcode, data));
    };

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
    onValue(
      postalNameReference,
      (snapshot) => {
        if (snapshot.exists()) {
          const postalData = snapshot.val();
          setPostalName(postalData);
          document.title = postalData;
        }
      },
      { onlyOnce: true }
    );
    onValue(postalUnitReference, (snapshot) => {
      if (snapshot.exists()) {
        processData(snapshot.val());
      }
      setIsPostalLoading(false);
    });
    onValue(postalFeedbackReference, (snapshot) => {
      if (snapshot.exists()) {
        setValues((values) => ({ ...values, feedback: snapshot.val() }));
      }
    });
    onValue(
      postalZipReference,
      (snapshot) => {
        if (snapshot.exists()) {
          const postalZip = snapshot.val();
          setPostalZip(postalZip);
        }
      },
      { onlyOnce: true }
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

    setTimeout(refreshPage, RELOAD_CHECK_INTERVAL_MS);
  }, [tokenEndtime, postalcode, congregationcode, maxTries, homeLanguage]);
  if (isPostalLoading) return <Loader />;
  const maxUnitNumberLength = getMaxUnitLength(floors);
  const completedPercent = getCompletedPercent(policy as Policy, floors);
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
              <OverlayTrigger
                trigger="click"
                placement="auto"
                overlay={ExpiryTimePopover(tokenEndtime)}
                rootClose={true}
              >
                <Button className="me-2 mb-1 fluid-button">Time</Button>
              </OverlayTrigger>
              <Button className="me-2 mb-1 fluid-button" onClick={toggleLegend}>
                Legend
              </Button>
              <Button
                className="me-2 mb-1 fluid-button"
                onClick={() => {
                  window.open(
                    `http://maps.google.com.sg/maps?q=${zipcode}`,
                    "_blank"
                  );
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
        <div className="sticky-body">
          <Table bordered striped hover className="sticky-table">
            <TableHeader floors={floors} maxUnitNumber={maxUnitNumberLength} />
            <tbody>
              {floors &&
                floors.map((item, index) => (
                  <tr key={`row-${index}`}>
                    <th
                      className="sticky-left-cell text-center align-middle"
                      key={`${index}-${item.floor}`}
                      scope="row"
                    >
                      {ZeroPad(item.floor, DEFAULT_FLOOR_PADDING)}
                    </th>
                    {item.units.map((element, _) => (
                      <td
                        className={`text-center align-middle inline-cell ${policy?.getUnitColor(
                          element,
                          completedPercent.completedValue
                        )}`}
                        onClick={(event) =>
                          handleClickModal(
                            event,
                            item.floor,
                            element.number,
                            maxUnitNumberLength
                          )
                        }
                        key={`${item.floor}-${element.number}`}
                      >
                        <UnitStatus
                          type={element.type}
                          note={element.note}
                          status={element.status}
                          nhcount={element.nhcount}
                          languages={element.languages}
                          trackRace={trackRace}
                          trackLanguages={trackLanguages}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </Table>
        </div>
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
