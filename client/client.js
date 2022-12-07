const { createApp } = Vue;
const socket = io();

createApp({
  data() {
    return {
      username: null,
      userNameErrorMsg: null,
      userMsgError: null,
      taunt: "Place your pieces.",
      rows: 10,
      cols: 10,
      isButtonDisabled: false,
      shipBoard: [],
      fireBoard: [],
      enemyBoard: [],
      messageList: [],
      carrier: {
        type: "Carrier",
        name: "Big-Hoss",
        id: "ca",
        size: 5,
        placed: false,
        sunk: false,
        hitCount: 0,
      },
      battleship: {
        type: "Battleship",
        name: "BS-Baby",
        id: "bs",
        size: 4,
        placed: false,
        sunk: false,
        hitCount: 0,
      },
      cruiser: {
        type: "Cruiser",
        name: "Bruise-Cruise",
        id: "cr",
        size: 3,
        placed: false,
        sunk: false,
        hitCount: 0,
      },
      submarine: {
        type: "Submarine",
        name: "Silent-Whale",
        id: "sb",
        size: 3,
        placed: false,
        sunk: false,
        hitCount: 0,
      },
      destroyer: {
        type: "Destroyer",
        name: "Openheimer",
        id: "dr",
        size: 2,
        placed: false,
        sunk: false,
        hitCount: 0,
      }, //openheimer said i am become death destroyer of worlds
      message: "",
      usermessage: "",
      playerId: 0,
      gameMode: "",
      currentPlayer: "user",
      shipArray: [],
      enemyShips: [],
      selectedShip: "",
      shipIndex: 0,
      shipOrientation: "vertical",
      allShipsPlaced: false,
      playerReady: false,
      enemyReady: false,
      yourTurn: true, // update from server
      gameBegin: false, // update from server when both
      gameOver: false,
      playerList: [],
      isPlayerConnected: false,
      playerNum: 0,
      serverFullMessage: null,
      waiting: false,
    };
  },
  methods: {
    fillBoard() {
      let xIndex = 1;
      let yIndex = "A";
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
      board1[0][0] = " ";
      board2[0][0] = " ";
      this.shipBoard = board1;
      this.fireBoard = board2;
      this.fillBoard();
    },
    getNextChar(char) {
      return String.fromCharCode(char.charCodeAt(0) + 1);
    },
    initShipArray() {
      this.shipArray = [
        this.carrier,
        this.battleship,
        this.cruiser,
        this.submarine,
        this.destroyer,
      ];
      this.selectedShip = this.shipArray[this.shipIndex];
    },
    nextShip() {
      this.shipIndex = (this.shipIndex + 1) % this.shipArray.length; // prevents numbers above ship size
      this.selectedShip = this.shipArray[this.shipIndex];
    },
    prevShip() {
      this.shipIndex =
        (this.shipIndex - 1 + this.shipArray.length) % this.shipArray.length; // prevents negative numbers
      this.selectedShip = this.shipArray[this.shipIndex];
    },
    rotateShip() {
      if (this.shipOrientation == "vertical") {
        this.shipOrientation = "horizontal";
      } else {
        this.shipOrientation = "vertical";
      }
    },
    checkPlacement(rowIndex, colIndex) {
      if (this.shipOrientation == "vertical") {
        this.checkVerticalSpacing(rowIndex, colIndex);
        return;
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
      this.taunt =
        "You have placed all of your ships. If they are where you want them, select 'Ready'";
    },
    setReady() {
      this.playerReady = true;
      this.waiting = true;
      socket.emit("playerReady", this.shipBoard, this.shipArray);
    },
    fireAtEnemy(rowIndex, colIndex) {
      socket.emit("fireTorpedo", rowIndex, colIndex);
      this.checkGameOver();
    },
    fireTorpedo(rowIndex, colIndex) {
      console.log("Torpedo fired at row " + rowIndex + ", col " + colIndex);
      if (this.shipBoard[rowIndex][colIndex] !== "~") {
        shipID = this.shipBoard[rowIndex][colIndex];
        shipIndex = this.getShip(shipID);
        ship = this.shipArray[shipIndex];
        if (shipIndex == "-1") {
          console.log("Couldn't find that one.");
          return;
        }
        ship.hitCount++;
        if (ship.hitCount == ship.size) {
          ship.sunk = true;
          console.log("Sunk: " + ship.name);
          console.log("You had " + this.shipArray.length + " ships.");
          this.shipArray.splice(shipIndex, 1);
          console.log("But now you have " + this.shipArray.length);
        }
        console.log("HIT!");
        this.shipBoard[rowIndex][colIndex] = "!X!";
        socket.emit("shipHit", rowIndex, colIndex);
      } else {
        console.log("They missed!");
        this.shipBoard[rowIndex][colIndex] = ":)";
        socket.emit("shipMiss", rowIndex, colIndex);
      }
      for (aShip of this.shipArray) {
        console.log(
          "ID: " +
            aShip.id +
            ", Size: " +
            aShip.size +
            ", Hits: " +
            aShip.hitCount +
            ", Sunk: " +
            aShip.sunk
        );
      }
    },
    getShip(id) {
      console.log("Looking for " + id);
      isSameID = ship => ship.id == id;
      shipIndex = this.shipArray.findIndex(isSameID);
      console.log(
        "Index for " + this.shipArray[shipIndex].name + " was " + shipIndex
      );
      return shipIndex;
    },
    checkGameOver() {
      if (this.shipArray.length == 0) {
        this.taunt = "YOU Lose!";
        socket.emit("allShipsSunk");
        if (this.gameOver) {
          this.isPlayerConnected = false;
        }
      }
    },
    startMultiPlayer() {
      this.gameMode = "multiPlayer";
      this.isPlayerConnected = true;
      socket.emit("username-received", this.username);
      this.username = "";
      socket.on("playerUserName", dataFromServer => {
        let username = dataFromServer;
        this.playerList.push(username);
      });
    },
    sendMessage() {
      socket.emit("usermessage-received", this.usermessage);
      this.usermessage = "";
    },
  },
  computed: {
    errorUserNameInput() {
      if (
        (!this.username || !this.username.match("^[A-Za-z][A-Za-z0-9]*$")) &&
        !this.isPlayerConnected
      ) {
        let message = (this.userNameErrorMsg =
          "Please fill in a name then click Start Multiplayer Button when ready!");
        return message;
      }
    },
    errorMsgInput() {
      if (!this.isPlayerConnected || !this.usermessage) {
        let message = (this.userMsgError =
          "Message Can't be empty then fill in then click Send Message Button when ready!");
        return message;
      }
    },
    serverIsFull() {
      if (this.playerNum == -1 && this.isPlayerConnected) {
        let message = "Server is full please wait...";
        this.serverFullMessage = message;
        return this.serverFullMessage;
      }
    },
  },
  mounted() {
    this.initShipArray();
    this.initBoard();
    socket.on("playerNum", playerNum => {
      this.playerNum = parseInt(playerNum);
      console.log(`You are Player ${playerNum}`);
      if (this.playerNum == 0) {
        this.currentPlayer = "user";
        this.taunt =
          "You are player num " + playerNum + "\r\n" + "COMMENCE FIRING";
      }
      if (this.playerNum == 1) {
        this.currentPlayer = "enemy";
        this.taunt =
          "You are player num " + playerNum + "\r\n" + "COMMENCE FIRING";
      }
      if (this.playerNum == -1) {
        this.currentPlayer = "waiting-user";
        this.taunt = "You Can't Fire You're in a queue of players waiting";
      }
    });
    socket.on("player-disconnect", dataFromServer => {
      this.playerNum = parseInt(dataFromServer);
      console.log(
        `Player # ${this.playerNum} has disconnected from the server`
      );
    });
    socket.on("begin", (begin, waiting) => {
      console.log("Beginning game");
      this.gameBegin = begin;
      this.waiting = waiting;
    });
    socket.on("sendEnemyData", (enemyBoard, enemyShips) => {
      this.enemyBoard = enemyBoard;
      this.enemyShips = enemyShips;
      console.log("Received enemy stuff");
    });
    socket.on("receiveFire", (row, col) => {
      console.log("Receiving fire at row: " + row + ", col " + col);
      this.fireTorpedo(row, col);
      this.checkGameOver();
    });
    socket.on("gameOver", () => {
      console.log("gameOver");
      this.gameOver = true;
      this.yourTurn = false;
    });
    socket.on("chat-message", data => {
      console.log(data);
      this.messageList.push(data);
    });
    socket.on("shipHit", (row, col) => {
      this.fireBoard[row][col] = "!X!";
    });
    socket.on("shipMiss", (row, col) => {
      this.fireBoard[row][col] = ":(";
    });
  },
}).mount("#app");
