import { child, onValue, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import database from "./../firebase";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { Table } from "react-bootstrap";
import Loader from "./loader";
interface adminProps {
  congregationCode: String;
}

interface territoryDetails {
  code: String;
  name: String;
  addresses: Array<Object>;
}

function Admin({ congregationCode }: adminProps) {
  const [name, setName] = useState<String>();
  const [territories, setTerritories] = useState<Array<territoryDetails>>([]);
  const [territory, setTerritory] = useState<String>();
  const congregationReference = child(
    ref(database),
    `congregations/${congregationCode}`
  );

  const handleSelect = (
    eventKey: string | null,
    e: React.SyntheticEvent<unknown>
  ) => {
    setTerritory(`${eventKey}`);
    const territoryDetails = territories.find((e) => e.code === eventKey);
    const territoryAddresses = territoryDetails?.addresses;
    for (const territory in territoryAddresses) {
      console.log(territory);
      onValue(child(ref(database), `/${territory}/units`), (snapshot) => {
        if (snapshot.exists()) {
          console.log(snapshot.val());
          //   processData(snapshot);
        }
      });
    }
  };

  useEffect(() => {
    onValue(congregationReference, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log(snapshot.val());
        document.title = `${data["name"]}`;
        const congregationTerritories = data["territories"];
        let territoryList = [];
        for (const territory in congregationTerritories) {
          const details = congregationTerritories[territory]["name"];
          const addresses = congregationTerritories[territory]["addresses"];
          console.log(congregationTerritories[territory]);
          territoryList.push({
            code: territory,
            name: details,
            addresses: addresses
          });
        }
        setTerritories(territoryList);
        setName(`${data["name"]}`);
      } else {
        console.log("No data");
      }
    });
  }, []);

  if (territories.length === 0) {
    return <Loader />;
  }

  return (
    <>
      <Navbar bg="light" expand="lg">
        <Container>
          <Navbar.Brand>{name}</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <NavDropdown
                title={territory ? `${territory}` : "Territories"}
                id="basic-nav-dropdown"
                onSelect={handleSelect}
                key={`${territory}`}
              >
                {territories &&
                  territories.map((element) => (
                    <NavDropdown.Item
                      key={`${element.code}`}
                      eventKey={`${element.code}`}
                    >
                      {element.name}
                    </NavDropdown.Item>
                  ))}
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {territories &&
        territories.map((item, index) => (
          <>
            <Table bordered responsive="sm"></Table>
          </>
        ))}
    </>
  );
}

export default Admin;
