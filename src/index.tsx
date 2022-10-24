import { createRoot } from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";
import { StrictMode } from "react";
import { init } from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
const { REACT_APP_SENTRY_LOGGING_DSN, REACT_APP_DOMAIN_BASENAME } = process.env;

init({
  dsn: REACT_APP_SENTRY_LOGGING_DSN,
  integrations: [new BrowserTracing()],
  tracesSampleRate: 0.2
});

const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <StrictMode>
    <BrowserRouter
      basename={
        REACT_APP_DOMAIN_BASENAME ? REACT_APP_DOMAIN_BASENAME : undefined
      }
    >
      <App />
    </BrowserRouter>
  </StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
