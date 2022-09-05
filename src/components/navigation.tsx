import { useState, useEffect } from "react";
import { database, auth } from "./../firebase";
import Home from "./../components/home";
import { ref, child, onValue } from "firebase/database";
import { Routes, Route } from "react-router-dom";
import { Container } from "react-bootstrap";
import Admin from "./admin";
import MaintenanceMode from "./maintenance";
import Login from "./login";
import FrontPage from "./frontpage";
import "bootstrap/dist/css/bootstrap.min.css";
import NotFoundPage from "./notfoundpage";

function Navigation() {
  const [isMaintenance, setIsMaintenance] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const maintenanceReference = child(ref(database), `/maintenance`);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    onValue(maintenanceReference, (snapshot) => {
      if (snapshot.exists()) {
        setIsMaintenance(snapshot.val());
      }
    });
  }, []);
  if (isMaintenance) {
    return <MaintenanceMode />;
  }
  return (
    <Container className="pt-2" fluid>
      <Routes>
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/" element={<FrontPage />} />
        <Route
          path={"admin/:code"}
          element={user ? <Admin user={user} /> : <Login loginType={"Admin"} />}
        />
        <Route
          path={"conductor/:code"}
          element={
            user ? (
              <Admin user={user} isConductor={true} />
            ) : (
              <Login loginType={"Conductor"} />
            )
          }
        />
        <Route path={"/:postalcode/:id"} element={<Home />} />
      </Routes>
    </Container>
  );
}

export default Navigation;
