import { createRoot } from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";
import { StrictMode } from "react";
import { Provider } from "@rollbar/react";
import NiceModal from "@ebay/nice-modal-react";
const {
  REACT_APP_ROLLBAR_ACCESS_TOKEN,
  REACT_APP_ROLLBAR_ENVIRONMENT,
  REACT_APP_VERSION
} = process.env;

const DEFEAULT_ROLLBAR_ENVIRONMENT = "staging";

const rollbarConfig = {
  accessToken: REACT_APP_ROLLBAR_ACCESS_TOKEN,
  payload: {
    environment: REACT_APP_ROLLBAR_ENVIRONMENT || DEFEAULT_ROLLBAR_ENVIRONMENT,
    client: {
      javascript: {
        source_map_enabled: true,
        code_version: REACT_APP_VERSION
      }
    }
  }
};

const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <StrictMode>
    <Provider config={rollbarConfig}>
      <NiceModal.Provider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </NiceModal.Provider>
    </Provider>
  </StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
