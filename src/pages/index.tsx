import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
// Load bootstrap first followed by your custom styles
import "../App.scss";
import "../css/main.css";
import "../css/common.css";
import "react-calendar/dist/Calendar.css";
import Loader from "../components/statics/loader";
import MaintenanceMiddleware from "../components/middlewares/maintenance";
import MainMiddleware from "../components/middlewares/main";
import StateMiddleware from "../components/middlewares/context";
const Map = lazy(() => import("./slip"));
const NotFoundPage = lazy(() => import("../components/statics/notfound"));
const FrontPage = lazy(() => import("./frontpage"));
function Main() {
  return (
    <StateMiddleware>
      <MainMiddleware>
        <MaintenanceMiddleware>
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="*" element={<NotFoundPage />} />
              <Route path="/" element={<FrontPage />} />
              <Route path={"/:code/:id"} element={<Map />} />
            </Routes>
          </Suspense>
        </MaintenanceMiddleware>
      </MainMiddleware>
    </StateMiddleware>
  );
}

export default Main;
