const express = require('express');			//REST API for communication between frontend and backend
const cors = require('cors');				//ensures we are sending right headers

const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");


const app = express();
const port = 8000;
app.use(cors());
app.use(express.json());

//Initialize serial port used
const myPort = new SerialPort({
	path: "COM4", 
	baudRate: 9600
});
const parser = myPort.pipe(new ReadlineParser({ delimiter: '\r\n' }));

//object that stores the data sent from board
var dataPackage = {
	volt: [Math.floor(Math.random() * 5), 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3],
	temp: [Math.floor(Math.random() * 5), 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1],
	curr: [Math.floor(Math.random() * 5), 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2],
	static: [(3.00).toFixed(2), (0.00).toFixed(2), (1.00).toFixed(2), (2.00).toFixed(2),
		(2.00).toFixed(2), (1.00).toFixed(2), (2.00).toFixed(2), (1.00).toFixed(2), (3.00).toFixed(2),
		(0.00).toFixed(2), (1.00).toFixed(2), (1.00).toFixed(2), (2.00).toFixed(2), (3.00).toFixed(2)]
};

//Send signal (h) to board to begin sending data
function getData() {
	myPort.write("h");
	
	return dataPackage;	
}

//frontend requests data to /graphdata to which backend responds and sends data object
app.get('/graphdata', (req, res) => {

    res.json(getData());
});

//backend goes to listening mode and "listens" for data sent from board
app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});

myPort.on('open', onOpen);
parser.on('data', onData);

var arrayIndex = 0;
var mode = "";

function onOpen() {
	console.log("Open Connection");
}

function onData(receivedData) {
  console.log("Got: " + receivedData);
  text = text + receivedData;
  strindex++;

  // Check if the received data contains the start and end markers
  if (text.startsWith("$") && text.includes("\n")) {
      // Extract the data between '$' and '@'
      const extractedData = text.substring(1, text.indexOf("\n"));

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

      // Emit 'start' event if needed
      if (strindex == 8) {
          insert.emit('start');
      }
  }
}