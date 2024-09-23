import React, {useState, useRef, useEffect, useCallback} from "react";
import "./Draw.css";
import ColorPicker from "./ColorPicker";
import eyedropper from "./resources/eyedropper.svg";
import pencil from "./resources/pencil.svg";
import reset from "./resources/reset.svg";
import xIcon from "./resources/x-letter.svg";
import download from "./resources/download.svg";

//Component that allows users to draw on an uploaded bitmap or a blank canvas
function Draw() {
    const canvasElement = useRef();
    const drawButton = useRef();
    const slider = useRef();

    const [file, setFile] = useState();
    const [fileWidth, setFileWidth] = useState('0px');
    const [fileHeight, setFileHeight] = useState('0px');
    const [pixelArray, setPixelArray] = useState([]);
    

    

    const [cursor, setCursor] = useState("auto");

    const [eyeDropPressed, setEyeDropPressed] = useState(false);

    const [canvasPos, setCanvasPos] = useState([0,0]);
    const [prevCanvasPos, setPrevCanvasPos] = useState([0,0]);
    const [canvasClicked, setCanvasClicked] = useState(0);
    
    const [drawButtonPressed,setDrawButtonPressed] = useState(false);

    const [fileRedraw, setFileRedraw] = useState(0);
    const [blankRedraw, setBlankRedraw] = useState(0);

    const [color, setColor] = useState("#000000");

    const [brushSize, setBrushSize] = useState(10);

    const [drawButtonColor, setDrawButtonColor] = useState("");
    const [eyedropButtonColor, setEyedropButtonColor] = useState("");

    const [showPopUp, setShowPopUp] = useState(false);
    const [popUpSubmitted, setPopUpSubmitted] = useState(false);
    const [blankCanvasActive, setBlankCanvasActive] = useState(false);

    const [showColorPicker, setShowColorPicker] = useState(false);

    const [showDownload, setShowDownload] = useState(false);
    const [canvasURL, setCanvasURL] = useState();

    const [windowDimensions, setWindowDimensions] = useState({
        width: window.innerWidth,
        height : window.innerHeight
    });
    

    const [drawZoneDimensions, setDrawZoneDimensions] = useState({
        width: "100%",
        height : "100%"
    });


    //tracks window resizes after file canvas size updated
    useEffect(() => {
        console.log("resized");
        const handleResize = () => setWindowDimensions({
            width: window.innerWidth,
            height : window.innerHeight
        });
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [pixelArray, showPopUp]);

    //allows the user to start or stop drawing on the canvas
    function startDraw() {
        if (drawButtonPressed) {
            canvasElement.current.removeEventListener("mousedown", canvasMouseDown);
            setDrawButtonPressed(false);
            setDrawButtonColor("");
            setCanvasClicked(0);
        } else {
            setDrawButtonPressed(true);
            
            canvasElement.current.addEventListener("mousedown", canvasMouseDown);
            setDrawButtonColor("#a6e2ff");
            if (eyeDropPressed === true) {
                canvasElement.current.removeEventListener("click", getColor);
                setEyeDropPressed(false);
                setEyedropButtonColor("");
            }
            setCursor("default");
        }
    }

    //tracks whether the mouse is currently being held down on the canvas
    const canvasMouseDown = useCallback(() => {
        setCanvasClicked(1);
    },[]);

    //tracks whether the mouse has stopped being held down
    const canvasMouseUp = useCallback(() => {
        setCanvasClicked(0);
        //console.log("mouse up");
    }, []); 

    
    //draws a circle of diameter brush size at a given x and y coord
    function freeDraw(context,x,y) {
        context.fillStyle = color;
        //context.fillRect(x,y,brushSize,brushSize);
        context.beginPath();
        context.arc(x,y,brushSize/2,0,2*Math.PI);
        context.fill();
        //console.log("rectangle drawn");
    }

    //Draws circles in between the last two known mouse positions to ensure all lines drawn are continuous
    function fillGaps(context,startingX, startingY, endingX,endingY) {
        
        const xDiff = startingX - endingX;
        const yDiff = startingY - endingY;
        let xInc = 0;
        let yInc = 0;
        if (xDiff > 0) {
            xInc = -1;
        } else if (xDiff < 0) {
            xInc = 1;
        }

        if (yDiff > 0) {
            yInc = -1;
        } else if (yDiff < 0) {
            yInc = 1;
        }
        //console.log(xInc, yInc);
        let rate = 0;
        
        if (Math.abs(yDiff) > Math.abs(xDiff)) {
            rate = Math.abs(xDiff/yDiff);
            
            for (let i = 0; i < Math.abs(yDiff); i++) {
                freeDraw(context,startingX+(i*rate*xInc), startingY+(i*yInc));
            }

        } else if (Math.abs(yDiff) < Math.abs(xDiff)) {
            rate = Math.abs(yDiff/xDiff);
            for (let i = 0; i < Math.abs(xDiff); i++) {
                freeDraw(context,startingX+(i*xInc), startingY+(i*rate*yInc), 10,10);
            }
        } else {
            rate = 1;
            for (let i = 0; i < Math.abs(yDiff); i++) {
                freeDraw(context,startingX+(i*xInc), startingY+(i*yInc), 10,10);
            }
        }
            
        

        
        
    }
    
    //Draws the initial image onto the canvas
    useEffect(() => {
        
        const canvas = canvasElement.current;
        const context = canvas.getContext('2d');
        canvas.width = fileWidth;
        canvas.height = fileHeight;
        
        context.fillStyle = "white";
        if (pixelArray.length !== 0) {
            
            let k = pixelArray.length-1;
            for (let i = 0; i < pixelArray.length-1; i++) {
                
                for (let j = pixelArray[i].length-1; j > 0; j--) {

                    
                    context.fillStyle = `rgb(${pixelArray[i][j][0]} ${pixelArray[i][j][1]} ${pixelArray[i][j][2]})`;
                    context.fillRect(j,k,1,1);
                    
                    
                }
                k--;
            }
            
            setShowDownload(true);
            setBlankCanvasActive(false);
        }
        
        if (fileHeight > windowDimensions.height) {
            if (fileWidth > windowDimensions.width) {
                setDrawZoneDimensions({
                    width: fileWidth + 150,
                    height: fileHeight + 150
                });
            } else {
                setDrawZoneDimensions({
                    width: "100%",
                    height: fileHeight + 150
                });
            }
            
        } else {
            if (fileWidth > windowDimensions.width) {
                setDrawZoneDimensions({
                    width: fileWidth + 150,
                    height: "100%"
                });
            } else {
                setDrawZoneDimensions({
                    width: "100%",
                    height: "100%"
                });
            }
        }
        
        

    }, [pixelArray, fileWidth, fileHeight, fileRedraw]);


    //Every time the mouse position is updated, it checks if the mouse is currently being held down, if it is it starts to draw circles at the mouse position until the mouse is lifted
    useEffect(() => {
        
        if (canvasClicked === 1) {
            const canvas = canvasElement.current;
            const context = canvas.getContext('2d');
            freeDraw(context, canvasPos[0], canvasPos[1]);
            if (Math.abs(canvasPos[0]-prevCanvasPos[0]) > (brushSize/2) || Math.abs(canvasPos[1]-prevCanvasPos[1]) > (brushSize/2)) {
                fillGaps(context,prevCanvasPos[0],prevCanvasPos[1],canvasPos[0],canvasPos[1]);
            }
            
            //console.log("image edited");
            
        
            canvas.addEventListener("mouseup", canvasMouseUp);

            

            return () => {
                canvas.removeEventListener("mouseup", canvasMouseUp);
                
                
            }
        }
    }, [canvasPos]);

    
    //Tracks the position of the mouse
    function printCoords(event) {
        
        const canvasInfo = canvasElement.current.getBoundingClientRect();
        let canvasX = event.clientX-canvasInfo.left
        let canvasY = event.clientY-canvasInfo.top
        
        setPrevCanvasPos([canvasPos[0],canvasPos[1]]);
        setCanvasPos([canvasX, canvasY]);
        
        
        return [canvasX,canvasY];
        
        
    }

    
    
    //Stores the user uploaded file
    function handleClick(event) {
        event.preventDefault();
        if (event.target.files[0] !== undefined) {
            setFile(event.target.files[0]);
            
        }
        
        
    }
    
    //Sends the uploaded file to the node server and parses the response into an array
    function handleSubmit(event) {
        
        event.preventDefault();
        
        //console.log(file);
        const formData = new FormData();
        formData.append('file', file);
        
        
        const options = {
        method: 'POST',
        headers: {
            //"Content-Type": "multipart/form-data",
        },
        body: formData
        };
        fetch('/draw',options)
        .then(function(response) {
            console.log("Response status: " + response.status);
            return response.text();
        })
        .then((text) => {
            let array = JSON.parse(text);
            setPixelArray(array);
            
            return array;
        })
        .then((array) => {
            let width = array[array.length-1][0];
            let height = array[array.length-1][1];
            setFileWidth(width);
            setFileHeight(height);
            
        });
        
        
        

    }

    //checks if the user is editing a blank canvas or an image, then removes all edits
    function removeEdits() {
        if (blankCanvasActive) {
            setBlankRedraw(blankRedraw+1);
        } else {
            setFileRedraw(fileRedraw + 1);
        }
        
    }

    //Gets the color at the current mouse position, then sets the brush color to that value
    const getColor = useCallback((event) => {
        //setCanvasClicked(2);
        let mousePos = printCoords(event);
        let context = canvasElement.current.getContext('2d');
        let image = context.getImageData(mousePos[0],mousePos[1],1,1);
        
        let red = (image.data[0].toString(16).length === 1) ? "0" + image.data[0].toString(16) : image.data[0].toString(16);
        let green = (image.data[1].toString(16).length === 1) ? "0" + image.data[1].toString(16) : image.data[1].toString(16);
        let blue = (image.data[2].toString(16).length === 1) ? "0" + image.data[2].toString(16) : image.data[2].toString(16);
        
        console.log(`rgb(${image.data[0]},${image.data[1]},${image.data[2]})`);
        setColor(`#${red}${green}${blue}`);
        
        //setOtherPixelString(pixelString);
    },[]);
    
    //Allows the user to set the brush color to a color on the canvas
    function eyedrop() {
        //console.log(drawButtonPressed);
        if (eyeDropPressed) {
            canvasElement.current.removeEventListener("click",getColor);
            setEyeDropPressed(false);
            setCursor("default");
            setEyedropButtonColor("");
            
        } else {
            if (drawButtonPressed) {
                canvasElement.current.removeEventListener("mousedown", canvasMouseDown);
                setDrawButtonPressed(false);
                setDrawButtonColor("");
                setCanvasClicked(0);
            }
            setEyeDropPressed(true);
            setCursor("crosshair");
            setEyedropButtonColor("#a6e2ff");
            canvasElement.current.addEventListener("click",getColor);
        }
        
    }
    

    //Draws the blank canvas when the popup has been submitted
    useEffect (() => {
        if (popUpSubmitted) {
            let context = canvasElement.current.getContext('2d');
            context.fillStyle = "white";
            context.fillRect(0,0,canvasElement.current.width, canvasElement.current.height);
            setShowDownload(true);
            setBlankCanvasActive(true);
        }

    }, [popUpSubmitted, blankRedraw]);
    
    //Pop up that allows the user to specify the dimensions of the blank canvas
    function BlankCanvasMenu() {
        const [blankWidth, setBlankWidth] = useState("");
        const [blankHeight, setBlankHeight] = useState("");  
        function setDimensions() {
            canvasElement.current.width = blankWidth;
            canvasElement.current.height = blankHeight;
            setShowPopUp(false);
            setPopUpSubmitted(true);
            if (Number(blankHeight) > windowDimensions.height) {
                if (Number(blankWidth) > windowDimensions.width) {
                    setDrawZoneDimensions({
                        width: Number(blankWidth) + 150,
                        height: Number(blankHeight) + 150
                    });
                } else {
                    setDrawZoneDimensions({
                        width: "100%",
                        height: Number(blankHeight) + 150
                    });
                }
                
            } else {
                if (Number(blankWidth) > windowDimensions.width) {
                    setDrawZoneDimensions({
                        width: Number(blankWidth) + 150,
                        height: "100%"
                    });
                } else {
                    setDrawZoneDimensions({
                        width: "100%",
                        height: "100%"
                    });
                }
            }
            
            
            
        }
        return (
            <div className="popupBackGround" style={{width : windowDimensions.width, height : windowDimensions.height}}>
                <div className="popupHolder">
                    <button className="xButton" onClick={() => setShowPopUp(false)}><img src={xIcon} alt="Reset" style={{width: "10px", height: "10px"}}/></button>
                    <div className="textHolder">
                        
                        <input type="text" className="textInput" id = "width" placeholder="Width" value = {blankWidth}  onChange={(event) => setBlankWidth(event.target.value)}></input>
                        <input type="text" className="textInput" id = "height" placeholder="Height" value = {blankHeight} onChange={(event) => setBlankHeight(event.target.value)}></input>
                        <button className="dimensionSubmit" onClick={setDimensions}>Submit</button>
                    </div>
                    
                </div>
            </div>
        );
    }
    

    return (
        <div className = "appHolder">
            
            
            
            <div className = "drawZone" style={{width : drawZoneDimensions.width, height : drawZoneDimensions.height}}>

            
                <div className = "buttonHolder">
                    
                    <button className="drawButton" ref={drawButton} onClick={startDraw} style={{backgroundColor:drawButtonColor}}> <img src={pencil} alt="Pencil" /></button>
                    <input type="range" min="1" max="40" className="brushSlider" value = {brushSize} onChange={(event) => setBrushSize(event.target.value)} ref={slider}/>
                    <input type="text" className="brushInput" value = {brushSize} onChange={(event) => setBrushSize(event.target.value)}/>
                    <button className="redrawButton" onClick={removeEdits}><img src={reset} alt="Reset" style={{height : "16px", width : "16px"}}/></button>
                    <button className="eyedropButton" onClick={eyedrop} style={{backgroundColor:eyedropButtonColor}}><img src={eyedropper} alt="Eyedropper" style={{height : "16px", width : "16px"}}/></button>
                    <div className="colorContainer">
                        <button className="colorPreviewBackground" onClick={() => setShowColorPicker(!showColorPicker)}>
                            <div className="colorSelect" style={{backgroundColor:color}}></div>
                            
                        </button>   
                        {showColorPicker ?
                            <div className="colorPicker">
                                
                                <div className = "colorPickerBackground">
                                    
                                    <ColorPicker setColor = {setColor} color = {color}/>
                                    <input type="text" className="colorInput" value = {color} onChange = {(event) => setColor(event.target.value)}></input>
                                </div>
                            </div>: null
                        }
                    </div>
                        
                    
                    <form onSubmit={handleSubmit} className="canvasFileForm" encType="multipart/form-data">
                        <input type="file" onChange={handleClick} className="canvasInput" id = "canvasInput" accept = ".bmp" multiple = {false}/>         
                        <button type="submit" className="submit">Upload</button>
                    </form>
                    <button className="blankButton" onClick={() => {setShowPopUp(true);setPopUpSubmitted(false)}}>Blank Canvas</button>
                    {showDownload ? <div className="downloadHolder">
                        <a href={canvasURL} download="drawing.bmp">
                            <button onClick={() => setCanvasURL(canvasElement.current.toDataURL("image/bmp"))} className="downloadButton"><img src={download} alt="download" style={{height : "16px", width : "16px"}}/></button>
                        </a>
                    </div> : null}
                    
                </div>
                <div className="canvasHolder" >
                    
                    {showPopUp ? <BlankCanvasMenu/> : null}
                    <canvas className = "imageRender" onMouseMove={(event) => printCoords(event)} ref = {canvasElement} style={{cursor:cursor, backgroundColor:"white"}}></canvas>
                    
                    
                </div>
                
            </div>
            
            <div className="coordHolder">
                <p className="coords">{Math.floor(canvasPos[0])+", "+Math.floor(canvasPos[1])}</p>
                
            </div>
        </div>
        
    );
}

export default Draw;