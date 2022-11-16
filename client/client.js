// Todo: 
// create xIndex and yIndex arrays. Create functions to 
// initialize them on startup
// look into grid thing
// figure out when to grab xIndex and yIndex value to display in grid
// fill rest with array
// On second thought keep indicies in array
// that way we can map array to grid easier

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
