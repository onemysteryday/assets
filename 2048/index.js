const GameLoader = {
  game: null,
  previousScore: 0,
  bestScoreValue: 0,
  touchStartX: 0,
  touchStartY: 0,
  bestScoreKey: "2048-best-score",

  keyEventListener: (evt) => {
    const game = GameLoader.game;
    if (!game) {
      console.error("No 2048 game instance");
      return;
    }

    let moved = false;
    switch (evt.key) {
      case "ArrowUp":
        moved = game.processMove(Direction.UP);
        break;
      case "ArrowDown":
        moved = game.processMove(Direction.DOWN);
        break;
      case "ArrowLeft":
        moved = game.processMove(Direction.LEFT);
        break;
      case "ArrowRight":
        moved = game.processMove(Direction.RIGHT);
        break;
    }

    if (!moved) {
      return;
    }

    GameLoader.refreshBoard(game);
  },

  touchStartListener: (evt) => {
    GameLoader.touchStartX = evt.touches[0].clientX;
    GameLoader.touchStartY = evt.touches[0].clientY;
  },

  touchEndListener: (evt) => {
    const touchEndX = evt.changedTouches[0].clientX;
    const touchEndY = evt.changedTouches[0].clientY;

    const diffX = GameLoader.touchStartX - touchEndX;
    const diffY = GameLoader.touchStartY - touchEndY;

    const game = GameLoader.game;
    if (!game) {
      console.error("No 2048 game instance");
      return;
    }
    let moved = false;
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 50) {
        moved = game.processMove(Direction.LEFT);
      } else if (diffX < -50) {
        moved = game.processMove(Direction.RIGHT);
      }
    } else {
      if (diffY > 50) {
        moved = game.processMove(Direction.UP);
      } else if (diffY < -50) {
        moved = game.processMove(Direction.DOWN);
      }
    }

    if (!moved) {
      return;
    }

    GameLoader.refreshBoard(game);
  },

  restartListener: (evt) => {
    const game = GameLoader.game;
    if (!game) {
      console.error("No 2048 game instance");
      return;
    }
    game.startBoard();
    GameLoader.refreshBoard(game);
  },

  refreshBoard: (game) => {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const cellValue = game.getCellValue(i, j);
        const cell = document.getElementById(`cell-${i}-${j}`);
        cell.textContent = `${cellValue}`;
        cell.className = `cell value-${cellValue < 4096 ? cellValue : 4096}`;
      }
    }

    const scoreValue = document.getElementById(`score-value`);
    scoreValue.classList.remove("bounce");
    if (game.score > GameLoader.previousScore) {
      void scoreValue.offsetWidth;
      scoreValue.classList.add("bounce");
    }

    if (game.score > GameLoader.bestScoreValue) {
        const bestScoreValue = document.getElementById(`best-score-value`);
        bestScoreValue.textContent = `${game.score}`;
        GameLoader.bestScoreValue = game.score;
        localStorage.setItem(GameLoader.bestScoreKey, `${game.score}`);
    }

    scoreValue.textContent = `${game.score}`;
    GameLoader.previousScore = game.score;
  },

  initialize: (elementId) => {
    const root = document.getElementById(elementId);
    if (!root) {
      console.error(`Element with id ${elementId} not found.`);
      return;
    }

    const savedBestScore = parseInt(localStorage.getItem(GameLoader.bestScoreKey));
    GameLoader.bestScoreValue = isNaN(savedBestScore) ? 0 : savedBestScore;

    const game = GameLoader.game;

    const container = document.createElement("div");
    container.classList.add("game-2048");

    const header = document.createElement("div");
    header.classList.add("header");

    const title = document.createElement("span");
    title.classList.add("title");
    title.textContent = "2048";

    const bestScore = document.createElement("div");
    bestScore.classList.add("score", "best");
    bestScore.style.marginRight = "8px";

    const bestScoreLabel = document.createElement("span");
    bestScoreLabel.classList.add("label");
    bestScoreLabel.textContent = "BEST";

    const bestScoreValue = document.createElement("span");
    bestScoreValue.id = "best-score-value";
    bestScoreValue.classList.add("value");
    bestScoreValue.textContent = `${GameLoader.bestScoreValue}`;

    bestScore.appendChild(bestScoreLabel);
    bestScore.appendChild(bestScoreValue);

    const score = document.createElement("div");
    score.classList.add("score");

    const scoreLabel = document.createElement("span");
    scoreLabel.classList.add("label");
    scoreLabel.textContent = "SCORE";

    const scoreValue = document.createElement("span");
    scoreValue.id = "score-value";
    scoreValue.classList.add("value");
    scoreValue.textContent = "0";

    score.appendChild(scoreLabel);
    score.appendChild(scoreValue);

    header.appendChild(title);
    header.appendChild(bestScore);
    header.appendChild(score);

    const board = document.createElement("div");
    board.classList.add("board");

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const cellValue = game.getCellValue(i, j);
        const cell = document.createElement("div");
        cell.id = `cell-${i}-${j}`;
        cell.classList.add("cell", `value-${cellValue}`);
        cell.textContent = `${cellValue}`;

        board.appendChild(cell);
      }
    }

    window.addEventListener("keyup", GameLoader.keyEventListener);

    board.addEventListener("touchstart", GameLoader.touchStartListener);
    board.addEventListener("touchend", GameLoader.touchEndListener);

    const footer = document.createElement("div");
    footer.classList.add("footer");

    const restartButton = document.createElement("button");
    restartButton.classList.add("restart-btn");
    restartButton.textContent = "Restart";
    restartButton.type = "button";
    restartButton.addEventListener("click", GameLoader.restartListener);

    footer.appendChild(restartButton);

    const helper = document.createElement("span");
    helper.classList.add("helper");
    helper.textContent = "Use arrow keys on PC or swipe on mobile.";

    container.appendChild(header);
    container.appendChild(board);
    container.appendChild(footer);
    container.appendChild(helper);

    root.appendChild(container);
  },

  destroy: () => {
    window.removeEventListener("keyup", GameLoader.keyEventListener);
  },
};

GameLoader.game = new Game2048();
GameLoader.initialize("game-container");

window.destroy = GameLoader.destroy;
