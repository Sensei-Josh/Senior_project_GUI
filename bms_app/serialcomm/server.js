const express = require('express');
const cors = require('cors');
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const EventEmitter = require('events');

const insert = new EventEmitter();
const app = express();
const port = 8000;
app.use(cors());
app.use(express.json());

const myPort = new SerialPort({
    path: "COM4",
    baudRate: 9600
});
const parser = myPort.pipe(new ReadlineParser({ delimiter: '\r\n' }));

var data = {
    volt: [Math.floor(Math.random() * 5), 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3],
    temp: [Math.floor(Math.random() * 5), 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1],
    curr: [Math.floor(Math.random() * 5), 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2],
    static: [(3.00).toFixed(2), (0.00).toFixed(2), (1.00).toFixed(2), (2.00).toFixed(2),
        (2.00).toFixed(2), (1.00).toFixed(2), (2.00).toFixed(2), (1.00).toFixed(2), (3.00).toFixed(2),
        (0.00).toFixed(2), (1.00).toFixed(2), (1.00).toFixed(2), (2.00).toFixed(2), (3.00).toFixed(2)]
};

var strindex = 0;
var valdex = 0;
var text = "";

insert.on('start', () => {
    var x = parseInt(text, 2);
    console.log(x);
    strindex = 0;
    data.static[valdex] = x.toFixed(2);
    valdex++;
    text = "";
    if (valdex == 14)
        valdex = 0;
});

function getData() {
    myPort.write("h");
    return data;
}

app.get('/graphdata', (req, res) => {
    res.json(getData());
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}.`);
});

myPort.on('open', onOpen);
parser.on('data', onData);

function onOpen() {
    console.log("Open Connection");

    // Simulate receiving the specified data directly in the code
    const simulatedData = "$c1=34615,c2=34615,c3=34615,c4=34615,c5=34615,c6=34615,c7=34615,c8=34615,c9=34615,c10=34615,c11=34615,c12=34615,@\n";
    onData(simulatedData);
}

function onData(receivedData) {
    console.log("Got: " + receivedData);
    text = text + receivedData;
    strindex++;

    // Check if the received data contains the start and end markers
    if (text.startsWith("$") && text.includes("\n")) {
        // Extract the data between '$' and '@'
        const extractedData = text.substring(text.indexOf("$"), text.indexOf("\n") + 1);

        // Split the data into individual components
        const components = extractedData.split(',');

        // Process each component and update the data object
        components.forEach(component => {
            const [key, value] = component.split('=');

            // Update data based on the key
            if (key.startsWith('c')) {
                const index = parseInt(key.slice(1)) - 1; // Convert 'c1', 'c2', etc. to array index
                data.volt[index] = parseFloat(value) * 0.0001; // Update voltage data
            }
        });

        // Reset the text and strindex for the next data packet
        text = "";
        strindex++;

        // Emit 'start' event 
        if (strindex == 12) {
            insert.emit('start');
        }
    }
}
