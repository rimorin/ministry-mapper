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
import HomePlaceHolder from "./homeplaceholder";

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
        <Route path={"admin/:code"} element={<Dashboard />} />
        <Route
          path={"conductor/:code"}
          element={<Dashboard isConductor={true} userType="Conductor" />}
        />
        <Route path={"/:postalcode/:id"} element={<Home />} />
        <Route path="/test" element={<HomePlaceHolder />} />
      </Routes>
    </Container>
  );
}

export default Navigation;
