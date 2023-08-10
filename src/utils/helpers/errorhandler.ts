import Rollbar from "rollbar";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const errorHandler = (error: any, rollbar: Rollbar, showAlert = true) => {
  rollbar.error(error);
  if (showAlert) {
    alert(error);
  }
};

export default errorHandler;
