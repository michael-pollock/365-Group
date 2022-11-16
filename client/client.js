const { createApp } = Vue;

createApp({
  data() {
    return {
      message: "Hello Vue!",
      size: 6,
      board: [[], []],
      boardHeader: "A B C D E F G",
    };
  },
  methods: {
    fillBoard() {
      let xIndex = 0;
      let yIndex = 0;
      let i = 0;
      let j = 0;
      for (i; i <= this.size; i++) {
        for (j; j <= this.size; j++) {
          if (i == 0 && j > 0) {
            this.board[i][j] = xIndex;
          }
          if (i !== 0 && j == 0) {
            this.board[i][j] = yIndex;
          }
          xIndex++;
        }
        yIndex++;
      }
    },
  },
  mounted() {
    this.fillBoard();
  },
}).mount("#app");
