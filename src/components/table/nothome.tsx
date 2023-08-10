import { memo } from "react";
import { nothomeProps } from "../../utils/interface";
import { Image } from "react-bootstrap";
import envelopeImage from "../../assets/envelope.svg";

const NotHomeIcon = memo(({ nhcount, classProp }: nothomeProps) => {
  let containerClass = "container-nothome";
  if (classProp) containerClass += ` ${classProp}`;
  return (
    <span className={containerClass}>
      <Image fluid src={envelopeImage} className="nothome-envelope" />
      {nhcount && <div className="badge-nothome">{nhcount}</div>}
    </span>
  );
});
export default NotHomeIcon;
