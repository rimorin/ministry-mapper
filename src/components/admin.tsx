import { child, onValue, ref, set, get, DataSnapshot } from "firebase/database";
import React, { useEffect, useState } from "react";
import { database } from "./../firebase";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import {
  Button,
  Card,
  Form,
  Modal,
  Table,
  ToggleButton,
  ToggleButtonGroup
} from "react-bootstrap";
import Loader from "./loader";
import { RWebShare } from "react-web-share";
import UnitStatus from "./unit";
import {
  valuesDetails,
  territoryDetails,
  addressDetails,
  adminProps
} from "./interface";
import { confirmAlert } from "react-confirm-alert"; // Import
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css
import {
  compareSortObjects,
  HHType,
  STATUS_CODES,
  MUTABLE_CODES,
  ZeroPad,
  ModalUnitTitle,
  assignmentMessage
} from "./util";
import TableHeader from "./table";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
function Admin({ congregationCode, user }: adminProps) {
  const [name, setName] = useState<String>();
  const [territories, setTerritories] = useState<Array<territoryDetails>>([]);
  const [territory, setTerritory] = useState<String>();
  const [addresses, setAddresses] = useState<Array<addressDetails>>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [values, setValues] = useState<Object>({});
  const [isFeedback, setIsFeedback] = useState<boolean>(false);
  const congregationReference = child(
    ref(database),
    `congregations/${congregationCode}`
  );

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
          status: units[unit]["status"]
        });
      }
      dataList.push({ floor: floor, units: unitsDetails });
    }
    dataList.sort(compareSortObjects);
    return dataList;
  };

  const handleSelect = (
    eventKey: string | null,
    _: React.SyntheticEvent<unknown>
  ) => {
    const territoryDetails = territories.find((e) => e.code === eventKey);
    const territoryAddresses = territoryDetails?.addresses;
    setTerritory(`${territoryDetails?.name}`);
    let addressListing = [] as Array<addressDetails>;
    for (const territory in territoryAddresses) {
      onValue(child(ref(database), `/${territory}/units`), (snapshot) => {
        if (snapshot.exists()) {
          const addressData = {
            name: territoryAddresses[territory].name,
            postalcode: `${territory}`,
            floors: processData(snapshot)
          };
          const existingIndex = addressListing.findIndex(
            (_element) => _element.postalcode === addressData.postalcode
          );
          if (existingIndex > -1) {
            addressListing[existingIndex] = addressData;
          } else {
            addressListing.push(addressData);
          }
          setAddresses([...addressListing]);
        }
      });
    }
  };

  const resetBlock = (postalcode: String) => {
    const blockAddresses = addresses.find((e) => e.postalcode === postalcode);
    if (!blockAddresses) return;

    for (const floor in blockAddresses.floors) {
      const floorUnits = blockAddresses.floors[floor];
      floorUnits.units.forEach((element) => {
        let currentStatus = element.status;
        if (MUTABLE_CODES.includes(`${currentStatus}`)) {
          currentStatus = STATUS_CODES.DEFAULT;
        }
        set(ref(database, `/${postalcode}/units/${floor}/${element.number}`), {
          type: element.type,
          note: element.note,
          status: currentStatus
        });
      });
    }
  };

  const toggleModal = (isModal: boolean) => {
    if (isModal) {
      setIsOpen(!isOpen);
    } else {
      setIsFeedback(!isFeedback);
    }
  };

  const handleClick = (_: React.MouseEvent<HTMLElement>, isModal: boolean) => {
    toggleModal(isModal);
  };

  const handleClickModal = (
    _: React.MouseEvent<HTMLElement>,
    postal: String,
    floor: String,
    unit: String,
    type: String,
    note: String,
    status: String
  ) => {
    setValues({
      ...values,
      floor: floor,
      unit: unit,
      type: type,
      note: note,
      postal: postal,
      status: status
    });
    toggleModal(true);
  };

  const handleSubmitClick = (event: React.FormEvent<HTMLElement>) => {
    event.preventDefault();
    const details = values as valuesDetails;
    set(
      ref(
        database,
        `/${details.postal}/units/${details.floor}/${details.unit}`
      ),
      {
        type: details.type,
        note: details.note,
        status: details.status
      }
    );
    toggleModal(true);
  };

  const handleClickFeedback = (
    _: React.MouseEvent<HTMLElement>,
    postalcode: String
  ) => {
    get(child(ref(database), `/${postalcode}/feedback`)).then((snapshot) => {
      if (snapshot.exists()) {
        setValues({ ...values, feedback: snapshot.val(), postal: postalcode });
      }
    });
    toggleModal(false);
  };

  const handleSubmitFeedback = (event: React.FormEvent<HTMLElement>) => {
    event.preventDefault();
    const details = values as valuesDetails;
    set(ref(database, `/${details.postal}/feedback`), details.feedback);
    toggleModal(false);
  };

  const onFormChange = (e: React.ChangeEvent<HTMLElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    setValues({ ...values, [name]: value });
  };

  useEffect(() => {
    get(congregationReference).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        document.title = `${data["name"]}`;
        const congregationTerritories = data["territories"];
        let territoryList = [];
        for (const territory in congregationTerritories) {
          const name = congregationTerritories[territory]["name"];
          const addresses = congregationTerritories[territory]["addresses"];
          territoryList.push({
            code: territory,
            name: name,
            addresses: addresses
          });
        }
        setTerritories(territoryList);
        setName(`${data["name"]}`);
      }
    });
  }, []);

  if (territories.length === 0) {
    return <Loader />;
  }

  return (
    <>
      <Navbar bg="light" variant="light" expand="lg">
        <Container fluid>
          <Navbar.Brand>
            <img
              alt=""
              src={`${process.env.PUBLIC_URL}/favicon-32x32.png`}
              width="32"
              height="32"
              className="d-inline-block align-top"
            />{" "}
            {name}
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse
            id="basic-navbar-nav"
            className="justify-content-end mt-1"
          >
            <NavDropdown
              title={territory ? `${territory}` : "Select Territory"}
              onSelect={handleSelect}
              key={`${territory}`}
              className="m-2"
              align={{ lg: "end" }}
            >
              {territories &&
                territories.map((element) => (
                  <NavDropdown.Item
                    key={`${element.code}`}
                    eventKey={`${element.code}`}
                  >
                    {element.code} - {element.name}
                  </NavDropdown.Item>
                ))}
            </NavDropdown>
            <Button
              className="m-2"
              size="sm"
              variant="outline-primary"
              onClick={() => {
                signOut(auth);
              }}
            >
              Log Out
            </Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      {addresses &&
        addresses.map((addressElement) => (
          <div key={`div-${addressElement.postalcode}`}>
            <Navbar
              bg="light"
              expand="sm"
              className="mt-3"
              key={`navbar-${addressElement.postalcode}`}
            >
              <Container fluid>
                <Navbar.Brand>{addressElement.name}</Navbar.Brand>
                <Navbar.Toggle aria-controls="navbarScroll" />
                <Navbar.Collapse
                  id="navbarScroll"
                  className="justify-content-end mt-2"
                >
                  <RWebShare
                    data={{
                      text: assignmentMessage(addressElement.name),
                      url: `${window.location.origin}/${addressElement.postalcode}`,
                      title: `Units for ${addressElement.name}`
                    }}
                  >
                    <Button
                      size="sm"
                      variant="outline-primary"
                      className="me-2"
                    >
                      Assign
                    </Button>
                  </RWebShare>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    className="me-2"
                    onClick={(e) => {
                      window.open(
                        `http://maps.google.com.sg/maps?q=${addressElement.postalcode}`,
                        "_blank"
                      );
                    }}
                  >
                    Direction
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    className="me-2"
                    onClick={(e) => {
                      handleClickFeedback(e, addressElement.postalcode);
                    }}
                  >
                    Feedback
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    className="me-2"
                    onClick={() =>
                      confirmAlert({
                        customUI: ({ onClose }) => {
                          return (
                            <Container>
                              <Card bg="warning" className="text-center">
                                <Card.Header>Warning ⚠️</Card.Header>
                                <Card.Body>
                                  <Card.Title>Are You Very Sure ?</Card.Title>
                                  <Card.Text>
                                    You want to reset the data of{" "}
                                    {addressElement.name}. This will reset all
                                    Done & Not Home status.
                                  </Card.Text>
                                  <Button
                                    className="me-2"
                                    variant="primary"
                                    onClick={() => {
                                      resetBlock(addressElement.postalcode);
                                      onClose();
                                    }}
                                  >
                                    Yes, Reset It.
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
                      })
                    }
                  >
                    Reset
                  </Button>
                </Navbar.Collapse>
              </Container>
            </Navbar>
            <Table
              key={`table-${addressElement.postalcode}`}
              bordered
              striped
              hover
              responsive="sm"
              style={{ overflowX: "auto" }}
            >
              <TableHeader floors={addressElement.floors} />
              <tbody key={`tbody-${addressElement.postalcode}`}>
                {addressElement.floors &&
                  addressElement.floors.map((floorElement, floorIndex) => (
                    <tr key={`row-${floorIndex}`}>
                      <th
                        className="text-center"
                        key={`floor-${floorIndex}`}
                        scope="row"
                      >
                        {`${ZeroPad(floorElement.floor, 2)}`}
                      </th>
                      {floorElement.units.map((detailsElement, index) => (
                        <td
                          align="center"
                          onClick={(event) =>
                            handleClickModal(
                              event,
                              addressElement.postalcode,
                              floorElement.floor,
                              detailsElement.number,
                              detailsElement.type,
                              detailsElement.note,
                              detailsElement.status
                            )
                          }
                          key={`${index}-${detailsElement.number}`}
                        >
                          <UnitStatus
                            key={`unit-${index}-${detailsElement.number}`}
                            type={detailsElement.type}
                            note={detailsElement.note}
                            status={detailsElement.status}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </Table>
          </div>
        ))}
      <Modal show={isFeedback}>
        <Modal.Header>
          <Modal.Title>{`Feedback on ${
            (values as valuesDetails).postal
          }`}</Modal.Title>
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
                value={`${(values as valuesDetails).feedback}`}
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
        <ModalUnitTitle
          unit={(values as valuesDetails).unit}
          floor={(values as valuesDetails).floor}
          postal={(values as valuesDetails).postal}
        />
        <Form onSubmit={handleSubmitClick}>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="formBasicStatusbtnCheckbox">
              <ToggleButtonGroup
                name="status"
                type="radio"
                value={(values as valuesDetails).status}
                className="mb-3"
                onChange={(toggleValue) => {
                  setValues({ ...values, status: toggleValue });
                }}
              >
                <ToggleButton
                  id="status-tb-0"
                  variant="outline-dark"
                  value={STATUS_CODES.DEFAULT}
                >
                  Not Done
                </ToggleButton>
                <ToggleButton
                  id="status-tb-1"
                  variant="outline-success"
                  value={STATUS_CODES.DONE}
                >
                  Done
                </ToggleButton>
                <ToggleButton
                  id="status-tb-2"
                  variant="outline-secondary"
                  value={STATUS_CODES.NOT_HOME}
                >
                  Not Home
                </ToggleButton>
                {/* <ToggleButton
                  id="status-tb-3"
                  variant="outline-dark"
                  value={STATUS_CODES.STILL_NOT_HOME}
                >
                  Still Nt 🏠
                </ToggleButton> */}
                <ToggleButton
                  id="status-tb-4"
                  variant="outline-danger"
                  value={STATUS_CODES.DO_NOT_CALL}
                >
                  DNC
                </ToggleButton>
                <ToggleButton
                  id="status-tb-5"
                  variant="outline-info"
                  value={STATUS_CODES.INVALID}
                >
                  Invalid
                </ToggleButton>
              </ToggleButtonGroup>
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

export default Admin;
