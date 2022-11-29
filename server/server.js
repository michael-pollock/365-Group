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


let numOfClients = 0;
let users = {};
let player1Ships = [];
let player1Board = [];
let player2Ships = [];
let player2Board = [];

io.on("connection", function (socket) {
  socket.on("disconnect", function () {
    console.log(users[socket.id].userId + " disconnected.");
    delete users[socket.id];
    io.emit("sendUsersList", updateUserList());
  });

  users[socket.id] = {
    userId: randomUserId(),
  };

  console.log(users[socket.id] + " connected with id " + socket.id);
  socket.emit("sendUserId", users[socket.id].userId);
  io.emit("sendUsersList", updateUserList()); //io.emit() broadcasts to all sockets that are connected!
});

server.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});


function updateUserList() {
  let ret = [];
  for (i in users) ret.push(users[i]);
  return ret;
}

function randomUserId() {
  return Math.floor(Math.random() * 100);
}

