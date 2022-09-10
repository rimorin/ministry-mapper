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

function Navigation() {
  const [isMaintenance, setIsMaintenance] = useState<boolean>(false);
  const maintenanceReference = child(ref(database), `/maintenance`);

  useEffect(() => {
    onValue(maintenanceReference, (snapshot) => {
      if (snapshot.exists()) {
        console.log(snapshot.val());
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
