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

const players = {};
let readiedPlayers = 0;

const playerConnections = [null, null];

io.on("connection", socket => {
  socket.on("playerReady", (shipBoard, ships) => {
    socket.broadcast.emit("sendEnemyData", shipBoard, ships);
    let playerIndex = -1;
    for (const i in playerConnections) {
      if (playerConnections[i] == null) {
        playerIndex = i;
        break;
      }
    }

    socket.emit("playerNum", playerIndex);

    if (playerIndex == -1) {
      return;
    }
    playerConnections[playerIndex] = false;
    readiedPlayers++;
    console.log("Readied players: " + readiedPlayers);
    if (playerIndex == -1) {
      socket.emit("begin", false);
    } else {
      if (playerIndex == 1) {
        io.emit("begin", true, false);
      }
    }

    players["id"] = socket.id;
    players["playerNum"] = playerIndex;
    players["shipBoard"] = shipBoard;
    players["ships"] = ships;

    socket.emit();
  });

  socket.on("disconnect", () => {
    /*Username object info below
      let id = socket.id;
      let user = players[id];
      //console.log(`Player ${user} has disconnected`);
      //delete user;
    */

    let playerIndex = players["playerNum"];
    console.log(`Player ${playerIndex} disconnected`);
    //Tell everyone what player number just disconnected
    playerConnections[playerIndex] = null;
    io.emit("player-disconnect", playerIndex);
  });

  socket.on("username-received", username => {
    players[socket.id] = username;
    console.log(`Player ${username} has connected`);
    socket.emit("playerUserName", username);
  });

  socket.on("fireTorpedo", (row, col) => {
    socket.broadcast.emit("receiveFire", row, col);
  });

  socket.on("shipHit", (row, col) => {
    socket.broadcast.emit("shipHit", row, col);
  });

  socket.on("shipMiss", (row, col) => {
    socket.broadcast.emit("shipMiss", row, col);
  });

  socket.on("allShipsSunk", () => {
    io.emit("gameOver");
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
});

server.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
