import { goOffline, goOnline } from "firebase/database";
import { database } from "../../firebase";
import { FIREBASE_FUNCTION_TIMEOUT } from "../constants";

const SetPollerInterval = (intervalMs = FIREBASE_FUNCTION_TIMEOUT) => {
  return setInterval(() => {
    goOffline(database);
    goOnline(database);
  }, intervalMs);
};

export default SetPollerInterval;
