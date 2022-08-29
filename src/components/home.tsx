import { MouseEvent, ChangeEvent, FormEvent, useEffect, useState } from "react";
import { ref, child, onValue, DataSnapshot, set, get } from "firebase/database";
import { database } from "./../firebase";
import { Button, Container, Form, Modal, Navbar, Table } from "react-bootstrap";
import Loader from "./loader";
import { floorDetails, homeProps, valuesDetails } from "./interface";
import TableHeader from "./table";
import UnitStatus from "./unit";
import {
  compareSortObjects,
  DEFAULT_FLOOR_PADDING,
  getMaxUnitLength,
  Legend,
  ModalUnitTitle,
  NavBarBranding,
  ZeroPad
} from "./util";
import {
  FeedbackField,
  HHStatusField,
  HHTypeField,
  ModalFooter,
  NoteField
} from "./form";
import { useParams } from "react-router-dom";
import InvalidPage from "./invalidpage";

function Home({ postalcode, name }: homeProps) {
  const [isLinkExpired, setIsLinkExpired] = useState<boolean>(true);
  const [floors, setFloors] = useState<Array<floorDetails>>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isFeedback, setIsFeedback] = useState<boolean>(false);
  const [showLegend, setShowLegend] = useState<boolean>(false);
  const [values, setValues] = useState<Object>({});
  const postalReference = child(ref(database), `/${postalcode}/units`);
  const postalFeedback = child(ref(database), `/${postalcode}/feedback`);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { id } = useParams();
  const linkReference = child(ref(database), `/links/${id}`);

  const toggleModal = (isModal: boolean) => {
    if (isModal) {
      setIsOpen(!isOpen);
    } else {
      setIsFeedback(!isFeedback);
    }
  };

  const processData = (data: DataSnapshot) => {
    let dataList = [];
    for (const floor in data.val()) {
      let unitsDetails = [];
      const units = data.val()[floor];
      for (const unit in units) {
        unitsDetails.push({
          number: unit,
          done: units[unit]["done"],
          dnc: units[unit]["dnc"],
          note: units[unit]["note"],
          type: units[unit]["type"],
          invalid: units[unit]["invalid"],
          not_home: units[unit]["not_home"],
          status: units[unit]["status"]
        });
      }
      dataList.push({ floor: floor, units: unitsDetails });
    }
    dataList.sort(compareSortObjects);
    setFloors(dataList);
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
    setValues({
      ...values,
      floor: floor,
      floorDisplay: ZeroPad(floor, DEFAULT_FLOOR_PADDING),
      unit: unit,
      unitDisplay: ZeroPad(unit, maxUnitNumber),
      type: unitDetails?.type,
      note: unitDetails?.note,
      status: unitDetails?.status
    });
    toggleModal(true);
  };

  const handleSubmitClick = (event: FormEvent<HTMLElement>) => {
    event.preventDefault();
    const details = values as valuesDetails;
    set(
      ref(database, `/${postalcode}/units/${details.floor}/${details.unit}`),
      {
        type: details.type,
        note: details.note,
        status: details.status
      }
    );
    toggleModal(true);
  };

  const handleClickFeedback = (event: MouseEvent<HTMLElement>) => {
    toggleModal(false);
  };

  const handleSubmitFeedback = (event: FormEvent<HTMLElement>) => {
    event.preventDefault();
    const details = values as valuesDetails;
    set(ref(database, `/${postalcode}/feedback`), details.feedback);
    toggleModal(false);
  };

  const onFormChange = (e: ChangeEvent<HTMLElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    setValues({ ...values, [name]: value });
  };

  const toggleLegend = () => {
    setShowLegend(!showLegend);
  };

  useEffect(() => {
    document.title = `${name}`;
    get(linkReference).then((snapshot) => {
      if (snapshot.exists()) {
        const currentTimestamp = new Date().getTime();
        if (currentTimestamp < snapshot.val()) {
          setIsLinkExpired(false);
        }
      }
      setIsLoading(false);
    });
    onValue(postalReference, (snapshot) => {
      if (snapshot.exists()) {
        processData(snapshot);
      }
    });
    onValue(postalFeedback, (snapshot) => {
      if (snapshot.exists()) {
        setValues({ ...values, feedback: snapshot.val() });
      }
    });
  }, []);
  if (isLoading || floors.length === 0) {
    return <Loader />;
  }
  if (isLinkExpired) {
    return <InvalidPage />;
  }
  let maxUnitNumberLength = getMaxUnitLength(floors);
  return (
    <>
      <Legend showLegend={showLegend} hideFunction={toggleLegend} />
      <Navbar bg="light" expand="sm">
        <Container fluid>
          <NavBarBranding naming={`${name}`} />
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
      <Table bordered striped hover responsive="sm" style={{ height: "75vh" }}>
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
                    />
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </Table>
      <Modal show={isFeedback}>
        <Modal.Header>
          <Modal.Title>{`Feedback on ${name}`}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitFeedback}>
          <Modal.Body>
            <FeedbackField
              handleChange={onFormChange}
              changeValue={`${(values as valuesDetails).feedback}`}
            />
          </Modal.Body>
          <ModalFooter handleClick={(e) => handleClick(e, false)} />
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
                setValues({ ...values, status: toggleValue });
              }}
              changeValue={`${(values as valuesDetails).status}`}
            />
            <HHTypeField
              handleChange={onFormChange}
              changeValue={`${(values as valuesDetails).type}`}
            />
            <NoteField
              handleChange={onFormChange}
              changeValue={`${(values as valuesDetails).note}`}
            />
          </Modal.Body>
          <ModalFooter handleClick={(e) => handleClick(e, true)} />
        </Form>
      </Modal>
    </>
  );
}

export default Home;
