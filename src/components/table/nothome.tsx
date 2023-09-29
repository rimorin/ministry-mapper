import { memo } from "react";
import { nothomeProps } from "../../utils/interface";
import { Image } from "react-bootstrap";
import envelopeImage from "../../assets/envelope.svg";

const NotHomeIcon = memo(({ nhcount, classProp }: nothomeProps) => {
  let parentClass = "parent-nothome";
  if (classProp) parentClass += ` ${classProp}`;
  return (
    <div className={parentClass}>
      <div className="container-nothome">
        <Image fluid src={envelopeImage} className="nothome-envelope" />
        {nhcount && <div className="badge-nothome">{nhcount}</div>}
      </div>
    </div>
  );
});
export default NotHomeIcon;
