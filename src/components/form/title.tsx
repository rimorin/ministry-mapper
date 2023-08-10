import { Modal } from "react-bootstrap";
import { TERRITORY_TYPES, WIKI_CATEGORIES } from "../../utils/constants";
import { TitleProps } from "../../utils/interface";
import HelpButton from "../navigation/help";

const ModalUnitTitle = ({
  unit,
  propertyPostal,
  floor,
  postal,
  name,
  type
}: TitleProps) => {
  let titleString = `# ${floor} - ${unit}`;

  if (postal) {
    titleString = `${postal}, ${titleString}`;
  }

  if (type === TERRITORY_TYPES.PRIVATE) {
    titleString = `${unit}, ${name}`;
    if (propertyPostal) {
      titleString = `${titleString}, ${propertyPostal}`;
    }
  }
  return (
    <Modal.Header>
      <Modal.Title>{titleString}</Modal.Title>
      <HelpButton link={WIKI_CATEGORIES.UPDATE_UNIT_STATUS} />
    </Modal.Header>
  );
};

export default ModalUnitTitle;
