import NiceModal, { useModal, bootstrapDialog } from "@ebay/nice-modal-react";
import { Modal } from "react-bootstrap";
import { USER_ACCESS_LEVELS } from "../../utils/constants";
import ModalFooter from "../form/footer";
import { ShowExpiryModalProps } from "../../utils/interface";
import Countdown from "react-countdown";

const ShowExpiry = NiceModal.create(({ endtime }: ShowExpiryModalProps) => {
  const modal = useModal();

  return (
    <Modal {...bootstrapDialog(modal)} onHide={() => modal.remove()}>
      <Modal.Header style={{ display: "flex", justifyContent: "center" }}>
        <Modal.Title>Link Expiration Timer</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <Countdown
          className="m-1"
          date={endtime}
          daysInHours={true}
          intervalDelay={100}
          precision={3}
          renderer={(props) => {
            const daysDisplay = props.days !== 0 ? <>{props.days} d </> : <></>;
            const hoursDisplay =
              props.hours !== 0 ? <>{props.hours} h </> : <></>;
            const minsDisplay =
              props.minutes !== 0 ? <>{props.minutes} m </> : <></>;
            const secondsDisplay =
              props.seconds !== 0 ? <>{props.seconds} s </> : <></>;
            return (
              <div>
                {daysDisplay}
                {hoursDisplay}
                {minsDisplay}
                {secondsDisplay}
              </div>
            );
          }}
        />
      </Modal.Body>
      <ModalFooter
        handleClick={modal.hide}
        userAccessLevel={USER_ACCESS_LEVELS.READ_ONLY.CODE}
      />
    </Modal>
  );
});

export default ShowExpiry;
