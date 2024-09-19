import React, { lazy, Suspense, ReactNode } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "../App.scss";
import "../css/main.css";
import "../css/common.css";
import "react-calendar/dist/Calendar.css";
import Loader from "../components/statics/loader";
import MaintenanceMiddleware from "../components/middlewares/maintenance";
import MainMiddleware from "../components/middlewares/main";
import StateMiddleware from "../components/middlewares/context";
import MapsMiddleware from "../components/middlewares/googlemap";
import PostHogMiddleware from "../components/middlewares/posthog";
import RollbarMiddleware from "../components/middlewares/rollbar";
import { Provider as NiceModelMiddleware } from "@ebay/nice-modal-react";
import { RTDB_WEBSOCKET_FAILURE } from "../utils/constants";

const Map = lazy(() => import("./slip"));
const NotFoundPage = lazy(() => import("../components/statics/notfound"));
const FrontPage = lazy(() => import("./frontpage"));
const UserManagement = lazy(() => import("./usrmgmt"));
const ErrorPage = lazy(() => import("../components/statics/error"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <FrontPage />,
    errorElement: <ErrorPage />
  },
  {
    path: "/:code/:id",
    element: <Map />,
    errorElement: <ErrorPage />
  },
  {
    path: "/usermgmt",
    element: <UserManagement />,
    errorElement: <ErrorPage />
  },
  {
    path: "*",
    element: <NotFoundPage />
  }
]);

interface CombinedMiddlewareProps {
  children: ReactNode;
}

const CombinedMiddleware: React.FC<CombinedMiddlewareProps> = ({
  children
}) => (
  <RollbarMiddleware>
    <PostHogMiddleware>
      <MapsMiddleware>
        <NiceModelMiddleware>
          <StateMiddleware>
            <MainMiddleware>
              <MaintenanceMiddleware>{children}</MaintenanceMiddleware>
            </MainMiddleware>
          </StateMiddleware>
        </NiceModelMiddleware>
      </MapsMiddleware>
    </PostHogMiddleware>
  </RollbarMiddleware>
);

const Main: React.FC = () => {
  // Clear the RTDB_WEBSOCKET_FAILURE flag if it exists. This key is causing the app to load indefinitely.
  if (window.localStorage.getItem(RTDB_WEBSOCKET_FAILURE) !== null) {
    window.localStorage.removeItem(RTDB_WEBSOCKET_FAILURE);
  }
  return (
    <CombinedMiddleware>
      <Suspense fallback={<Loader />}>
        <RouterProvider router={router} />
      </Suspense>
    </CombinedMiddleware>
  );
};

export default Main;
