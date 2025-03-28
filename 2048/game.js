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
