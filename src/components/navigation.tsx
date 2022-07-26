import React, { useState, useEffect } from 'react';

import database from './../firebase';
import Home from './../components/home';
import "bootstrap/dist/css/bootstrap.min.css";
import { ref, get, child} from "firebase/database";
import { Routes, Route } from "react-router-dom";
import { Container, Spinner } from 'react-bootstrap';

interface RouteDetails {
    postalCode: String,
    name: String
}
function Navigation() {

    const [territories, setTerritories] = useState(Array<RouteDetails>);

    useEffect(() => {
        get(child(ref(database),'/territories')).then((snapshot) => {
            if (snapshot.exists()) {
                let dataList = [];
                console.log("Getting nav data");
                const data = snapshot.val();
                for(const territory in data) {
                    const addresses = data[territory]["addresses"];
                    for(const address in addresses) {
                        dataList.push({postalCode: address, name: addresses[address]["name"]});
                    }
                }
                console.log(dataList);
                setTerritories(dataList);
            } else {
            console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        });
        // Update the document title using the browser API
      }, []);
    if (territories.length === 0) {
        return <Container className='d-flex align-items-center justify-content-center vh-100' fluid>
        <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
        </Spinner>
        </Container>
    }
    return (
        <Container fluid>
        <Routes>
          <Route path="/" element={<div></div>}/>
          {territories.map((item,index)=>
             <Route key={index} path={`/${item.postalCode}`} element={<Home postalcode={item.postalCode} name={item.name} />}/>
        )};
        </Routes>
        </Container>
    );   
}

export default Navigation;