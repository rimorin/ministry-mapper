import { DataSnapshot } from "firebase/database";
import { FIREBASE_FUNCTION_TIMEOUT } from "../constants";
import SetPollerInterval from "./pollinginterval";

const pollingQueryFunction = async (
  callback: () => Promise<DataSnapshot>,
  intervalMs = FIREBASE_FUNCTION_TIMEOUT
) => {
  const reconnectRtdbInterval = SetPollerInterval(intervalMs);
  try {
    return await callback();
  } finally {
    clearInterval(reconnectRtdbInterval);
  }
};

export default pollingQueryFunction;
