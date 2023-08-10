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
import { LinkCounts, LinkSession } from "../policies";
import pollingQueryFunction from "./pollingquery";

const processLinkCounts = async (postal: string) => {
  const postalCode = postal as string;
  // need to add to rules for links: ".indexOn": "postalCode",
  const linksSnapshot = await pollingQueryFunction(() =>
    get(
      query(
        child(ref(database), "links"),
        orderByChild("postalCode"),
        startAt(postalCode),
        endAt(postalCode)
      )
    )
  );
  const currentTimestamp = new Date().getTime();
  const counts = new LinkCounts();
  linksSnapshot.forEach((rec: DataSnapshot) => {
    const link = rec.val() as LinkSession;
    if (link.tokenEndtime > currentTimestamp) {
      if (link.linkType === LINK_TYPES.ASSIGNMENT) {
        counts.assigneeCount++;
      }
      if (link.linkType === LINK_TYPES.PERSONAL) {
        counts.personalCount++;
      }
    }
  });
  return counts;
};

export default processLinkCounts;
