import { floorDetails } from "../interface";
import { Policy } from "../policies";
import processCompletedPercentage from "./processcompletedpercent";

const getCompletedPercent = (policy: Policy, floors: floorDetails[]) => {
  let totalUnits = 0;
  let completedUnits = 0;

  if (!policy || !floors)
    return processCompletedPercentage(completedUnits, totalUnits);

  floors.forEach((element) => {
    element.units.forEach((uElement) => {
      const isCountable = policy.isCountable(uElement);
      if (!isCountable) return;
      if (isCountable) totalUnits++;
      if (policy.isCompleted(uElement)) completedUnits++;
    });
  });
  return processCompletedPercentage(completedUnits, totalUnits);
};

export default getCompletedPercent;
