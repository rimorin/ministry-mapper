import { useState, useEffect } from "react";
import { database } from "./../firebase";
import Home from "./../components/home";
import { ref, child, onValue } from "firebase/database";
import { Routes, Route } from "react-router-dom";
import { Container } from "react-bootstrap";
import MaintenanceMode from "./maintenance";
import FrontPage from "./frontpage";
import "bootstrap/dist/css/bootstrap.min.css";
import NotFoundPage from "./notfoundpage";
import Dashboard from "./dashboard";
import ConnectionPage from "./connectionpage";

function Navigation() {
  const [isMaintenance, setIsMaintenance] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const maintenanceReference = child(ref(database), `/maintenance`);
  const connectedRef = ref(database, ".info/connected");

  useEffect(() => {
    onValue(maintenanceReference, (snapshot) => {
      if (snapshot.exists()) {
        setIsMaintenance(snapshot.val());
      }
    });
    onValue(connectedRef, (snapshot) => {
      setIsOnline(snapshot.val());
    });
  }, []);
  if (!isOnline) return <ConnectionPage />;
  if (isMaintenance) return <MaintenanceMode />;
  return (
    <Container className="pt-2" fluid>
      <Routes>
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/" element={<FrontPage />} />
        <Route path={"admin/:code"} element={<Dashboard />} />
        <Route
          path={"conductor/:code"}
          element={<Dashboard isConductor={true} userType="Conductor" />}
        />
        <Route path={"/:postalcode/:id"} element={<Home />} />
      </Routes>
    </Container>
  );
}

export default Navigation;
