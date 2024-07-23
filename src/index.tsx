import { createRoot } from "react-dom/client";
import Main from "./pages/index";
import { BrowserRouter } from "react-router-dom";
import { StrictMode } from "react";
import NiceModal from "@ebay/nice-modal-react";
import RollbarMiddleware from "./components/middlewares/rollbar";
import MapsMiddleware from "./components/middlewares/googlemap";
import PostHogMiddleware from "./components/middlewares/posthog";

const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <StrictMode>
    <RollbarMiddleware>
      <PostHogMiddleware>
        <MapsMiddleware>
          <NiceModal.Provider>
            <BrowserRouter>
              <Main />
            </BrowserRouter>
          </NiceModal.Provider>
        </MapsMiddleware>
      </PostHogMiddleware>
    </RollbarMiddleware>
  </StrictMode>
);
