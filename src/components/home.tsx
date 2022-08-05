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

function Home({ postalcode, name }: homeProps) {
  const [floors, setFloors] = useState<Array<floorDetails>>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isFeedback, setIsFeedback] = useState<boolean>(false);
  const [values, setValues] = useState<Object>({});
  const postalReference = child(ref(database), `/${postalcode}/units`);
  const postalFeedback = child(ref(database), `/${postalcode}/feedback`);

  const toggleModal = (isModal: boolean) => {
    if(isModal){
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
          invalid: units[unit]["invalid"]
        });
      }
      dataList.push({ floor: floor, units: unitsDetails });
    }
    setFloors(dataList);
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>, isModal: boolean) => {
    toggleModal(isModal);
  };

  const handleClickModal = (
    event: React.MouseEvent<HTMLElement>,
    floor: String,
    unit: String
  ) => {
    const floorUnits = floors.find((e) => e.floor === floor);
    const unitDetails = floorUnits?.units.find((e) => e.number === unit);
    setValues({
      ...values,
      floor: floor,
      unit: unit,
      done: unitDetails?.done,
      dnc: unitDetails?.dnc,
      type: unitDetails?.type,
      note: unitDetails?.note,
      invalid: unitDetails?.invalid
    });
    toggleModal(true);
  };

  const handleSubmitClick = (event: React.FormEvent<HTMLElement>) => {
    event.preventDefault();
    const details = values as valuesDetails;
    set(
      ref(database, `/${postalcode}/units/${details.floor}/${details.unit}`),
      {
        done: details.done,
        dnc: details.dnc,
        type: details.type,
        note: details.note,
        invalid: details.invalid
      }
    );
    toggleModal(true);
  };

  const handleClickFeedback = (
    event: React.MouseEvent<HTMLElement>,
  ) => {
    toggleModal(false);
  };

  const handleSubmitFeedback = (event: React.FormEvent<HTMLElement>) => {
    event.preventDefault();
    const details = values as valuesDetails;
    console.log("Submit fb");
    console.log(details);
    set(
      ref(database, `/${postalcode}/feedback`),
      details.feedback
    );
    toggleModal(false);
  };

  const onFormChange = (e: React.ChangeEvent<HTMLElement>) => {
    const { name, value, checked } = e.target as HTMLInputElement;

    if (name === "done" || name === "dnc" || name === "invalid") {
      setValues({ ...values, [name]: checked });
    } else {
      setValues({ ...values, [name]: value });
    }
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
              <Button className="me-2" onClick={handleClickFeedback}>Feedback</Button>
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
                      isDone={element.done}
                      isDnc={element.dnc}
                      type={element.type}
                      note={element.note}
                      isInvalid={element.invalid}
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
                value={(values as valuesDetails).feedback}
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
            <Form.Group className="mb-3" controlId="formBasicDoneCheckbox">
              <Form.Check
                onChange={onFormChange}
                name="done"
                type="checkbox"
                label="Done"
                defaultChecked={(values as valuesDetails).done}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicDncCheckbox">
              <Form.Check
                onChange={onFormChange}
                name="dnc"
                type="checkbox"
                label="DNC"
                defaultChecked={(values as valuesDetails).dnc}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicInvalidCheckbox">
              <Form.Check
                onChange={onFormChange}
                name="invalid"
                type="checkbox"
                label="Invalid"
                defaultChecked={(values as valuesDetails).invalid}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicSelect">
              <Form.Label>Household</Form.Label>
              <Form.Select
                onChange={onFormChange}
                name="type"
                aria-label="Default select example"
                value={(values as valuesDetails).type}
              >
                <option value="cn">Chinese</option>
                <option value="tm">Tamil</option>
                <option value="in">Indonesian</option>
                <option value="bm">Burmese</option>
                <option value="ml">Muslim</option>
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
                value={(values as valuesDetails).note}
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
