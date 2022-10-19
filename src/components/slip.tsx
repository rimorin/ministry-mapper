import { MouseEvent, ChangeEvent, FormEvent, useEffect, useState } from "react";
import { ref, child, onValue, set } from "firebase/database";
import { database } from "../firebase";
import {
  Button,
  Collapse,
  Container,
  Fade,
  Form,
  Modal,
  Navbar,
  Table
} from "react-bootstrap";
import { floorDetails, valuesDetails } from "./interface";
import TableHeader from "./table";
import UnitStatus from "./unit";
import {
  connectionTimeout,
  DEFAULT_FLOOR_PADDING,
  errorHandler,
  getMaxUnitLength,
  Legend,
  ModalUnitTitle,
  NavBarBranding,
  NOT_HOME_STATUS_CODES,
  RELOAD_CHECK_INTERVAL_MS,
  RELOAD_INACTIVITY_DURATION,
  STATUS_CODES,
  ZeroPad
} from "./util";
import {
  GenericTextAreaField,
  HHNotHomeField,
  HHStatusField,
  HHTypeField,
  ModalFooter
} from "./form";
import { setContext } from "@sentry/react";
import Loader from "./loader";

const Slip = ({ token = "", postalcode = "" }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isFeedback, setIsFeedback] = useState<boolean>(false);
  const [showLegend, setShowLegend] = useState<boolean>(false);
  const [isPostalLoading, setIsPostalLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isNotHome, setIsNotHome] = useState<boolean>(false);
  const [floors, setFloors] = useState<Array<floorDetails>>([]);
  const [postalName, setPostalName] = useState<String>();
  const [values, setValues] = useState<Object>({});

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

  const processData = (data: any) => {
    const dataList = [];
    for (const floor in data) {
      const unitsDetails = [];
      const units = data[floor];
      for (const unit in units) {
        unitsDetails.push({
          number: unit,
          note: units[unit]["note"],
          type: units[unit]["type"],
          status: units[unit]["status"],
          nhcount: units[unit]["nhcount"] || NOT_HOME_STATUS_CODES.DEFAULT
        });
      }
      dataList.unshift({ floor: floor, units: unitsDetails });
    }
    setFloors(dataList);
  };

  const onTypeChange = (types: any[]) => {
    setValues({ ...values, types: types });
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
      types: unitDetails?.type ? unitDetails?.type.split(",") : []
    });
    setIsNotHome(unitStatus === STATUS_CODES.NOT_HOME);
    toggleModal(true);
  };

  const handleSubmitClick = async (event: FormEvent<HTMLElement>) => {
    event.preventDefault();
    const details = values as valuesDetails;
    setIsSaving(true);
    try {
      const timeoutId = connectionTimeout();
      await set(
        ref(database, `/${postalcode}/units/${details.floor}/${details.unit}`),
        {
          type: details.types.join(),
          note: details.note,
          status: details.status,
          nhcount: details.nhcount
        }
      );
      clearTimeout(timeoutId);
      toggleModal(true);
    } catch (error) {
      errorHandler(error);
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
    const timeoutId = connectionTimeout();
    try {
      await set(ref(database, `/${postalcode}/feedback`), details.feedback);
      toggleModal(false);
    } catch (error) {
      errorHandler(error);
    } finally {
      clearTimeout(timeoutId);
      setIsSaving(false);
    }
  };

  const onFormChange = (e: ChangeEvent<HTMLElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    setValues({ ...values, [name]: value });
  };

  useEffect(() => {
    setContext("publisher", {
      token: token,
      postalcode: postalcode
    });
    const postalNameReference = child(ref(database), `/${postalcode}/name`);
    const postalUnitReference = child(ref(database), `/${postalcode}/units`);
    const postalFeedbackReference = child(
      ref(database),
      `/${postalcode}/feedback`
    );
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
  }, [token, postalcode]);
  if (isPostalLoading) return <Loader />;
  const maxUnitNumberLength = getMaxUnitLength(floors);
  return (
    <Fade appear={true} in={true}>
      <div>
        <Legend showLegend={showLegend} hideFunction={toggleLegend} />
        <Navbar bg="light" expand="sm">
          <Container fluid>
            <NavBarBranding naming={`${postalName}`} />
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse
              id="basic-navbar-nav"
              className="justify-content-end mt-1"
            >
              <Button className="me-2" onClick={toggleLegend}>
                Legend
              </Button>
              <Button
                className="me-2"
                onClick={() => {
                  window.open(
                    `http://maps.google.com.sg/maps?q=${postalcode}`,
                    "_blank"
                  );
                }}
              >
                Direction
              </Button>
              <Button className="me-2" onClick={handleClickFeedback}>
                Feedback
              </Button>
            </Navbar.Collapse>
          </Container>
        </Navbar>
        <Table
          bordered
          striped
          hover
          responsive="sm"
          style={{ height: "75vh" }}
        >
          <TableHeader floors={floors} maxUnitNumber={maxUnitNumberLength} />
          <tbody>
            {floors &&
              floors.map((item, index) => (
                <tr key={`row-${index}`}>
                  <th
                    className="text-center align-middle"
                    key={`${index}-${item.floor}`}
                    scope="row"
                  >
                    {ZeroPad(item.floor, DEFAULT_FLOOR_PADDING)}
                  </th>
                  {item.units.map((element, _) => (
                    <td
                      style={{ whiteSpace: "nowrap" }}
                      className="text-center align-middle"
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
                      />
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </Table>
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
                  setIsNotHome(false);
                  if (toggleValue.toString() === STATUS_CODES.NOT_HOME) {
                    setIsNotHome(true);
                  }
                  setValues({
                    ...values,
                    nhcount: NOT_HOME_STATUS_CODES.DEFAULT,
                    status: toggleValue
                  });
                }}
                changeValue={`${(values as valuesDetails).status}`}
              />
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
              <HHTypeField
                handleChangeValues={onTypeChange}
                changeValues={(values as valuesDetails).types}
              />
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
      </div>
    </Fade>
  );
};

export default Slip;