import React, { useEffect, useState } from "react";
import { ref, child, onValue, DataSnapshot, set } from "firebase/database";
import database from "./../firebase";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { Container, Navbar, Table } from "react-bootstrap";
import Loader from "./loader";
import { floorDetails, homeProps, valuesDetails } from "./interface";
import TableHeader from "./table";
import UnitStatus from "./unit";
import { compareSortObjects, HHType, STATUS_CODES } from "./util";

function Home({ postalcode, name }: homeProps) {
  const [floors, setFloors] = useState<Array<floorDetails>>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isFeedback, setIsFeedback] = useState<boolean>(false);
  const [values, setValues] = useState<Object>({});
  const postalReference = child(ref(database), `/${postalcode}/units`);
  const postalFeedback = child(ref(database), `/${postalcode}/feedback`);

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

  const handleClick = (_: React.MouseEvent<HTMLElement>, isModal: boolean) => {
    toggleModal(isModal);
  };

  const handleClickModal = (
    _: React.MouseEvent<HTMLElement>,
    floor: String,
    unit: String
  ) => {
    const floorUnits = floors.find((e) => e.floor === floor);
    const unitDetails = floorUnits?.units.find((e) => e.number === unit);
    setValues({
      ...values,
      floor: floor,
      unit: unit,
      type: unitDetails?.type,
      note: unitDetails?.note,
      status: unitDetails?.status
    });
    toggleModal(true);
  };

  const handleSubmitClick = (event: React.FormEvent<HTMLElement>) => {
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

  const handleClickFeedback = (event: React.MouseEvent<HTMLElement>) => {
    toggleModal(false);
  };

  const handleSubmitFeedback = (event: React.FormEvent<HTMLElement>) => {
    const details = values as valuesDetails;
    set(ref(database, `/${postalcode}/feedback`), details.feedback);
    toggleModal(false);
  };

  const onFormChange = (e: React.ChangeEvent<HTMLElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    setValues({ ...values, [name]: value });
  };

  useEffect(() => {
    document.title = `${name}`;
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
  if (floors.length === 0) {
    return <Loader />;
  }
  return (
    <>
      <Navbar bg="light" expand="sm">
        <Container fluid>
          <Navbar.Brand>{name}</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse
            id="basic-navbar-nav"
            className="justify-content-end"
          >
            <Form className="d-flex">
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
            </Form>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Table bordered responsive="sm">
        <TableHeader
          name={`${name}`}
          postalcode={`${postalcode}`}
          floors={floors}
        />
        <tbody>
          {floors &&
            floors.map((item, index) => (
              <tr key={`row-${index}`}>
                <th
                  className="text-center"
                  key={`${index}-${item.floor}`}
                  scope="row"
                >
                  {item.floor}
                </th>
                {item.units.map((element, _) => (
                  <td
                    align="center"
                    onClick={(event) =>
                      handleClickModal(event, item.floor, element.number)
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
            <Form.Group className="mb-3" controlId="formBasicFeedbackTextArea">
              <Form.Control
                onChange={onFormChange}
                name="feedback"
                as="textarea"
                rows={5}
                aria-label="With textarea"
                value={`${(values as valuesDetails).feedback}}`}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={(e) => handleClick(e, false)}>
              Close
            </Button>
            <Button type="submit" variant="primary">
              Save
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      <Modal show={isOpen}>
        <Modal.Header>
          <Modal.Title>{`# ${(values as valuesDetails).floor} - ${
            (values as valuesDetails).unit
          }`}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitClick}>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="formBasicStatusCheckbox">
              <Form.Check
                inline
                onChange={onFormChange}
                name="status"
                type="radio"
                label="Done"
                value={STATUS_CODES.DONE}
                defaultChecked={
                  (values as valuesDetails).status === STATUS_CODES.DONE
                }
                id={`status-${STATUS_CODES.DONE}`}
              />
              <Form.Check
                inline
                onChange={onFormChange}
                label="Not 🏠"
                name="status"
                type="radio"
                value={STATUS_CODES.NOT_HOME}
                defaultChecked={
                  (values as valuesDetails).status === STATUS_CODES.NOT_HOME
                }
                id={`status-${STATUS_CODES.NOT_HOME}`}
              />
              <Form.Check
                inline
                onChange={onFormChange}
                label="Not 🏠 2️⃣"
                name="status"
                type="radio"
                value={STATUS_CODES.STILL_NOT_HOME}
                defaultChecked={
                  (values as valuesDetails).status ===
                  STATUS_CODES.STILL_NOT_HOME
                }
                id={`status-${STATUS_CODES.STILL_NOT_HOME}`}
              />
              <Form.Check
                inline
                onChange={onFormChange}
                label="DNC"
                name="status"
                type="radio"
                value={STATUS_CODES.DO_NOT_CALL}
                defaultChecked={
                  (values as valuesDetails).status === STATUS_CODES.DO_NOT_CALL
                }
                id={`status-${STATUS_CODES.DO_NOT_CALL}`}
              />
              <Form.Check
                inline
                onChange={onFormChange}
                label="Invalid"
                name="status"
                type="radio"
                value={STATUS_CODES.INVALID}
                defaultChecked={
                  (values as valuesDetails).status === STATUS_CODES.INVALID
                }
                id={`status-${STATUS_CODES.INVALID}`}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicSelect">
              <Form.Label>Household</Form.Label>
              <Form.Select
                onChange={onFormChange}
                name="type"
                aria-label="Default select example"
                value={`${(values as valuesDetails).type}`}
              >
                <HHType />
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicTextArea">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                onChange={onFormChange}
                name="note"
                as="textarea"
                rows={3}
                aria-label="With textarea"
                value={`${(values as valuesDetails).note}`}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={(e) => handleClick(e, true)}>
              Close
            </Button>
            <Button type="submit" variant="primary">
              Save
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}

export default Home;
