import React, { useState, useEffect } from 'react';

import database from './../firebase';
import Home from './../components/home';
import "bootstrap/dist/css/bootstrap.min.css";
import { ref, get, child} from "firebase/database";
import { Routes, Route } from "react-router-dom";
function Navigation() {

    const [territories, setTerritories] = useState(Array<String>);

    useEffect(() => {
        get(child(ref(database),'/territories')).then((snapshot) => {
            if (snapshot.exists()) {
                let dataList = [];
                console.log("Getting nav data");
                const data = snapshot.val();
                for(const territory in data) {
                    const addresses = data[territory]["addresses"];
                    for(const address in addresses) {
                        dataList.push(address);
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
        return <div></div>
    }
    return (
        <div className="container mt-3">
        <Routes>
          <Route path="/" element={<div></div>}/>
          {territories.map((item,index)=>
             <Route key={index} path={`/${item}`} element={<Home postalcode={item} />}/>
        )};
        </Routes>
        </div>
    );   
}

export default Navigation;