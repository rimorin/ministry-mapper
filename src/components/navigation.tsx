import { useState, useEffect } from 'react';
import database from './../firebase';
import Home from './../components/home';
import { ref, get, child} from "firebase/database";
import { Routes, Route } from "react-router-dom";
import { Container } from 'react-bootstrap';
import Loader from './loader';
import "bootstrap/dist/css/bootstrap.min.css";

interface RouteDetails {
    postalCode: String,
    name: String
}
function Navigation() {

    const [territories, setTerritories] = useState(Array<RouteDetails>);

    useEffect(() => {
        get(child(ref(database),'/congregations')).then((snapshot) => {
            if (snapshot.exists()) {
                let dataList = [];
                const congregations = snapshot.val();
                for(const congregation in congregations) {
                    const territories = congregations[congregation]["territories"];
                    for (const territory in territories) {
                        const addresses = territories[territory]["addresses"];
                        for(const address in addresses) {
                            const details = {} as RouteDetails
                            details.name = addresses[address]["name"];
                            details.postalCode = address;
                            dataList.push(details);
                        }
                    }
                    
                }
                setTerritories(dataList);
            } else {
            console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        });
      }, []);
    if (territories.length === 0) {
        return <Loader/>
    }
    return (
        <Container className='pt-2' fluid>
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