import React from 'react';
import logo from './logo.svg';
// import './App.css';
import database from './firebase';

import Home from './components/home';
import "bootstrap/dist/css/bootstrap.min.css";
import { getDatabase, ref, get, child} from "firebase/database";
import Navigation from './components/navigation';

function App() {

  return (
    <div>
        <Navigation/>
    </div>
  );
}

export default App;
