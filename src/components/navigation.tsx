import { useState, useEffect } from "react";
import { database, auth } from "./../firebase";
import Home from "./../components/home";
import { ref, get, child, onValue } from "firebase/database";
import { Routes, Route } from "react-router-dom";
import { Container } from "react-bootstrap";
import Loader from "./loader";
import Admin from "./admin";
import MaintenanceMode from "./maintenance";
import Login from "./login";
import FrontPage from "./frontpage";
import "bootstrap/dist/css/bootstrap.min.css";
import InvalidPage from "./invalidpage";
import { RouteDetails } from "./interface";
import NotFoundPage from "./notfoundpage";

function Navigation() {
  const [territories, setTerritories] = useState(Array<RouteDetails>);
  const [congregations, setCongregations] = useState(Array<String>);
  const [isMaintenance, setIsMaintenance] = useState<boolean>(false);
  const maintenanceReference = child(ref(database), `/maintenance`);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    onValue(maintenanceReference, (snapshot) => {
      if (snapshot.exists()) {
        setIsMaintenance(snapshot.val());
      }
    });
    get(child(ref(database), "/congregations"))
      .then((snapshot) => {
        if (snapshot.exists()) {
          const territoryDataList = [];
          const congregationList = [];
          const congregations = snapshot.val();
          for (const congregation in congregations) {
            const territories = congregations[congregation]["territories"];
            congregationList.push(congregation);
            for (const territory in territories) {
              const addresses = territories[territory]["addresses"];
              for (const address in addresses) {
                const details = {} as RouteDetails;
                details.name = addresses[address]["name"];
                details.postalCode = address;
                territoryDataList.push(details);
              }
            }
          }
          setCongregations(congregationList);
          setTerritories(territoryDataList);
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);
  if (isMaintenance) {
    return <MaintenanceMode />;
  }
  if (territories.length === 0) {
    return <Loader />;
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
