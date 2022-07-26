import { useState, useEffect } from "react";
import { database } from "./../firebase";
import { ref, child, onValue } from "firebase/database";
import { Routes, Route } from "react-router-dom";
import { Container } from "react-bootstrap";
import MaintenanceMode from "./maintenance";
import FrontPage from "./frontpage";
import "bootstrap/dist/css/bootstrap.min.css";
import NotFoundPage from "./notfoundpage";
import Dashboard from "./dashboard";
import Territory from "./territory";

function Navigation() {
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

export default Navigation;
