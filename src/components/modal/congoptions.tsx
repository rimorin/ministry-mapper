import NiceModal, { useModal, bootstrapDialog } from "@ebay/nice-modal-react";
import { useRollbar } from "@rollbar/react";
import {
  set,
  ref,
  get,
  query,
  orderByChild,
  DataSnapshot
} from "firebase/database";
import {
  useState,
  FormEvent,
  useEffect,
  ChangeEvent,
  useCallback
} from "react";
import {
  Form,
  Modal,
  Table,
  Button,
  Card,
  Container,
  Badge,
  OverlayTrigger,
  Tooltip
} from "react-bootstrap";
import { WIKI_CATEGORIES } from "../../utils/constants";
import errorHandler from "../../utils/helpers/errorhandler";
import pollingVoidFunction from "../../utils/helpers/pollingvoid";
import HelpButton from "../navigation/help";
import { database } from "../../firebase";
import { HHOptionProps } from "../../utils/interface";
import pollingQueryFunction from "../../utils/helpers/pollingquery";
import GenericInputField from "../form/input";
import ModalSubmitButton from "../form/submit";
import { confirmAlert } from "react-confirm-alert";
import { flushSync } from "react-dom";

const UpdateCongregationOptions = NiceModal.create(
  ({ currentCongregation }: { currentCongregation: string }) => {
    const modal = useModal();
    const rollbar = useRollbar();
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [deletedOptions, setDeletedOptions] = useState<Array<string>>([]);
    const [options, setOptions] = useState<Array<HHOptionProps>>([]);
    const handleSubmitCongOptions = async (
      event: FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      // check if there are any duplicate codes
      const codes = options.map((option) => option.code);
      const uniqueCodes = [...new Set(codes)];
      if (codes.length !== uniqueCodes.length) {
        alert("Duplicate option codes found. Please check your input.");
        return;
      }

      // check if there are any duplicate sequences
      const sequences = options.map((option) => option.sequence);
      const uniqueSequences = [...new Set(sequences)];
      if (sequences.length !== uniqueSequences.length) {
        alert("Duplicate option sequences found. Please check your input.");
        return;
      }

      modal.hide();
      if (deletedOptions.length === 0) {
        updateOptions();
        return;
      }

      confirmAlert({
        customUI: ({ onClose }) => {
          return (
            <Container>
              <Card bg="warning" className="text-center">
                <Card.Header>
                  Warning ⚠️
                  <HelpButton
                    link={WIKI_CATEGORIES.DELETE_TERRITORIES}
                    isWarningButton={true}
                  />
                </Card.Header>
                <Card.Body>
                  <Card.Title>
                    Do you wish to proceed with the update ?
                  </Card.Title>
                  <Card.Text>
                    You have removed [{deletedOptions.join(", ")}] from the
                    household dropdown list.
                    <br />
                    Existing household records with these options will be
                    unaffected.
                    <br />
                    These existing options will not be counted in the territory
                    completion percentage.
                  </Card.Text>
                  <Button
                    className="m-1"
                    variant="primary"
                    onClick={() => {
                      updateOptions();
                      onClose();
                    }}
                  >
                    Yes
                  </Button>
                  <Button
                    className="no-confirm-btn"
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
      });
    };

    const updateOptions = async () => {
      try {
        setIsSaving(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const optionsList = {} as any;
        options.forEach((option) => {
          optionsList[option.code] = {
            description: option.description,
            isCountable: option.isCountable,
            isDefault: option.isDefault || false,
            sequence: option.sequence
          };
        });
        await pollingVoidFunction(() =>
          set(
            ref(database, `congregations/${currentCongregation}/options/list`),
            optionsList
          )
        );
        alert("Congregation household options updated.");
        window.location.reload();
      } catch (error) {
        errorHandler(error, rollbar);
      } finally {
        setIsSaving(false);
      }
    };

    const Link = useCallback(
      ({
        id,
        children,
        title
      }: {
        id: string;
        children: React.ReactNode;
        title: string;
      }) => {
        return (
          <OverlayTrigger
            overlay={<Tooltip id={id}>{title}</Tooltip>}
            placement="bottom"
          >
            <u>{children}</u>
          </OverlayTrigger>
        );
      },
      [currentCongregation]
    );

    useEffect(() => {
      const getOptions = async () => {
        try {
          const optionsSnapshot = await pollingQueryFunction(() =>
            get(
              query(
                ref(
                  database,
                  `congregations/${currentCongregation}/options/list`
                ),
                orderByChild("sequence")
              )
            )
          );
          const optionValues: Array<HHOptionProps> = [];
          optionsSnapshot.forEach((element: DataSnapshot) => {
            const optionDetails = element.val();
            const optionCode = element.key as string;
            const option = {
              code: optionCode,
              description: optionDetails.description,
              isCountable: optionDetails.isCountable || false,
              isDefault: optionDetails.isDefault || false,
              sequence: optionDetails.sequence
            };
            optionValues.push(option);
          });
          setOptions(optionValues);
        } catch (error) {
          errorHandler(error, rollbar);
        }
      };
      getOptions();
    }, [currentCongregation]);

    return (
      <Modal {...bootstrapDialog(modal)} dialogClassName="modal-lg">
        <Form onSubmit={handleSubmitCongOptions}>
          <Modal.Header>
            <Modal.Title>Household Options</Modal.Title>
            <HelpButton link={WIKI_CATEGORIES.MANAGE_CONG_OPTIONS} />
          </Modal.Header>
          <Modal.Body
            style={{ height: "50vh", overflow: "auto", paddingBlock: "0px" }}
          >
            <Table
              striped
              bordered
              hover
              className="sticky-table"
              id="optionTable"
            >
              <thead className="sticky-top-cell">
                <tr>
                  <th style={{ width: "15%", textAlign: "center" }}>
                    <Link
                      id="optionCd"
                      title="This code will appear in the territory house boxes. It will be used to indicate the type of household."
                    >
                      Code
                    </Link>
                  </th>
                  <th style={{ width: "35%" }}>
                    <Link
                      id="optionDesc"
                      title="Description will appear in the household dropdown list."
                    >
                      Description
                    </Link>
                  </th>
                  <th style={{ width: "15%" }}>
                    <Link
                      id="optionSeq"
                      title="This determines the positioning of the option in the dropdown list. Dropdown is sorted in ascending order."
                    >
                      Sequence
                    </Link>
                  </th>
                  <th style={{ width: "15%", textAlign: "center" }}>
                    <Link
                      id="optionCountable"
                      title="This determines if the option will be counted in the territory completion percentage."
                    >
                      Countable
                    </Link>
                  </th>
                  <th style={{ width: "15%", textAlign: "center" }}>
                    <Link
                      id="optionDefault"
                      title="This determines the default household type of a congregation territory. Default option will not appear in the territory house boxes."
                    >
                      Default
                    </Link>
                  </th>
                  <th style={{ width: "15%" }}></th>
                </tr>
              </thead>
              <tbody>
                {options &&
                  options.map((option, index) => (
                    <tr key={index}>
                      {option.isNew ? (
                        <td align="center" valign="middle">
                          <GenericInputField
                            name="code"
                            required
                            changeValue={option.code}
                            handleChange={(event: ChangeEvent<HTMLElement>) => {
                              const { value } =
                                event.target as HTMLInputElement;
                              const newOptions = [...options];
                              const optionCode = value
                                .toLowerCase()
                                .replace(/[^a-z]/g, "")
                                .substring(0, 2);
                              newOptions[index].code = optionCode;
                              setOptions(newOptions);
                            }}
                          />
                        </td>
                      ) : (
                        <td align="center" valign="middle">
                          <Badge bg="primary" pill>
                            {option.code}
                          </Badge>
                        </td>
                      )}
                      <td>
                        <GenericInputField
                          name="description"
                          required
                          changeValue={option.description}
                          handleChange={(e: ChangeEvent<HTMLElement>) => {
                            const { value } = e.target as HTMLInputElement;
                            const newOptions = [...options];
                            newOptions[index].description = value;
                            setOptions(newOptions);
                          }}
                        />
                      </td>
                      <td>
                        <GenericInputField
                          name="sequence"
                          inputType="number"
                          required
                          changeValue={option.sequence.toString()}
                          handleChange={(event: ChangeEvent<HTMLElement>) => {
                            const { value } = event.target as HTMLInputElement;
                            const sequence = parseInt(value);
                            if (sequence < 0 || sequence > 99) {
                              return;
                            }
                            const newOptions = [...options];
                            newOptions[index].sequence = sequence;
                            setOptions(newOptions);
                          }}
                        />
                      </td>
                      <td align="center" valign="middle">
                        <Form.Check
                          type="checkbox"
                          checked={option.isCountable}
                          onChange={(event) => {
                            const newOptions = [...options];
                            newOptions[index].isCountable =
                              event.target.checked;
                            setOptions(newOptions);
                          }}
                        />
                      </td>
                      <td align="center" valign="middle">
                        <Form.Check
                          type="radio"
                          checked={option.isDefault}
                          onChange={(event) => {
                            const newOptions = [...options];
                            newOptions.forEach((option) => {
                              option.isDefault = false;
                            });
                            newOptions[index].isDefault = event.target.checked;
                            setOptions(newOptions);
                          }}
                        />
                      </td>
                      <td align="center" valign="middle">
                        <Button
                          size="sm"
                          variant="outline-warning"
                          className="me-1"
                          onClick={() => {
                            const newOptions = [...options];
                            // check if there is only one option left
                            if (newOptions.length === 1) {
                              alert(
                                "There must be at least one option in the dropdown list."
                              );
                              return;
                            }
                            newOptions.splice(index, 1);

                            if (option.isDefault) {
                              // if current deleted option is default, set first option as default
                              newOptions[0].isDefault = true;
                            }

                            if (option.code) {
                              // if deleting existing, set code for confirmation alert trigger.
                              setDeletedOptions([
                                ...deletedOptions,
                                option.code
                              ]);
                            }
                            setOptions(newOptions);
                          }}
                        >
                          🗑️
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          </Modal.Body>
          <Modal.Footer className="justify-content-around">
            <Button variant="secondary" onClick={modal.hide}>
              Close
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                const newOptions = [...options];
                // get highest sequence number
                const nextSequence =
                  Math.max(...newOptions.map((option) => option.sequence)) + 1;
                newOptions.push({
                  code: "",
                  description: "",
                  isCountable: true,
                  isDefault: false,
                  sequence: nextSequence,
                  isNew: true
                });

                // rerender table before scrolling to bottom
                flushSync(() => {
                  setOptions(newOptions);
                });

                // scroll to bottom of table
                const table = document.getElementById("optionTable");
                if (table) {
                  table.scrollIntoView({ behavior: "smooth", block: "end" });
                }
              }}
            >
              New Option
            </Button>
            <ModalSubmitButton isSaving={isSaving} />
          </Modal.Footer>
        </Form>
      </Modal>
    );
  }
);

export default UpdateCongregationOptions;
