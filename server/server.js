const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const PORT = 4876;

app.use(express.static("client"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

let users = {};

// connected is an array of client socket.ids
// use fifo queue
// when client connects push to end of the array
// when client disconnects grab/splice from the array

const players = {};
let readiedPlayers = 0;

io.on("connection", socket => {

  socket.on("playerReady", (shipBoard, ships) => {
    players['id'] = socket.id;
    readiedPlayers++;
    players['playerNum'] = readiedPlayers;
    players['shipBoard'] = shipBoard;
    players['ships'] = ships;
    console.log("Readied players: " + readiedPlayers);
    if (readiedPlayers == 2) {
      io.emit("begin", true);
    }
    io.sockets.socket(socket.id).emit("playerNum", readiedPlayers);
  });

  socket.on("username-received", username => {
    players['name'] = username;
    console.log(`Player ${username} has connected`);
    socket.emit("playerUserName", username);
    console.log("Printing players name: \n" + players['name']);
  });

  socket.on("usermessage-received", message => {
    let id = socket.id;
    let user = players[id];
    console.log(`Message received from client ${user} ${message}`);
    io.emit("chat-message", {
      message: message,
      name: players[socket.id],
    });
  });

  socket.on("disconnect", function () {
    let id = socket.id;
    let user = players[id];
    console.log(`Player ${user} has disconnected`);
    delete user;
  });
});

server.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});

