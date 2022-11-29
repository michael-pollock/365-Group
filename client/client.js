const socket = io('http://127.0.0.1:4876/')
const messageContainer = document.getElementById('message-container')
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')

const name = prompt('What is your name?')
appendMessage('You joined')
socket.emit('new-user', name)

socket.on('chat-message', data => {
  appendMessage(`${data.name}: ${data.message}`)
})

socket.on('user-connected', name => {
  appendMessage(`${name} connected`)
})

socket.on('user-disconnected', name => {
  appendMessage(`${name} disconnected`)
})

messageForm.addEventListener('submit', e => {
  e.preventDefault()
  const message = messageInput.value
  appendMessage(`You: ${message}`)
  socket.emit('send-chat-message', message)
  messageInput.value = ''
})

function appendMessage(message) {
  const messageElement = document.createElement('div')
  messageElement.innerText = message
  messageContainer.append(messageElement)
}

const { createApp } = Vue;

createApp({
  data() {
    return {
      taunt: "Place your pieces.",
      rows: 9,
      cols: 6,
      shipBoard: [],
      fireBoard: [],
      userId: null,
      usersList: null,
      carrier: { type: "Carrier", name: "Big-Hoss", id: "ca", size: 5, placed: false, sunk: false, hitCount: 0 },
      battleship: { type: "Battleship", name: "BS-Baby", id: "bs", size: 4, placed: false, sunk: false, hitCount: 0 },
      cruiser: { type: "Cruiser", name: "Bruise-Cruise", id: "cr", size: 3, placed: false, sunk: false, hitCount: 0 },
      submarine: { type: "Submarine", name: "Silent-Whale", id: "sb", size: 3, placed: false, sunk: false, hitCount: 0 },
      destroyer: { type: "Destroyer", name: "Openheimer", id: "dr", size: 2, placed: false, sunk: false, hitCount: 0 }, //openheimer said i am become death destroyer of worlds
      shipArray: [],
      selectedShip: "",
      shipIndex: 0,
      shipOrientation: "vertical",
      allShipsPlaced: false,
      playerReady: false,
      myTurn: false, // update from server
      gameBegin: false, // update from server when both
    };
  },
  methods: {
    fillBoard() {
      let xIndex = 1;
      let yIndex = 'A';
      for (i = 0; i <= this.rows; i++) {
        for (j = 0; j <= this.cols; j++) {
          if (i == 0 && j > 0) {
            this.shipBoard[i][j] = xIndex;
            this.fireBoard[i][j] = xIndex;
            xIndex++;
          }
          if (i > 0 && j == 0) {
            this.shipBoard[i][j] = yIndex;
            this.fireBoard[i][j] = yIndex;
            yIndex = this.getNextChar(yIndex);
          }

        }
      }
    },
    initBoard() {
      let board1 = [];
      let board2 = [];
      for (i = 0; i <= this.rows; i++) {
        board1.push([]);
        board2.push([]);
        for (j = 0; j <= this.cols; j++) {
          board1[i].push("~");
          board2[i].push("~");
        }
      }
      board1[0][0] = ' ';
      board2[0][0] = ' ';
      this.shipBoard = board1;
      this.fireBoard = board2;
      this.fillBoard();
    },
    getNextChar(char) {
      return String.fromCharCode(char.charCodeAt(0) + 1);
    },
    initShipArray() {
      this.shipArray = [this.carrier, this.battleship, this.cruiser, this.submarine, this.destroyer];
      this.selectedShip = this.shipArray[this.shipIndex];
    },
    nextShip() {
      this.shipIndex = (this.shipIndex + 1) % this.shipArray.length; // prevents numbers above ship size
      this.selectedShip = this.shipArray[this.shipIndex];
    },
    prevShip() {
      this.shipIndex = (this.shipIndex - 1 + this.shipArray.length) % this.shipArray.length; // prevents negative numbers
      this.selectedShip = this.shipArray[this.shipIndex];
    },
    rotateShip() {
      if (this.shipOrientation == "vertical") {
        this.shipOrientation = "horizontal";
      } else {
        this.shipOrientation = "vertical"
      }
    },
    placeShip(rowIndex, colIndex) {
      this.legalPlacement(rowIndex, colIndex);
    },
    legalPlacement(rowIndex, colIndex) {
      if (this.shipOrientation == "vertical") {
        this.checkVerticalSpacing(rowIndex, colIndex);
      }
      this.checkHorizontalSpacing(rowIndex, colIndex);
    },
    checkVerticalSpacing(rowIndex, colIndex) {
      openSpots = 0;
      currRow = rowIndex;
      while (currRow <= this.rows && this.shipBoard[currRow][colIndex] == "~") {
        openSpots++;
        if (openSpots == this.selectedShip.size) {
          this.placeShip(rowIndex, colIndex);
          return;
        }
        currRow++;
      }
      currRow = rowIndex - 1;
      while (currRow > 0 && this.shipBoard[currRow][colIndex] == "~") {
        openSpots++;
        if (openSpots == this.selectedShip.size) {
          this.placeShip(currRow, colIndex);
          return;
        }
        currRow--;
      }
      this.taunt = "Your ship cannot fit at that location.";
    },
    checkHorizontalSpacing(rowIndex, colIndex) {
      openSpots = 0;
      currCol = colIndex;
      while (currCol <= this.cols && this.shipBoard[rowIndex][currCol] == "~") {
        openSpots++;
        if (openSpots == this.selectedShip.size) {
          this.placeShip(rowIndex, colIndex);
          return;
        }
        currCol++;
      }
      currCol = colIndex - 1;
      while (currCol > 0 && this.shipBoard[rowIndex][currCol] == "~") {
        openSpots++;
        if (openSpots == this.selectedShip.size) {
          this.placeShip(rowIndex, currCol);
          return;
        }
        currCol--;
      }
      this.taunt = "Your ship cannot fit at that location.";
    },
    placeShip(rowIndex, colIndex) {
      if (this.selectedShip.placed == true) {
        this.removeShip(); // remove ship from current location and put in new location. 
      }
      if (this.shipOrientation == "vertical") {
        for (i = 0; i < this.selectedShip.size; i++) {
          this.shipBoard[rowIndex + i][colIndex] = this.selectedShip.id;
        }
      } else {
        for (i = 0; i < this.selectedShip.size; i++) {
          this.shipBoard[rowIndex][colIndex + i] = this.selectedShip.id;
        }
      }
      this.selectedShip.placed = true;
      this.nextShip(); // increments and updates shipIndex and selectedShip
      this.checkAllPlaced();
      if (!this.allShipsPlaced) {
        this.taunt = "Place your ships.";
      }
    },
    removeShip() {
      for (i = 1; i < this.rows; i++) {
        for (j = 1; j < this.cols; j++) {
          if (this.shipBoard[i][j] == this.selectedShip.id) {
            this.shipBoard[i][j] = "~";
          }
        }
      }
      this.selectedShip.placed = false;
      this.taunt = "Place your ships.";
      this.allShipsPlaced = false;
    },
    checkAllPlaced() {
      for (ship of this.shipArray) {
        console.log("Checking " + ship.name + ", placed: " + ship.placed);
        if (ship.placed == false) {
          this.allShipsPlaced = false;
          return;
        }
      }
      this.allShipsPlaced = true;
      this.taunt = "You have placed all of your pieces. If they are where you want them, select 'Ready'";
    },
    setReady() {
      console.log("Tell the server I am ready. Currently, manually setting game to begin.");
      this.playerReady = true;
      this.gameBegin = true; // this should be updated by server, just here for testing currently. 
      socket.emit("ready", this.shipBoard, this.shipArray)
    },
    fireTorpedo(rowIndex, colIndex) {
      console.log("Torpedo fired at row " + rowIndex + ", col " + colIndex);
    }
  },
  mounted() {
    this.initShipArray();
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
  computed: {
    findHitShip() {

    }
  }
}).mount("#app");
