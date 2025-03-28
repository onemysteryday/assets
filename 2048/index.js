"use strict";
const gameLoader = {
    game: null,
    previousScore: 0,
    bestScoreValue: 0,
    touchStartX: 0,
    touchStartY: 0,
    lastPress: 0,
    bestScoreKey: "2048-best-score",
    containerId: "game-container",
};
const keyEventListener = (evt) => {
    const now = new Date().getTime();
    if ((now - gameLoader.lastPress) < 150) {
        return;
    }
    gameLoader.lastPress = now;
    const game = gameLoader.game;
    if (!game) {
        console.error("No 2048 game instance");
        return;
    }
    let moved = false;
    switch (evt.key) {
        case "ArrowUp":
            moved = game.processMove("UP");
            break;
        case "ArrowDown":
            moved = game.processMove("DOWN");
            break;
        case "ArrowLeft":
            moved = game.processMove("LEFT");
            break;
        case "ArrowRight":
            moved = game.processMove("RIGHT");
            break;
    }
    if (!moved) {
        return;
    }
    refreshBoard();
};
const touchStartListener = (evt) => {
    gameLoader.touchStartX = evt.touches[0].clientX;
    gameLoader.touchStartY = evt.touches[0].clientY;
};
const touchEndListener = (evt) => {
    const touchEndX = evt.changedTouches[0].clientX;
    const touchEndY = evt.changedTouches[0].clientY;
    const diffX = gameLoader.touchStartX - touchEndX;
    const diffY = gameLoader.touchStartY - touchEndY;
    const game = gameLoader.game;
    if (!game) {
        console.error("No 2048 game instance");
        return;
    }
    let moved = false;
    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 50) {
            moved = game.processMove("LEFT");
        }
        else if (diffX < -50) {
            moved = game.processMove("RIGHT");
        }
    }
    else {
        if (diffY > 50) {
            moved = game.processMove("UP");
        }
        else if (diffY < -50) {
            moved = game.processMove("DOWN");
        }
    }
    if (!moved) {
        return;
    }
    refreshBoard();
};
const resizeListener = () => {
    const padding = 8;
    const gap = 8;
    const game = gameLoader.game;
    if (!game) {
        return;
    }
    const cells = game.board.cells;
    const grid = document.getElementById(`cell-${0}-${0}`);
    if (!grid) {
        return;
    }
    const rect = grid.getBoundingClientRect();
    for (const cell of cells) {
        const cellNode = document.getElementById(cell.id);
        if (!cellNode) {
            continue;
        }
        const x = padding + cell.j * gap + cell.j * rect.width;
        const y = padding + cell.i * gap + cell.i * rect.height;
        cellNode.style.left = `${x}px`;
        cellNode.style.top = `${y}px`;
        cellNode.style.width = `${rect.width}px`;
        cellNode.style.height = `${rect.height}px`;
    }
};
const restartListener = () => {
    const game = gameLoader.game;
    if (!game) {
        console.error("No 2048 game instance");
        return;
    }
    const container = document.getElementById("game-board");
    if (!container) {
        return;
    }
    const nodes = container.getElementsByClassName("cell-value");
    Array.from(nodes).forEach((node) => node.remove());
    game.startBoard();
    refreshBoard();
};
const refreshBoard = () => {
    const game = gameLoader.game;
    if (!game) {
        console.error("No 2048 game instance");
        return;
    }
    const padding = 8;
    const gap = 8;
    const cells = game.board.cells;
    //const removeCells: Cell[] = [];
    const newCells = [];
    const container = document.getElementById("game-board");
    if (!container) {
        return;
    }
    const grid = document.getElementById(`cell-${0}-${0}`);
    if (!grid) {
        return;
    }
    const rect = grid.getBoundingClientRect();
    Array.from(container.getElementsByClassName("cell-value")).forEach((node) => {
        if (!game.board.map.has(node.id)) {
            node.remove();
        }
    });
    for (const cell of cells) {
        // if (!game.board.map.has(cell.id)) {
        //   const mergedNode = document.getElementById(cell.id);
        //   mergedNode?.remove();
        //   removeCells.push(cell);
        //   continue;
        // }
        const cellNode = document.getElementById(cell.id);
        if (!cellNode) {
            newCells.push(cell);
            continue;
        }
        cellNode.textContent = `${cell.value}`;
        cellNode.className = `cell-value value-${cell.value < 4096 ? cell.value : 4096}`;
        const pX = parseInt(cellNode.style.left.replace("px", ""));
        const pY = parseInt(cellNode.style.left.replace("pY", ""));
        if (isNaN(pX) || isNaN(pY)) {
            continue;
        }
        const x = padding + cell.j * gap + cell.j * rect.width;
        const y = padding + cell.i * gap + cell.i * rect.height;
        //cellNode.style.transform = `translate(${x}px, ${y}px)`;
        cellNode.style.transition = "left 0.15s ease-out, top 0.15s ease-out";
        cellNode.style.left = `${x}px`;
        cellNode.style.top = `${y}px`;
        if (cell.mergeTo) {
            cell.mergeTo = undefined;
        }
    }
    // for (const cell of removeCells) {
    //   game.board.removeCellById(cell.id);
    // }
    setTimeout(() => {
        for (const cell of newCells) {
            const cellNode = document.createElement("div");
            cellNode.id = cell.id;
            cellNode.style.width = `${rect.width}px`;
            cellNode.style.height = `${rect.height}px`;
            cellNode.textContent = `${cell.value}`;
            cellNode.className = `cell-value value-${cell.value < 4096 ? cell.value : 4096}`;
            const x = padding + cell.j * gap + cell.j * rect.width;
            const y = padding + cell.i * gap + cell.i * rect.height;
            //cellValue.style.transform = `translate(${x}px, ${y}px)`;
            cellNode.style.left = `${x}px`;
            cellNode.style.top = `${y}px`;
            container === null || container === void 0 ? void 0 : container.appendChild(cellNode);
        }
    }, 100);
    const scoreValue = document.getElementById(`score-value`);
    if (scoreValue && game.score > gameLoader.previousScore) {
        scoreValue.classList.remove("bounce");
        void scoreValue.offsetWidth;
        scoreValue.classList.add("bounce");
    }
    const bestScoreValue = document.getElementById(`best-score-value`);
    if (bestScoreValue && game.score > gameLoader.bestScoreValue) {
        bestScoreValue.textContent = `${game.score}`;
        gameLoader.bestScoreValue = game.score;
        localStorage.setItem(gameLoader.bestScoreKey, `${game.score}`);
    }
    if (scoreValue) {
        scoreValue.textContent = `${game.score}`;
    }
    gameLoader.previousScore = game.score;
};
const initialize = () => {
    var _a;
    const elementId = gameLoader.containerId;
    const root = document.getElementById(elementId);
    if (!root) {
        console.error(`Element with id ${elementId} not found.`);
        return;
    }
    const savedBestScore = parseInt((_a = localStorage.getItem(gameLoader.bestScoreKey)) !== null && _a !== void 0 ? _a : "");
    gameLoader.bestScoreValue = isNaN(savedBestScore) ? 0 : savedBestScore;
    const game = new Game2048();
    gameLoader.game = game;
    const container = document.createElement("div");
    container.id = "game-2048";
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
    bestScoreValue.textContent = `${gameLoader.bestScoreValue}`;
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
    board.id = "game-board";
    board.classList.add("board");
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            const element = document.createElement("div");
            element.id = `cell-${i}-${j}`;
            element.classList.add("cell");
            board.appendChild(element);
        }
    }
    window.addEventListener("keyup", keyEventListener);
    window.addEventListener("resize", resizeListener);
    board.addEventListener("touchstart", touchStartListener);
    board.addEventListener("touchend", touchEndListener);
    const footer = document.createElement("div");
    footer.classList.add("footer");
    const restartButton = document.createElement("button");
    restartButton.classList.add("restart-btn");
    restartButton.textContent = "Restart";
    restartButton.type = "button";
    restartButton.addEventListener("click", restartListener);
    const helper = document.createElement("span");
    helper.classList.add("helper");
    helper.textContent = "Use arrow keys on PC or swipe on mobile.";
    footer.appendChild(helper);
    footer.appendChild(restartButton);
    container.appendChild(header);
    container.appendChild(board);
    container.appendChild(footer);
    root.appendChild(container);
    refreshBoard();
};
const destroy = () => {
    window.removeEventListener("keyup", keyEventListener);
    window.removeEventListener("resize", resizeListener);
};
initialize();
window.destroy = destroy;
