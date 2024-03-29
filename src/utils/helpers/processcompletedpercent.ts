import { MIN_PERCENTAGE_DISPLAY } from "../constants";

const processCompletedPercentage = (
  completedUnits: number,
  totalUnits: number
) => {
  const completedValue =
    totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;
  const completedDisplay =
    completedValue > MIN_PERCENTAGE_DISPLAY ? `${completedValue}%` : "";
  return { completedValue, completedDisplay };
};

export default processCompletedPercentage;
