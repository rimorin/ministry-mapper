import { floorDetails } from "../interface";
import { Policy } from "../policies";
import processCompletedPercentage from "./processcompletedpercent";

const getCompletedPercent = (policy: Policy, floors: floorDetails[]) => {
  if (!policy || !floors)
    return {
      completedValue: 0,
      completedDisplay: ""
    };
  let totalUnits = 0;
  let completedUnits = 0;

  floors.forEach((element) => {
    element.units.forEach((uElement) => {
      const isCountable = policy.isCountable(uElement);
      if (!isCountable) return;
      totalUnits++;
      if (policy.isCompleted(uElement)) completedUnits++;
    });
  });
  return processCompletedPercentage(completedUnits, totalUnits);
};

export default getCompletedPercent;
