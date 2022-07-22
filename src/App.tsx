import React from 'react';
import logo from './logo.svg';
import './App.css';
import database from './firebase';
import { Routes, Route, Link } from "react-router-dom";
import Home from './components/home';
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <div>
        <nav className="navbar navbar-expand navbar-dark bg-dark">
          <Link to={"/tutorials"} className="navbar-brand">
            bezKoder
          </Link>
          <div className="navbar-nav mr-auto">
            <li className="nav-item">
              <Link to={"/"} className="nav-link">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link to={"/about"} className="nav-link">
                Add
              </Link>
            </li>
          </div>
        </nav>
        <div className="container mt-3">
          <Routes>
            <Route path="/" element={<Home/>}/>
          </Routes>
        </div>
      </div>
  );
}

export default App;
