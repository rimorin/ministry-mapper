import { LINK_TYPES } from "../constants";

const LinkTypeDescription = (linkType: number) => {
  let linkDescription = "";
  switch (linkType) {
    case LINK_TYPES.PERSONAL:
      linkDescription = "Personal";
      break;
    case LINK_TYPES.ASSIGNMENT:
      linkDescription = "Assign";
      break;
    default:
      linkDescription = "View";
  }
  return linkDescription;
};

export default LinkTypeDescription;
