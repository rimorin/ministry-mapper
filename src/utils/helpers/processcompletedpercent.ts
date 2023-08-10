import { MIN_PERCENTAGE_DISPLAY } from "../constants";

const processCompletedPercentage = (
  completedUnits: number,
  totalUnits: number
) => {
  const completedValue = Math.round((completedUnits / totalUnits) * 100);
  const completedDisplay =
    completedValue > MIN_PERCENTAGE_DISPLAY ? `${completedValue}%` : "";
  return { completedValue, completedDisplay };
};

export default processCompletedPercentage;
