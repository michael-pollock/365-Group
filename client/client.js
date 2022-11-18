// Todo:
// create xIndex and yIndex arrays. Create functions to
// initialize them on startup
// look into grid thing
// figure out when to grab xIndex and yIndex value to display in grid
// fill rest with array
// On second thought keep indicies in array
// that way we can map array to grid easier
// Chat functions

var socket = io();

const { createApp } = Vue;

createApp({
  data() {
    return {
      message: "Hello Vue!",
      rows: 9,
      cols: 6,
      board: []
      userId: null,
      usersList: null,
    };
  },
  methods: {
    fillBoard() {
      let xIndex = 1;
      let yIndex = 'A';
      for (i = 0; i <= this.rows; i++) {
        for (j = 0; j <= this.cols; j++) {
          if (i == 0 && j > 0) {
            console.log("xIndex: Put " + xIndex)
            this.board[i][j] = xIndex;
            xIndex++;
          }
          if (i > 0 && j == 0) {
            console.log("yIndex: Put " + yIndex)
            this.board[i][j] = yIndex;
            yIndex = this.getNextChar(yIndex);
          }

        }
      }
    },
    initBoard() {
      let board = [];
      for (i = 0; i <= this.rows; i++) {
        board.push([]);
        for (j = 0; j <= this.cols; j++) {
          board[i].push("~");
        }
      }
      this.board = board;
      this.fillBoard();
    },
    getNextChar(char) {
      return String.fromCharCode(char.charCodeAt(0) + 1);
    },
  },
  mounted() {
    this.initBoard();
    socket.on("sendUserId", dataFromServer => {
      console.log(dataFromServer);
      this.userId = dataFromServer;
    });
    socket.on("sendUsersList", dataFromServer => {
      console.log(dataFromServer);
      this.usersList = dataFromServer;
    });
  },
}).mount("#app");
