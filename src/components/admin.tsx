import {
  child,
  onValue,
  ref,
  set,
  get,
  update,
  off,
  remove
} from "firebase/database";
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
  Dropdown,
  DropdownButton,
  Form,
  Modal,
  Navbar,
  NavDropdown,
  ProgressBar,
  Spinner,
  Table
} from "react-bootstrap";
import { database, auth } from "./../firebase";
import Loader from "./loader";
import UnitStatus from "./unit";
import {
  valuesDetails,
  territoryDetails,
  addressDetails,
  adminProps,
  unitMaps
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
  getCompletedPercent,
  DEFAULT_PERSONAL_SLIP_DESTRUCT_HOURS,
  FIREBASE_AUTH_UNAUTHORISED_MSG,
  ADMIN_MODAL_TYPES
} from "./util";
import TableHeader from "./table";
import { useParams } from "react-router-dom";
import {
  AdminLinkField,
  FeedbackField,
  HHStatusField,
  HHTypeField,
  ModalFooter,
  NoteField
} from "./form";
import Welcome from "./welcome";
import NotFoundPage from "./notfoundpage";
import UnauthorizedPage from "./unauthorisedpage";
function Admin({ isConductor = false }: adminProps) {
  const { code } = useParams();
  const [name, setName] = useState<String>();
  const [territories, setTerritories] = useState<Array<territoryDetails>>([]);
  const [territory, setTerritory] = useState<String>();
  const [addresses, setAddresses] = useState<Array<addressDetails>>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [values, setValues] = useState<Object>({});
  const [isFeedback, setIsFeedback] = useState<boolean>(false);
  const [isLinkRevoke, setIsLinkRevoke] = useState<boolean>(false);
  const [isSettingAssignLink, setIsSettingAssignLink] =
    useState<boolean>(false);
  const [isSettingViewLink, setIsSettingViewLink] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUnauthorised, setIsUnauthorised] = useState<boolean>(false);
  const congregationReference = child(ref(database), `congregations/${code}`);
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

  const clearExistingListeners = () => {
    addresses.forEach((existingAddress) => {
      off(child(ref(database), `/${existingAddress.postalcode}`));
    });
  };

  const handleSelect = (
    eventKey: string | null,
    _: SyntheticEvent<unknown>
  ) => {
    const territoryDetails = territories.find((e) => e.code === eventKey);
    const territoryAddresses = territoryDetails?.addresses;
    setTerritory(`${territoryDetails?.code} - ${territoryDetails?.name}`);
    clearExistingListeners();
    const addressListing = [] as Array<addressDetails>;
    for (const territoryIndex in territoryAddresses) {
      const territory = territoryAddresses[territoryIndex];
      onValue(child(ref(database), `/${territory}`), (snapshot) => {
        if (snapshot.exists()) {
          const territoryData = snapshot.val();
          const addressData = {
            name: territoryData.name,
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

  const resetBlock = async (postalcode: String) => {
    const blockAddresses = addresses.find((e) => e.postalcode === postalcode);
    if (!blockAddresses) return;
    const unitUpdates: unitMaps = {};
    for (const index in blockAddresses.floors) {
      const floorDetails = blockAddresses.floors[index];
      floorDetails.units.forEach((element) => {
        let currentStatus = element.status;
        if (MUTABLE_CODES.includes(`${currentStatus}`)) {
          currentStatus = STATUS_CODES.DEFAULT;
        }
        unitUpdates[
          `/${postalcode}/units/${floorDetails.floor}/${element.number}`
        ] = {
          type: element.type,
          note: element.note,
          status: currentStatus
        };
      });
    }
    await update(ref(database), unitUpdates);
  };

  const toggleModal = (modalType = ADMIN_MODAL_TYPES.UNIT) => {
    switch (modalType) {
      case ADMIN_MODAL_TYPES.FEEDBACK:
        setIsFeedback(!isFeedback);
        break;
      case ADMIN_MODAL_TYPES.LINK:
        setIsLinkRevoke(!isLinkRevoke);
        break;
      default:
        setIsOpen(!isOpen);
    }
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
    toggleModal();
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
    toggleModal();
  };

  const setTimedLink = (
    addressLinkId: String,
    hours = DEFAULT_SELF_DESTRUCT_HOURS
  ) => {
    return set(ref(database, `links/${addressLinkId}`), addHours(hours));
  };

  const handleClickFeedback = (
    _: MouseEvent<HTMLElement>,
    postalcode: String,
    feedback: String
  ) => {
    setValues({ ...values, feedback: feedback, postal: postalcode });
    toggleModal(ADMIN_MODAL_TYPES.FEEDBACK);
  };

  const handleSubmitFeedback = (event: FormEvent<HTMLElement>) => {
    event.preventDefault();
    const details = values as valuesDetails;
    set(ref(database, `/${details.postal}/feedback`), details.feedback);
    toggleModal(ADMIN_MODAL_TYPES.FEEDBACK);
  };

  const handleRevokeLink = async (event: FormEvent<HTMLElement>) => {
    event.preventDefault();
    const details = values as valuesDetails;
    const link = details.link || "";
    try {
      const linkId = link.substring(link.lastIndexOf("/") + 1);
      await remove(ref(database, `links/${linkId}`));
      alert(`Revoked territory link token, ${linkId}.`);
    } catch (error) {
      alert(`Invalid territory link`);
      return;
    }
    toggleModal(ADMIN_MODAL_TYPES.LINK);
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
      setIsSettingAssignLink(true);
      setTimedLink(linkId, hours).then(() => {
        setIsSettingAssignLink(false);
        navigator.share({
          title: title,
          text: body,
          url: url
        });
      });
    } else {
      alert("Browser doesn't support this feature.");
    }
  };

  useEffect(() => {
    get(congregationReference)
      .then((snapshot) => {
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
      })
      .catch((reason) => {
        setIsUnauthorised(reason.message === FIREBASE_AUTH_UNAUTHORISED_MSG);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const noSuchTerritory = territories.length === 0;

  if (isLoading) return <Loader />;
  if (isUnauthorised) return <UnauthorizedPage />;
  if (noSuchTerritory) return <NotFoundPage />;

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
              className="m-2 d-inline-block"
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
            {!isConductor && (
              <Button
                className="m-2"
                size="sm"
                variant="outline-primary"
                onClick={() => {
                  setValues({
                    ...values,
                    link: ""
                  });
                  toggleModal(ADMIN_MODAL_TYPES.LINK);
                }}
              >
                Revoke
              </Button>
            )}
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
                    {!isConductor && (
                      <DropdownButton
                        key={`assigndrop-${addressElement.postalcode}`}
                        size="sm"
                        variant="outline-primary"
                        title="Assign"
                        className="me-2 d-inline-block"
                      >
                        <Dropdown.Item
                          onClick={() => {
                            shareTimedLink(
                              addressLinkId,
                              `Units for ${addressElement.name}`,
                              assignmentMessage(addressElement.name),
                              `${window.location.origin}/${addressElement.postalcode}/${addressLinkId}`
                            );
                          }}
                        >
                          {isSettingAssignLink && (
                            <>
                              <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                aria-hidden="true"
                              />{" "}
                            </>
                          )}
                          House-To-House
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => {
                            shareTimedLink(
                              addressLinkId,
                              `Units for ${addressElement.name}`,
                              assignmentMessage(addressElement.name),
                              `${window.location.origin}/${addressElement.postalcode}/${addressLinkId}`,
                              DEFAULT_PERSONAL_SLIP_DESTRUCT_HOURS
                            );
                          }}
                        >
                          {isSettingAssignLink && (
                            <>
                              <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                aria-hidden="true"
                              />{" "}
                            </>
                          )}
                          Personal
                        </Dropdown.Item>
                      </DropdownButton>
                    )}
                    {isConductor && (
                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="me-2"
                        onClick={(_) => {
                          shareTimedLink(
                            addressLinkId,
                            `Units for ${addressElement.name}`,
                            assignmentMessage(addressElement.name),
                            `${window.location.origin}/${addressElement.postalcode}/${addressLinkId}`
                          );
                        }}
                      >
                        {isSettingAssignLink && (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              aria-hidden="true"
                            />{" "}
                          </>
                        )}
                        Assign
                      </Button>
                    )}
                    {isConductor && (
                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="me-2"
                        onClick={() => {
                          setIsSettingViewLink(true);
                          const territoryWindow = window.open("", "_blank");
                          setTimedLink(addressLinkId).then(() => {
                            setIsSettingViewLink(false);
                            territoryWindow!.location.href = `${window.location.origin}/${addressElement.postalcode}/${addressLinkId}`;
                          });
                        }}
                      >
                        {isSettingViewLink && (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              aria-hidden="true"
                            />{" "}
                          </>
                        )}
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
      {!isConductor && (
        <Modal show={isLinkRevoke}>
          <Modal.Header>
            <Modal.Title>Revoke territory link</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleRevokeLink}>
            <Modal.Body>
              <AdminLinkField
                handleChange={onFormChange}
                changeValue={`${(values as valuesDetails).link}`}
              />
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => toggleModal(ADMIN_MODAL_TYPES.LINK)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  navigator.clipboard.readText().then(
                    (cliptext) => {
                      setValues({ ...values, link: cliptext });
                    },
                    (err) => {
                      alert(err);
                    }
                  );
                }}
              >
                Paste Link
              </Button>
              <Button type="submit" variant="primary">
                Revoke
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      )}
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
          <ModalFooter
            handleClick={() => toggleModal(ADMIN_MODAL_TYPES.FEEDBACK)}
          />
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
          <ModalFooter
            handleClick={() => toggleModal(ADMIN_MODAL_TYPES.UNIT)}
          />
        </Form>
      </Modal>
    </>
  );
}

export default Admin;
