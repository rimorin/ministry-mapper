import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
// Load bootstrap first followed by your custom styles
import "../App.scss";
import "../css/main.css";
import "../css/common.css";
import Loader from "../components/statics/loader";
import MaintenanceMiddleware from "../components/middlewares/maintenance";
import MainMiddleware from "../components/middlewares/main";
const NotFoundPage = lazy(() => import("../components/statics/notfound"));
const FrontPage = lazy(() => import("./frontpage"));
const Territory = lazy(() => import("./territory/index"));
const Dashboard = lazy(() => import("./dashboard/index"));
function Main() {
  return (
    <MainMiddleware>
      <MaintenanceMiddleware>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="*" element={<NotFoundPage />} />
            <Route path="/" element={<FrontPage />} />
            <Route path={"/:code"} element={<Dashboard />} />
            <Route path={"/:code/:id"} element={<Territory />} />
          </Routes>
        </Suspense>
      </MaintenanceMiddleware>
    </MainMiddleware>
  );
}

export default Main;
