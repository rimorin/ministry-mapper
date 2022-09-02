import { child, onValue, ref, set, get } from "firebase/database";
import { signOut } from "firebase/auth";
import { nanoid } from "nanoid";
import {
  MouseEvent,
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
  SyntheticEvent
} from "react";
import {
  Badge,
  Button,
  Card,
  Container,
  Form,
  Modal,
  Navbar,
  NavDropdown,
  ProgressBar,
  Table
} from "react-bootstrap";
import { database } from "./../firebase";
import Loader from "./loader";
import UnitStatus from "./unit";
import {
  valuesDetails,
  territoryDetails,
  addressDetails,
  adminProps
} from "./interface";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import {
  compareSortObjects,
  STATUS_CODES,
  MUTABLE_CODES,
  ZeroPad,
  ModalUnitTitle,
  assignmentMessage,
  NavBarBranding,
  LOGIN_TYPE_CODES,
  getMaxUnitLength,
  DEFAULT_FLOOR_PADDING,
  addHours,
  DEFAULT_SELF_DESTRUCT_HOURS,
  getCompletedPercent
} from "./util";
import TableHeader from "./table";

import { auth } from "../firebase";
import {
  FeedbackField,
  HHStatusField,
  HHTypeField,
  ModalFooter,
  NoteField
} from "./form";
import Welcome from "./welcome";
function Admin({ congregationCode, isConductor = false }: adminProps) {
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

  const processData = (data: any) => {
    let dataList = [];
    for (const floor in data) {
      let unitsDetails = [];
      const units = data[floor];
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
    _: SyntheticEvent<unknown>
  ) => {
    const territoryDetails = territories.find((e) => e.code === eventKey);
    const territoryAddresses = territoryDetails?.addresses;
    setTerritory(`${territoryDetails?.code} - ${territoryDetails?.name}`);
    let addressListing = [] as Array<addressDetails>;
    for (const territory in territoryAddresses) {
      onValue(child(ref(database), `/${territory}`), (snapshot) => {
        if (snapshot.exists()) {
          const territoryData = snapshot.val();
          const addressData = {
            name: territoryAddresses[territory].name,
            postalcode: `${territory}`,
            floors: processData(territoryData.units),
            feedback: territoryData.feedback
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

  const handleClick = (_: MouseEvent<HTMLElement>, isModal: boolean) => {
    toggleModal(isModal);
  };

  const handleClickModal = (
    _: MouseEvent<HTMLElement>,
    postal: String,
    floor: String,
    unit: String,
    type: String,
    note: String,
    status: String,
    maxUnitNumber: number
  ) => {
    setValues({
      ...values,
      floor: floor,
      floorDisplay: ZeroPad(floor, DEFAULT_FLOOR_PADDING),
      unit: unit,
      unitDisplay: ZeroPad(unit, maxUnitNumber),
      type: type,
      note: note,
      postal: postal,
      status: status
    });
    toggleModal(true);
  };

  const handleSubmitClick = (event: FormEvent<HTMLElement>) => {
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

  const setTimedLink = (
    addressLinkId: String,
    hours = DEFAULT_SELF_DESTRUCT_HOURS
  ) => {
    set(ref(database, `links/${addressLinkId}`), addHours(hours));
  };

  const handleClickFeedback = (
    _: MouseEvent<HTMLElement>,
    postalcode: String,
    feedback: String
  ) => {
    setValues({ ...values, feedback: feedback, postal: postalcode });
    toggleModal(false);
  };

  const handleSubmitFeedback = (event: FormEvent<HTMLElement>) => {
    event.preventDefault();
    const details = values as valuesDetails;
    set(ref(database, `/${details.postal}/feedback`), details.feedback);
    toggleModal(false);
  };

  const onFormChange = (e: ChangeEvent<HTMLElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    setValues({ ...values, [name]: value });
  };

  const shareTimedLink = (
    linkId: String,
    title: string,
    body: string,
    url: string,
    hours = DEFAULT_SELF_DESTRUCT_HOURS
  ) => {
    if (navigator.share) {
      setTimedLink(linkId, hours);
      navigator.share({
        title: title,
        text: body,
        url: url
      });
    } else {
      alert("Browser doesn't support this feature.");
    }
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
          <NavBarBranding naming={`${name}`} />
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
      {addresses.length === 0 && (
        <Welcome
          loginType={
            isConductor ? LOGIN_TYPE_CODES.CONDUCTOR : LOGIN_TYPE_CODES.ADMIN
          }
        />
      )}
      {addresses &&
        addresses.map((addressElement) => {
          const maxUnitNumberLength = getMaxUnitLength(addressElement.floors);
          const completedPercent = getCompletedPercent(addressElement.floors);
          const addressLinkId = nanoid();
          return (
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
                    {isConductor && (
                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="me-2"
                        onClick={() => {
                          shareTimedLink(
                            addressLinkId,
                            `Units for ${addressElement.name}`,
                            assignmentMessage(addressElement.name),
                            `${window.location.origin}/${addressElement.postalcode}/${addressLinkId}`
                          );
                        }}
                      >
                        Assign
                      </Button>
                    )}
                    {isConductor && (
                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="me-2"
                        onClick={(e) => {
                          setTimedLink(addressLinkId);
                          window.open(
                            `${window.location.origin}/${addressElement.postalcode}/${addressLinkId}`,
                            "_blank"
                          );
                        }}
                      >
                        View
                      </Button>
                    )}
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
                      onClick={(event) => {
                        handleClickFeedback(
                          event,
                          addressElement.postalcode,
                          addressElement.feedback
                        );
                      }}
                    >
                      Feedback
                      {addressElement.feedback && (
                        <>
                          {" "}
                          <Badge pill bg="secondary">
                            ⭐
                          </Badge>
                        </>
                      )}
                    </Button>
                    {!isConductor && (
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
                                      <Card.Title>
                                        Are You Very Sure ?
                                      </Card.Title>
                                      <Card.Text>
                                        You want to reset the data of{" "}
                                        {addressElement.name}. This will reset
                                        all Done & Not Home status.
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
                    )}
                  </Navbar.Collapse>
                </Container>
              </Navbar>
              <ProgressBar
                style={{ borderRadius: 0 }}
                now={completedPercent.completedValue}
                label={completedPercent.completedDisplay}
              />
              <Table
                key={`table-${addressElement.postalcode}`}
                bordered
                striped
                hover
                responsive="sm"
              >
                <TableHeader
                  floors={addressElement.floors}
                  maxUnitNumber={maxUnitNumberLength}
                />
                <tbody key={`tbody-${addressElement.postalcode}`}>
                  {addressElement.floors &&
                    addressElement.floors.map((floorElement, floorIndex) => (
                      <tr key={`row-${floorIndex}`}>
                        <th
                          className="text-center"
                          key={`floor-${floorIndex}`}
                          scope="row"
                        >
                          {`${ZeroPad(
                            floorElement.floor,
                            DEFAULT_FLOOR_PADDING
                          )}`}
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
                                detailsElement.status,
                                maxUnitNumberLength
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
          );
        })}
      <Modal show={isFeedback}>
        <Modal.Header>
          <Modal.Title>{`Feedback on ${
            (values as valuesDetails).postal
          }`}</Modal.Title>
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
          postal={(values as valuesDetails).postal}
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

export default Admin;
