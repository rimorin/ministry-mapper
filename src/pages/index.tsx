import { child, ref, onValue } from "firebase/database";
import { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import { Routes, Route } from "react-router-dom";
import { NotFoundPage, FrontPage, MaintenanceMode } from "../components/static";
import { database } from "../firebase";
import Dashboard from "./dashboard/index";
import Territory from "./territory/index";
// Load bootstrap first followed by your custom styles
import "bootstrap/dist/css/bootstrap.min.css";
import "react-calendar/dist/Calendar.css";
import "../css/main.css";
import "../css/common.css";

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
      <Routes>
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/" element={<FrontPage />} />
        <Route path={"/:code"} element={<Dashboard />} />
        <Route
          path={"/:postalcode/:congregationcode/:id"}
          element={<Territory />}
        />
      </Routes>
    </Container>
  );
}

export default Main;
