var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

server.listen(8080);

app.get('/', function (req, res) {
  res.sendFile(__dirname  + '/index.html');
});

// io.on('connection', function (socket) {
//   socket.emit('news', { hello: 'world' });
//   socket.on('my other event', function (data){
//     socket.send(data);
//   });
// });

var prompt = require('prompt');
var SerialPort = require("serialport");
var port = new SerialPort("/dev/ttyACM0", {
  baudRate: 9600,
  parser: SerialPort.parsers.readline("\n")
});


// port.on('open', function() {

//   port.on('data', function(data) {
//       console.log((data));
//       });

// });
var connections = new Array;            // list of connections to the server


//STUFF FOR ARDUINIO TO TALK TO SERVER
port.on('open', showPortIsOpen);
port.on('data', sendSerialData);
port.on('close', showPortIsClosed);
port.on('error', showError);

//Functions for Serial (above)
function showPortIsOpen() {
  console.log('The port is open. Data rate: ' + port.options.baudRate);
}

function sendSerialData(data) {
console.log(data);
  // if (connections.length > 0) {
    broadcast(data);

}

function showPortIsClosed() {
  console.log('The port is closed.');
}

function showError(error) {
  console.log('Serial Port Error: ' + error);
}

function sendToSerial(data) {
  console.log("sending to serial: " + data);
  port.write(data);
}

// ------------------------ webSocket Server event functions
io.on('connection', handleConnection);

function handleConnection(socket) {
  console.log("New Connection");
  socket.emit('open', {hello: 'world'});
  // you have a new client
  connections.push(socket);             // add this client to the connections array

  socket.on('clientMessage', sendToSerial);      // when a client sends a message,
  socket.on('close', function() {           // when a client closes its connection
    console.log("connection closed");       // print it out
    var position = connections.indexOf(socket); // get the client's position in the array
    connections.splice(position, 1);        // and delete it from the array
  });
}
// This function broadcasts messages to all webSocket clients
function broadcast(data) {
  for (c in connections) {     // iterate over the array of connections
    connections[c].send(data); // send the data to each connection
  }
}
