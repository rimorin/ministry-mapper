import { FIREBASE_FUNCTION_TIMEOUT } from "../constants";
import SetPollerInterval from "./pollinginterval";

const pollingVoidFunction = async (
  callback: () => Promise<void>,
  intervalMs = FIREBASE_FUNCTION_TIMEOUT
) => {
  const reconnectRtdbInterval = SetPollerInterval(intervalMs);
  try {
    await callback();
  } finally {
    clearInterval(reconnectRtdbInterval);
  }
};

export default pollingVoidFunction;
