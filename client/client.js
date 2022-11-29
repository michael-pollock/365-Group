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
      message: "Hello Vue!",
      rows: 9,
      cols: 6,
      board: [],
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
