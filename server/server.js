const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const PORT = process.env.PORT || 4876;

require("dotenv").config();

app.use(express.static("client"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

let users = {};

function addUserList() {
  let ret = [];
  for (i in users) ret.push(users[i]);
  return ret;
}

function randomUserId() {
  return Math.floor(Math.random() * 100);
}

io.on("connection", function (socket) {
  users[socket.id] = {
    userId: randomUserId(),
  };

  console.log(users[socket.id] + " connected with id " + socket.id);
  socket.emit("sendUserId", users[socket.id].userId);
  io.emit("sendUsersList", addUserList()); //io.emit() broadcasts to all sockets that are connected!
});

server.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
