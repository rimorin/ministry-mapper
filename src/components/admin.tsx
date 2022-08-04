import { child, onValue, ref, set } from "firebase/database";
import React, { useEffect, useState } from "react";
import database from "./../firebase";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { Button, Form, Modal, Table } from "react-bootstrap";
import Loader from "./loader";
import { RWebShare } from "react-web-share";
import UnitStatus from "./unit";
import { valuesDetails } from "./interface";
interface adminProps {
  congregationCode: String;
}

interface territoryDetails {
  code: String;
  name: String;
  addresses: Array<Object>;
}

interface addressDetails {
  postalcode: String;
  floors: Array<Object>;
}

function Admin({ congregationCode }: adminProps) {
  const [name, setName] = useState<String>();
  const [territories, setTerritories] = useState<Array<territoryDetails>>([]);
  const [territory, setTerritory] = useState<String>();
  const [addresses, setAddresses] = useState<Array<addressDetails>>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [values, setValues] = useState<Object>({});
  const congregationReference = child(
    ref(database),
    `congregations/${congregationCode}`
  );

  const handleSelect = (
    eventKey: string | null,
    e: React.SyntheticEvent<unknown>
  ) => {
    setAddresses([]);
    const territoryDetails = territories.find((e) => e.code === eventKey);
    const territoryAddresses = territoryDetails?.addresses;
    for (const territory in territoryAddresses) {
      onValue(child(ref(database), `/${territory}/units`), (snapshot) => {
        if (snapshot.exists()) {
          setAddresses([
            ...addresses,
            {
              postalcode: `${territory}`,
              floors: snapshot.val()
            }
          ]);
        }
      });
    }
    setTerritory(`${territoryDetails?.name}`);
  };

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    toggleModal();
  };

  const handleClickModal = (
    event: React.MouseEvent<HTMLElement>,
    postal: String,
    floor: String,
    unit: String,
    done: Boolean,
    dnc: Boolean,
    type: String,
    note: String
  ) => {
    setValues({
      ...values,
      floor: floor,
      unit: unit,
      done: done,
      dnc: dnc,
      type: type,
      note: note,
      postal: postal
    });
    console.log(values);
    toggleModal();
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
        done: details.done,
        dnc: details.dnc,
        type: details.type,
        note: details.note
      }
    );
    toggleModal();
  };

  const onFormChange = (e: React.ChangeEvent<HTMLElement>) => {
    const { name, value, checked } = e.target as HTMLInputElement;

    if (name === "done" || name === "dnc") {
      setValues({ ...values, [name]: checked });
    } else {
      setValues({ ...values, [name]: value });
    }
  };

  useEffect(() => {
    onValue(congregationReference, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        document.title = `${data["name"]}`;
        const congregationTerritories = data["territories"];
        let territoryList = [];
        for (const territory in congregationTerritories) {
          const details = congregationTerritories[territory]["name"];
          const addresses = congregationTerritories[territory]["addresses"];
          console.log(congregationTerritories[territory]);
          territoryList.push({
            code: territory,
            name: details,
            addresses: addresses
          });
        }
        setTerritories(territoryList);
        setName(`${data["name"]}`);
      } else {
        console.log("No data");
      }
    });
  }, []);

  if (territories.length === 0) {
    return <Loader />;
  }

  return (
    <>
      <Navbar bg="light" expand="lg">
        <Container>
          <Navbar.Brand>{name}</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <NavDropdown
                title={territory ? `${territory}` : "Select Territory"}
                id="basic-nav-dropdown"
                onSelect={handleSelect}
                key={`${territory}`}
              >
                {territories &&
                  territories.map((element) => (
                    <NavDropdown.Item
                      key={`${element.code}`}
                      eventKey={`${element.code}`}
                    >
                      {element.name}
                    </NavDropdown.Item>
                  ))}
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      {addresses &&
        addresses.map((addressElement) => (
          <div>
            <Navbar
              bg="light"
              expand="sm"
              className="mt-3"
              key={`navbar-${addressElement.postalcode}`}
            >
              <Container fluid>
                <Navbar.Brand href="#">
                  <a
                    href={`http://maps.google.com.sg/maps?q=${addressElement.postalcode}`}
                    target="blank"
                  >
                    {name}, {addressElement.postalcode}
                  </a>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="navbarScroll" />
                <Navbar.Collapse id="navbarScroll">
                  <Form className="d-flex justify-content-end">
                    <RWebShare
                      data={{
                        text: `These are unit numbers for ${addressElement.postalcode}. To update a unit, please tap on a unit box and update its details accordingly.`,
                        url: `https://www.ministry-mapper.com/${addressElement.postalcode}`,
                        title: `Units for ${addressElement.postalcode}`
                      }}
                    >
                      <Button className="me-2">Share</Button>
                    </RWebShare>
                    <Button className="me-2">Reset</Button>
                  </Form>
                </Navbar.Collapse>
              </Container>
            </Navbar>
            <Table
              key={`table-${addressElement.postalcode}`}
              bordered
              responsive="sm"
            >
              <thead key={`thead-${addressElement.postalcode}`}>
                <tr>
                  <th scope="col" className="text-center">
                    lvl/unit
                  </th>
                  {addressElement.floors &&
                    Object.keys(addressElement.floors[2]).map(
                      (element, index) => (
                        <th
                          key={`${index}-y-header`}
                          scope="col"
                          className="text-center"
                        >
                          {`${element}`}
                        </th>
                      )
                    )}
                </tr>
              </thead>
              <tbody key={`tbody-${addressElement.postalcode}`}>
                {addressElement.floors &&
                  addressElement.floors.map((floorElement, floorIndex) => (
                    <tr key={`row-${floorIndex}`}>
                      <th
                        className="text-center"
                        key={`floor-${floorIndex}`}
                        scope="row"
                      >
                        {`${floorIndex}`}
                      </th>
                      {Object.values(floorElement).map(
                        (detailsElement, index) => (
                          <td
                            align="center"
                            onClick={(event) =>
                              handleClickModal(
                                event,
                                addressElement.postalcode,
                                `${floorIndex}`,
                                `${Object.keys(detailsElement)[0]}`,
                                detailsElement.done,
                                detailsElement.dnc,
                                detailsElement.type,
                                detailsElement.note
                              )
                            }
                            key={`${index}-${detailsElement.number}`}
                          >
                            <UnitStatus
                              key={`unit-${index}-${detailsElement.number}`}
                              isDone={detailsElement.done}
                              isDnc={detailsElement.dnc}
                              type={detailsElement.type}
                              note={detailsElement.note}
                            />
                          </td>
                        )
                      )}
                    </tr>
                  ))}
              </tbody>
            </Table>
          </div>
        ))}
      <Modal show={isOpen}>
        <Modal.Header>
          <Modal.Title>{`${(values as valuesDetails).postal} - # ${
            (values as valuesDetails).floor
          } - ${(values as valuesDetails).unit}`}</Modal.Title>
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
            <Button variant="secondary" onClick={handleClick}>
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
