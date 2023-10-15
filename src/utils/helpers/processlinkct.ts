import {
  get,
  query,
  child,
  ref,
  orderByChild,
  startAt,
  endAt,
  DataSnapshot
} from "firebase/database";
import { database } from "../../firebase";
import { LINK_TYPES } from "../constants";
import { LinkDetails, LinkSession } from "../policies";
import pollingQueryFunction from "./pollingquery";

const processLinkDetails = async (congregation: string, postal: string) => {
  const postalCode = postal as string;
  // need to add to rules for links: ".indexOn": "postalCode",
  const linksSnapshot = await pollingQueryFunction(() =>
    get(
      query(
        child(ref(database), `links/${congregation}`),
        orderByChild("postalCode"),
        startAt(postalCode),
        endAt(postalCode)
      )
    )
  );
  const details = new LinkDetails();
  linksSnapshot.forEach((rec: DataSnapshot) => {
    const link = rec.val() as LinkSession;
    const linkId = rec.key as string;
    const linkDetails = new LinkSession(link, linkId);
    if (link.linkType === LINK_TYPES.ASSIGNMENT) {
      details.assigneeDetailsList.push(linkDetails);
    }
    if (link.linkType === LINK_TYPES.PERSONAL) {
      details.personalDetailsList.push(linkDetails);
    }
  });
  return details;
};

export default processLinkDetails;
