import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Draw from './Draw';
import Home from './Home';


export default function Index() {

  

  return (
    <BrowserRouter>
      <Routes>
        <Route path = '/' element = {<Home/>}>
          <Route index element = {<App/>}/>
          <Route path = "gray" element = {<App/>}/>
          <Route path = "draw" element = {<Draw/>}/>
        </Route>
        
      </Routes>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Index />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
