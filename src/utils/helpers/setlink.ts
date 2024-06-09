import { ref, set } from "firebase/database";
import { database } from "../../firebase";
import pollingVoidFunction from "./pollingvoid";
import triggerPostalCodeListeners from "./postalcodelistener";
import { LINK_TYPES } from "../constants";
import { LinkSession } from "../policies";
import addHours from "./addhours";

const setLink = (
  linktype: number,
  congregation: string,
  uid: string,
  postalCode: string,
  postalName: string,
  addressLinkId: string,
  hours: number,
  maxTries: number,
  publisherName = ""
) => {
  const link = new LinkSession();
  link.tokenEndtime = addHours(hours);
  link.postalCode = postalCode;
  link.linkType = linktype;
  link.maxTries = maxTries;
  // dont set user if its view type link. This will prevent this kind of links from appearing in assignments
  if (linktype != LINK_TYPES.VIEW) link.userId = uid;
  link.congregation = congregation;
  link.name = postalName;
  link.publisherName = publisherName;
  return pollingVoidFunction(async () => {
    await set(ref(database, `links/${congregation}/${addressLinkId}`), link);
    await triggerPostalCodeListeners(congregation, link.postalCode);
  });
};

export default setLink;
