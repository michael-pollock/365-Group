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

const playerConnections = [null, null];

io.on("connection", function (socket) {
  let playerIndex = -1;
  for (const i in playerConnections) {
    if (playerConnections[i] === null) {
      playerIndex = i;
      break;
    }
  }

  socket.emit("player-num", playerIndex);
  console.log(`Player ${playerIndex} connected`);

  if (playerIndex === -1) {
    return;
  }

  playerConnections[playerIndex] = false;

  socket.broadcast.emit("player-connected", playerIndex);

  socket.on("disconnect", function () {
    console.log(`Player ${playerIndex} disconnected`);
    playerConnections[playerIndex] = null;

    socket.broadcast.emit("player-connected", playerIndex);
  });
});

server.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
