"use strict";
class Cell {
    constructor(i, j) {
        this.i = i;
        this.j = j;
        this.value = 0;
        this.id = crypto.randomUUID();
    }
}
class SquareBoard {
    constructor(size) {
        this.size = size;
        this.cells = [];
        this.chart = Array.from({ length: size }, (_, i) => {
            return Array.from({ length: size }, (_, j) => {
                return new Cell(i, j);
            });
        });
        this.map = new Map();
    }
    addNewValue() {
        const emptyCells = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.chart[i][j].value === 0) {
                    emptyCells.push({ i, j });
                }
            }
        }
        if (emptyCells.length === 0) {
            return;
        }
        const { i, j } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const newCell = new Cell(i, j);
        newCell.value = Math.random() < 0.9 ? 2 : 4;
        this.chart[i][j].value = newCell.value;
        this.cells.push(newCell);
        this.map.set(newCell.id, newCell);
        //console.log("new: ", newCell);
    }
    getCell(i, j) {
        return this.cells.find((cell) => cell.i === i && cell.j === j);
    }
    removeCell(i, j) {
        const index = this.cells.findIndex((cell) => cell.i === i && cell.j === j);
        if (index >= 0) {
            this.cells.splice(index, 1);
        }
    }
    removeCellById(id) {
        const index = this.cells.findIndex((cell) => cell.id === id);
        if (index >= 0) {
            this.cells.splice(index, 1);
        }
    }
    getRow(i) {
        const row = Array.from({ length: this.size }, (_, j) => {
            const cell = this.getCell(i, j);
            return cell !== null && cell !== void 0 ? cell : new Cell(i, j);
        });
        return row;
    }
    getColumn(j) {
        const col = Array.from({ length: this.size }, (_, i) => {
            const cell = this.getCell(i, j);
            return cell !== null && cell !== void 0 ? cell : new Cell(i, j);
        });
        return col;
    }
}
class Game2048 {
    constructor() {
        this._board = new SquareBoard(4);
        this._score = 0;
        this.startBoard();
    }
    processMove(direction) {
        if (this.move(direction)) {
            this._board.addNewValue();
            return true;
        }
        return false;
    }
    startBoard() {
        this._board = new SquareBoard(4);
        this._board.addNewValue();
        this._board.addNewValue();
        this._score = 0;
    }
    move(direction) {
        let moved = false;
        for (let i = 0; i < 4; i++) {
            switch (direction) {
                case "UP":
                case "DOWN":
                    moved =
                        this.moveValueInColumn(this._board.getColumn(i), direction === "DOWN") || moved;
                    break;
                case "LEFT":
                case "RIGHT":
                    moved =
                        this.moveValueInRow(this._board.getRow(i), direction === "RIGHT") ||
                            moved;
                    break;
            }
        }
        return moved;
    }
    shouldMove(rowOrColumn) {
        const values = rowOrColumn.map((cell) => cell.value);
        const result = values.some((value, index) => {
            return ((value !== 0 &&
                index < values.length - 1 &&
                value === values[index + 1]) ||
                (value === 0 && values.slice(index + 1).some((v) => v > 0)));
        });
        //console.log(values, result);
        return result;
    }
    moveValueInRow(cells, reverse) {
        if (!this.shouldMove(reverse ? cells.reverse() : cells)) {
            return false;
        }
        //console.log(cells);
        let moveableCells = cells.filter((cell) => cell.value > 0);
        //console.log(moveableCells, reverse);
        const len = moveableCells.length;
        // move and merge
        for (let i = 0, v = 0; i < len; i++, v++) {
            const cell = moveableCells[i];
            const mj = !reverse ? v : this._board.size - 1 - v;
            if (!reverse && mj < cell.j) {
                this.board.chart[cell.i][cell.j].value = 0;
                cell.j = mj;
                this.board.chart[cell.i][cell.j].value = cell.value;
            }
            if (reverse && mj > cell.j) {
                this.board.chart[cell.i][cell.j].value = 0;
                cell.j = mj;
                this.board.chart[cell.i][cell.j].value = cell.value;
            }
            if (i === 0) {
                continue;
            }
            const prevCell = moveableCells[i - 1];
            if (i > 0 && cell.value === prevCell.value && !prevCell.mergeTo) {
                cell.value += prevCell.value;
                this.board.chart[cell.i][cell.j].value = 0;
                cell.mergeTo = new Cell(prevCell.i, prevCell.j);
                cell.j = prevCell.j;
                //prevCell.merged = true;
                this._score += cell.value;
                this.board.chart[cell.i][cell.j].value = cell.value;
                this.board.map.delete(prevCell.id);
                this.board.removeCellById(prevCell.id);
                v = reverse ? v - 1 : cell.j;
            }
        }
        //console.log(JSON.parse(JSON.stringify(moveableCells)), reverse);
        return true;
    }
    moveValueInColumn(cells, reverse) {
        if (!this.shouldMove(reverse ? cells.reverse() : cells)) {
            return false;
        }
        //console.log(cells);
        let moveableCells = cells.filter((cell) => cell.value > 0);
        //console.log(moveableCells);
        const len = moveableCells.length;
        // move and merge
        for (let i = 0, v = 0; i < len; i++, v++) {
            const cell = moveableCells[i];
            const mi = !reverse ? v : this._board.size - 1 - v;
            if (!reverse && mi < cell.i) {
                this.board.chart[cell.i][cell.j].value = 0;
                cell.i = mi;
                this.board.chart[cell.i][cell.j].value = cell.value;
            }
            if (reverse && mi > cell.i) {
                this.board.chart[cell.i][cell.j].value = 0;
                cell.i = mi;
                this.board.chart[cell.i][cell.j].value = cell.value;
            }
            if (i === 0) {
                continue;
            }
            const prevCell = moveableCells[i - 1];
            if (i > 0 && cell.value === prevCell.value && !prevCell.mergeTo) {
                cell.value += prevCell.value;
                this.board.chart[cell.i][cell.j].value = 0;
                cell.mergeTo = new Cell(prevCell.i, prevCell.j);
                cell.i = prevCell.i;
                //prevCell.merged = true;
                this._score += cell.value;
                this.board.chart[cell.i][cell.j].value = cell.value;
                this.board.map.delete(prevCell.id);
                this.board.removeCellById(prevCell.id);
                v = reverse ? v - 1 : cell.i;
            }
        }
        //console.log(JSON.parse(JSON.stringify(moveableCells)), reverse);
        return true;
    }
    get score() {
        return this._score;
    }
    get board() {
        return this._board;
    }
}

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
