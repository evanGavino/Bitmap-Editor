
import React, {useState} from "react";
//import { useEffect } from "react";
import './App.css';
import placeholder from "./resources/placeholder.png"



function App() {

  const [file, setFile] = useState();
  const [fileURL, setFileURL] = useState(placeholder);
  const [grayURL, setGrayURL] = useState(placeholder);
  
  function handleClick(event) {
    event.preventDefault();
    
    //console.log(event.target.files[0]);
    if (event.target.files[0] !== undefined) {
      setFile(event.target.files[0]);
      setFileURL(URL.createObjectURL(event.target.files[0]));
      setGrayURL();
    }
    
    
  }
  
  function handleSubmit(event) {
    
    event.preventDefault();
    
    console.log(file);
    const formData = new FormData();
    formData.append('file', file);
    
    
    const options = {
      method: 'POST',
      body: formData
    };
    fetch('/',options)
      .then((response) => response.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        setGrayURL(url);
      });
  }

  return (
    <div className="App">
      <form onSubmit={handleSubmit} className="fileForm" encType="multipart/form-data">
          <h1 className="title">Gray Scale Generator</h1>
          <h4 className="description">Upload a file below</h4>
          <label htmlFor = "fileInput" className = "fileInputLabel">Choose File</label>
          <input type="file" onChange={handleClick} className="fileInput" id = "fileInput" accept = ".bmp" multiple = {false}/>
          <div className="displayBox">
            <div className="imageHolder" id = "holderLeft">
              <img src = {fileURL} alt = "" className="bmpDisplay"/>
            </div>
            <div className="imageHolder" id = "holderRight">
              <img src = {grayURL} alt = "" className = "bmpDisplay"/>  
            </div>      
          </div>
          <button type="submit" className="submitButton">Upload</button>
        </form>
        
      
    </div>
  );
}

export default App;
