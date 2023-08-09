import { memo } from "react";
import { HelpButtonProps } from "../../utils/interface";
import { ReactComponent as QuestionImage } from "../../assets/question.svg";
const HelpButton = memo(
  ({ link, isWarningButton = false }: HelpButtonProps) => (
    <QuestionImage
      className={`help-button ${isWarningButton ? "warning-help-button" : ""}`}
      onClick={() => window.open(link)}
    />
  )
);

export default HelpButton;
