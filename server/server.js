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

const players = [];
let username = "";

io.on("connection", socket => {
  let connectionCount = socket.conn.server.clientsCount;
  socket.on("username-received", dataFromClient => {
    username = dataFromClient;
    let player = {
      id: socket.id,
      userName: username,
    };
    players.push(player);
    console.log(players);
    socket.emit("playerUserName", player.userName);
    socket.emit("playerid", player.id);
  });

  socket.on("disconnect", function () {
    let id = socket.id;
    console.log(`Player ${id} has disconnected`);
    delete players[id];
  });
});

server.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
