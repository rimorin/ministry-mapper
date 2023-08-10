import { memo } from "react";
import { Fade } from "react-bootstrap";
import { backToTopProp } from "../../utils/interface";
import { ReactComponent as TopArrowImage } from "../../assets/top-arrow.svg";

const BackToTopButton = memo(({ showButton }: backToTopProp) => (
  <Fade in={showButton}>
    <div
      onClick={() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      }}
      className="back-to-top"
    >
      <TopArrowImage />
    </div>
  </Fade>
));

export default BackToTopButton;
