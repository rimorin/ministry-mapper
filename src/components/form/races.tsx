import { HOUSEHOLD_TYPES } from "../../utils/constants";

const HHType = () => (
  <>
    <option value={HOUSEHOLD_TYPES.CHINESE}>Chinese</option>
    <option value={HOUSEHOLD_TYPES.MALAY}>Malay</option>
    <option value={HOUSEHOLD_TYPES.INDIAN}>Indian</option>
    <option value={HOUSEHOLD_TYPES.FILIPINO}>Filipino</option>
    <option value={HOUSEHOLD_TYPES.INDONESIAN}>Indonesian</option>
    <option value={HOUSEHOLD_TYPES.BURMESE}>Burmese</option>
    <option value={HOUSEHOLD_TYPES.THAI}>Thai</option>
    <option value={HOUSEHOLD_TYPES.VIETNAMESE}>Vietnamese</option>
    <option value={HOUSEHOLD_TYPES.OTHER}>Others</option>
  </>
);

export default HHType;
