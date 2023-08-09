import NiceModal, { useModal, bootstrapDialog } from "@ebay/nice-modal-react";
import { useRollbar } from "@rollbar/react";
import { update, ref } from "firebase/database";
import { useState, FormEvent } from "react";
import { Form, Row, Col, Modal } from "react-bootstrap";
import RangeSlider from "react-bootstrap-range-slider";
import {
  DEFAULT_CONGREGATION_MAX_TRIES,
  DEFAULT_SELF_DESTRUCT_HOURS,
  WIKI_CATEGORIES,
  USER_ACCESS_LEVELS
} from "../../utils/constants";
import { pollingVoidFunction, errorHandler } from "../../utils/helpers";
import HelpButton from "../navigation/help";
import { database } from "../../firebase";
import ModalFooter from "../form/footer";

const UpdateCongregationSettings = NiceModal.create(
  ({
    currentName,
    currentCongregation,
    currentMaxTries = DEFAULT_CONGREGATION_MAX_TRIES,
    currentDefaultExpiryHrs = DEFAULT_SELF_DESTRUCT_HOURS
  }: {
    currentName: string;
    currentCongregation: string;
    currentMaxTries: number;
    currentDefaultExpiryHrs: number;
  }) => {
    const modal = useModal();
    const rollbar = useRollbar();
    const [maxTries, setMaxTries] = useState(currentMaxTries);
    const [defaultExpiryHrs, setDefaultExpiryHrs] = useState(
      currentDefaultExpiryHrs
    );
    const [name, setName] = useState(currentName);
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmitCongSettings = async (event: FormEvent<HTMLElement>) => {
      event.preventDefault();
      try {
        setIsSaving(true);
        await pollingVoidFunction(() =>
          update(ref(database, `congregations/${currentCongregation}`), {
            name: name,
            expiryHours: defaultExpiryHrs,
            maxTries: maxTries
          })
        );
        alert("Congregation settings updated.");
        window.location.reload();
      } catch (error) {
        errorHandler(error, rollbar);
      } finally {
        setIsSaving(false);
      }
    };

    return (
      <Modal {...bootstrapDialog(modal)}>
        <Form onSubmit={handleSubmitCongSettings}>
          <Modal.Header>
            <Modal.Title>Congregation Settings</Modal.Title>
            <HelpButton link={WIKI_CATEGORIES.MANAGE_CONG_SETTINGS} />
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="formBasicCongName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter congregation name"
                onChange={(event) => {
                  const { value } = event.target as HTMLInputElement;
                  setName(value);
                }}
                value={name}
              />
            </Form.Group>
            <Form.Group
              className="mb-3"
              controlId="formBasicTriesRange"
              as={Row}
            >
              <Form.Label>No. of Tries</Form.Label>
              <Col xs="9">
                <RangeSlider
                  tooltip="off"
                  min={2}
                  max={4}
                  value={maxTries}
                  onChange={(event) => {
                    const { value } = event.target as HTMLInputElement;
                    setMaxTries(parseInt(value));
                  }}
                />
              </Col>
              <Col xs="3">
                <Form.Control value={maxTries} disabled />
              </Col>
              <Form.Text muted>
                The number of times to try not at homes before considering it
                done
              </Form.Text>
            </Form.Group>
            <Form.Group
              className="mb-3"
              controlId="formBasicExpiryHoursRange"
              as={Row}
            >
              <Form.Label>Default Slip Expiry Hours</Form.Label>
              <Col xs="9">
                <RangeSlider
                  tooltip="off"
                  min={1}
                  max={24}
                  value={defaultExpiryHrs}
                  onChange={(event) => {
                    const { value } = event.target as HTMLInputElement;
                    setDefaultExpiryHrs(parseInt(value));
                  }}
                />
              </Col>
              <Col xs="3">
                <Form.Control value={defaultExpiryHrs} disabled />
              </Col>
              <Form.Text muted>
                The duration of the territory slip link before it expires
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <ModalFooter
            handleClick={modal.hide}
            isSaving={isSaving}
            userAccessLevel={USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE}
          />
        </Form>
      </Modal>
    );
  }
);

export default UpdateCongregationSettings;
