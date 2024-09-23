import * as fs from 'node:fs';
import cors from 'cors';
import express from 'express';
import multer from 'multer';


const app = express();
const storage = multer.memoryStorage();
const upload = multer({storage: storage});
const port = 8080;


app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello World!');
})

app.get('/draw', (req,res) => {
    res.send("Test");
})

app.post('/draw', upload.single('file'), (req,res) => {

    let imageBuffer = req.file.buffer;
    const pixelData = readBMP(imageBuffer);
    console.log(pixelData);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('content-type', 'application/json');
    res.send(pixelData);
    
});

app.post('/', upload.single('file'), function (req, res) {
     
    let imageBuffer = req.file.buffer;
    
    console.log(readBMP(imageBuffer));
    createGrayScale(imageBuffer);
    
    const options = {
        root: "#"
    }
    res.sendFile("temp.bmp",options, function (err) {
        if (err) { 
            console.log(err);
        } else {
            console.log("File sent");
        }
    })
    
 });

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
});





/*
🟥 = 248, 49, 47
🟦 = 0, 166, 237
🟧 = 255, 103, 35
🟨 = 255, 176, 46
🟩 = 0, 210, 106
🟪 = 199, 144, 241
🟫 = 165, 105, 83
⬛ = 0, 0, 0
⬜ = 255, 255, 255
*/
let color = ["🟥", "🟦", "🟧", "🟨", "🟩", "🟪", "🟫", "⬛", "⬜"];
let red = [248, 0, 255, 255, 0, 199, 165, 0, 255];
let green = [49, 166, 103, 176, 210, 144, 105, 0, 255];
let blue = [47, 237, 35, 46, 106, 241, 83, 0, 255];




function readBMP(data) {

    
    
    let pos = 0;
    
    let size = "0x";
    for (let i = 5; i > 1; i--) {
        size += data[i].toString(16);
    }
    
    let sizeDecimal = Number(size);
    

    let offset = data[10];
    let width = "0x";
    for (let i = 21; i > 17; i--) {
        width += data[i].toString(16);
    }
    let height = "0x";
    for (let i = 25; i > 21; i--) {
        height += data[i].toString(16);
    }

    let widthNumber = Number(width);
    let heightNumber = Number(height);
    
    pos = offset;

    let nextMultiple = (widthNumber + 1) * 3;
    nextMultiple -= nextMultiple%4;
    
    let paddingValue = nextMultiple - (widthNumber * 3);
    let dimensions = [widthNumber,heightNumber]
    let pixelData = [];
    
    
    for (let i = 0; i < heightNumber; i++) {
        pixelData.push([]);
        for (let j = 0; j < widthNumber; j++) {
            
            pixelData[i].push([data[pos+2], data[pos+1], data[pos]]);
            pos += 3;
            if (j == widthNumber - 1) {
                
                pos += paddingValue;
            }
            
            
        }

    }

    pixelData.push(dimensions);
    return pixelData;

}

function createGrayScale(data) {
    
    //console.log(data);
    let width = "0x";
    for (let i = 21; i > 17; i--) {
        width += data[i].toString(16);
    }
    let height = "0x";
    for (let i = 25; i > 21; i--) {
        height += data[i].toString(16);
    }

    let widthNumber = Number(width);
    //let heightNumber = Number(height);

    let nextMultiple = (widthNumber + 1) * 3;
    nextMultiple -= nextMultiple%4;
    
    let paddingValue = nextMultiple - (widthNumber * 3);
    let newFile = fs.openSync("#/temp.bmp", 'w');
    
    let headerData = data.subarray(0,54);
    let numberWritten = fs.writeFileSync(newFile, headerData, {flag: 'w'});
    
    let pixelData = readBMP(data);

    
    //console.log(pixelData);
    let loopCount = 0;
    for (let i = 0; i < pixelData.length; i++) {
        for (let j = 0; j < pixelData[i].length; j++) {
            loopCount++;
            let sum = pixelData[i][j][0] + pixelData[i][j][1] + pixelData[i][j][2];
            let average = Math.ceil(sum/3);
            let hexString = "";
            if (average == 0) {
                hexString = "000000";
            } else if(average < 16) {
                hexString = "0" + average.toString(16) + "0" +  average.toString(16) + "0" +  average.toString(16);
            } else {
                hexString = average.toString(16) + average.toString(16) + average.toString(16);
            }
            
            if (hexString.length < 6) {
                console.log(hexString);
            }
            fs.writeFileSync(newFile, hexString, {encoding: 'hex', flag: 'a'});
        }
        for (let k = 0; k < paddingValue; k++) {
            fs.writeFileSync(newFile,"00",{encoding:'hex',flag: 'a'});
        }
    }
    
    
}



function renderInTerminal(fileName) {
    let pixelData = readBMP(fileName);
    for (let i = pixelData.length-1; i >= 0; i--) {
        let currentRow = "";
        for (let j = 0; j < pixelData[i].length; j++) {
            let minNum = 10000000;
            let minIndex = 0;
            for (let k = 0; k < red.length; k++) {
                let distance = Math.abs(pixelData[i][j][0] - red[k]) + Math.abs(pixelData[i][j][1] - green[k]) + Math.abs(pixelData[i][j][2] - blue[k]);
                if (distance < minNum) {
                    minNum = distance;
                    minIndex = k;
                }
            }
            //console.log(i+ ", " + j + ": " + minIndex);
            currentRow +=  color[minIndex];
        } 
        console.log(currentRow);
    }
}





//renderInTerminal("GrayScaleface.bmp");
//renderInTerminal("face.bmp");
/*
let realData = readBMP("face.bmp");

let grayData = readBMP("GrayScaleface.bmp");

for (let i = 0; i < realData.length; i++) {
    for (let j = 0; j < realData[i].length; j++) {
        
        console.log("r: (" + i + ", " + j + ")" + realData[i][j]);
        console.log("g: (" + i + ", " + j + ")" + grayData[i][j]);
        console.log();
        
    }
}

*/