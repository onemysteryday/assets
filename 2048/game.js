class Cell {
  constructor(i, j) {
    this.i = i;
    this.j = j;
  }
}

const Direction = {
  UP: "UP",
  DOWN: "DOWN",
  RIGHT: "RIGHT",
  LEFT: "LEFT",
};

class SquareBoard {
  constructor(width) {
    this._width = width;
    this._data = new Map();
    this._cells = Array.from({ length: width }, (_, i) => {
      return Array.from({ length: width }, (_, j) => {
        const cell = new Cell(i, j);
        this._data.set(cell, 0);
        return cell;
      });
    });
  }

  addNewValue() {
    const allCells = this._cells.flat();
    if (allCells.every((cell) => this._data.get(cell) > 0)) {
      return;
    }

    allCells.sort(() => Math.random() - 0.5);
    const cell = allCells.find((cell) => this._data.get(cell) === 0);

    if (cell) {
      this._data.set(cell, Math.random() < 0.9 ? 2 : 4);
    }
  }

  getCell(i, j) {
    return this._cells[i][j];
  }

  getValue(cell) {
    return this._data.get(cell);
  }

  setValue(cell, value) {
    this._data.set(cell, value);
  }

  getRow(i, direction) {
    const row = [...this._cells[i]];
    return direction === Direction.RIGHT ? row.reverse() : row;
  }

  getColumn(j, direction) {
    const col = this._cells.map((row) => row[j]);
    return direction === Direction.DOWN ? col.reverse() : col;
  }

  any(test) {
    return Array.from(this._data.values()).some(test);
  }

  calculateScore() {
    const values = Array.from(this._data.values()).filter((v) => v > 2);
    return values.length ? values.reduce((sum, value) => sum + value, 0) : 0;
  }
}

const _moveAndMergeEqual = (add) => {
  return function (array) {
    const list = [];
    const nonZeroList = array.filter((e) => e > 0);

    let i = 0;
    while (i < nonZeroList.length) {
      const current = nonZeroList[i];
      if (i !== nonZeroList.length - 1 && current === nonZeroList[i + 1]) {
        list.push(add(current));
        i += 2;
      } else {
        list.push(nonZeroList[i]);
        i++;
      }
    }

    return list;
  };
};

class Game2048 {
  constructor() {
    this._board = new SquareBoard(4);
    this._score = 0;
    this.startBoard();
  }

  canMove() {
    return this._board.any((value) => value === 0);
  }

  getCellValue(i, j) {
    return this._board.getValue(this._board.getCell(i, j));
  }

  processMove(direction) {
    if (this._move(direction)) {
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

  _move(direction) {
    let moved = false;

    for (let i = 0; i < 4; i++) {
      switch (direction) {
        case Direction.UP:
        case Direction.DOWN:
          moved =
            this._moveValuesInRowOrColumn(
              this._board.getColumn(i, direction)
            ) || moved;
          break;
        case Direction.LEFT:
        case Direction.RIGHT:
          moved =
            this._moveValuesInRowOrColumn(this._board.getRow(i, direction)) ||
            moved;
          break;
      }
    }

    return moved;
  }

  _moveValuesInRowOrColumn(rowOrColumn) {
    const values = rowOrColumn.map((cell) => this._board.getValue(cell));
    const isMoveable = values.some((value, index) => {
      return (
        (value !== 0 &&
          index < values.length - 1 &&
          value === values[index + 1]) ||
        (value === 0 && values.slice(index + 1).some((v) => v !== 0))
      );
    });

    if (!isMoveable) {
      return false;
    }

    const movedList = _moveAndMergeEqual((value) => {
      const total = value + value;
      this._score += total;
      return total;
    })(values);

    const moved = movedList.length && rowOrColumn.length !== movedList.length;

    for (let i = 0; i < rowOrColumn.length; i++) {
      this._board.setValue(
        rowOrColumn[i],
        i < movedList.length ? movedList[i] : 0
      );
    }

    return moved;
  }

  get score() {
    return this._score;
  }
}
