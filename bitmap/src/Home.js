import React, {useState} from "react";
import { Outlet, Link } from "react-router-dom";
import "./Home.css";
const Home = () => {
  return (
    <>
    <ul>
      <li>
        <Link to="/">Home</Link>
      </li>
      <li>  
        <Link to="/gray">Gray Scale</Link>
      </li>
      <li>  
        <Link to="/draw">Drawing</Link>
      </li>
        
    </ul>
    <Outlet />    
    </>
  )
};

export default Home;