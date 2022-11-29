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
      taunt: "Place your pieces.",
      rows: 9,
      cols: 6,
      board: [],
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
    };
  },
  methods: {
    fillBoard() {
      let xIndex = 1;
      let yIndex = 'A';
      for (i = 0; i <= this.rows; i++) {
        for (j = 0; j <= this.cols; j++) {
          if (i == 0 && j > 0) {
            this.board[i][j] = xIndex;
            xIndex++;
          }
          if (i > 0 && j == 0) {
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
      board[0][0] = ' ';
      this.board = board;
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
      while (currRow <= this.rows && this.board[currRow][colIndex] == "~") {
        openSpots++;
        if (openSpots == this.selectedShip.size) {
          this.placeShip(rowIndex, colIndex);
          return;
        }
        currRow++;
      }
      currRow = rowIndex - 1;
      while (currRow > 0 && this.board[currRow][colIndex] == "~") {
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
      while (currCol <= this.cols && this.board[rowIndex][currCol] == "~") {
        openSpots++;
        if (openSpots == this.selectedShip.size) {
          this.placeShip(rowIndex, colIndex);
          return;
        }
        currCol++;
      }
      currCol = colIndex - 1;
      while (currCol > 0 && this.board[rowIndex][currCol] == "~") {
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
          this.board[rowIndex + i][colIndex] = this.selectedShip.id;
        }
      } else {
        for (i = 0; i < this.selectedShip.size; i++) {
          this.board[rowIndex][colIndex + i] = this.selectedShip.id;
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
          if (this.board[i][j] == this.selectedShip.id) {
            this.board[i][j] = "~";
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
      console.log("Tell the server I am ready.");
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
}).mount("#app");
