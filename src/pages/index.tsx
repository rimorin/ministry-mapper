import { child, ref, onValue } from "firebase/database";
import { useState, useEffect, lazy, Suspense } from "react";
import { Container } from "react-bootstrap";
import { Routes, Route } from "react-router-dom";
import { database } from "../firebase";
// Load bootstrap first followed by your custom styles
import "bootstrap/dist/css/bootstrap.min.css";
import "react-calendar/dist/Calendar.css";
import "../css/main.css";
import "../css/common.css";
import { MaintenanceMode, NotFoundPage, Loader } from "../components/static";

const FrontPage = lazy(() => import("./frontpage"));
const Territory = lazy(() => import("./territory/index"));
const Dashboard = lazy(() => import("./dashboard/index"));

function Main() {
  const [isMaintenance, setIsMaintenance] = useState<boolean>(false);

  useEffect(() => {
    const maintenanceReference = child(ref(database), `/maintenance`);
    onValue(maintenanceReference, (snapshot) => {
      if (snapshot.exists()) {
        setIsMaintenance(snapshot.val());
      }
    });
  }, []);
  if (isMaintenance) return <MaintenanceMode />;
  return (
    <Container className="pt-2" fluid>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/" element={<FrontPage />} />
          <Route path={"/:code"} element={<Dashboard />} />
          <Route
            path={"/:postalcode/:congregationcode/:id"}
            element={<Territory />}
          />
        </Routes>
      </Suspense>
      <div className="fixed-bottom text-muted opacity-25 m-2">
        <>v{process.env.REACT_APP_VERSION}</>
      </div>
    </Container>
  );
}

export default Main;
