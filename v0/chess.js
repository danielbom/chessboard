class PawnStrategy {
  constructor() {
    /** @type {string} */
    this.type = 'P'
  }

  /**
   * @param {(string | null)[][]} board
   * @param {number} fromX
   * @param {number} fromY
   * @param {number} toX
   * @param {number} toY
   * @returns {boolean | null}
   */
  canMove(board, fromX, fromY, toX, toY) {
    const piece = board[fromX][fromY]
    if (!piece || piece[1] !== this.type) {
      return null
    }

    const isAttack = !!board[toX][toY] 
    const isWhite = piece[0] === 'w'
    const isForward = isWhite ? fromX - toX === 1 : toX - fromX === 1
    if (isAttack) {
      const isLeftOrRight = Math.abs(fromY - toY) === 1
      if (!isLeftOrRight) {
        return false
      }
      if (!isForward) {
        return false
      }

      const attackOtherPieces = board[toX][toY][0] !== piece[0]
      return attackOtherPieces
    } else {
      if (fromY !== toY) {
        return false
      }
      if (isForward) {
        return true
      }

      if (isWhite) {
        const isFirstDoubleMove = fromX === 6 && toX === 4
        return isFirstDoubleMove
      } else {
        const isFirstDoubleMove = fromX === 1 && toX === 3
        return isFirstDoubleMove
      }
    }
  }
}

class RookStrategy {
  constructor() {
    /** @type {string} */
    this.type = 'R'
  }

  canMove(board, fromX, fromY, toX, toY) {
    const piece = board[fromX][fromY]
    if (!piece || piece[1] !== this.type) {
      return null
    }

    if (fromX !== toX && fromY !== toY) {
      return false
    }

    if (fromX === toX) {
      const step = fromY < toY ? 1 : -1
      for (let i = fromY + step; i !== toY; i += step) {
        if (board[fromX][i]) {
          return false
        }
      }
    } else {
      const step = fromX < toX ? 1 : -1
      for (let i = fromX + step; i !== toX; i += step) {
        if (board[i][fromY]) {
          return false
        }
      }
    }
    
    const isAttack = !!board[toX][toY]
    if (isAttack) {
      const isOppositeColor = board[toX][toY][0] !== piece[0]
      return isOppositeColor
    }

    return true
  }
}

class BishopStrategy {
  constructor() {
    /** @type {string} */
    this.type = 'R'
  }

  canMove(board, fromX, fromY, toX, toY) {
    const piece = board[fromX][fromY]
    if (!piece || piece[1] !== this.type) {
      return null
    }

    if (Math.abs(fromX - toX) !== Math.abs(fromY - toY)) {
      return false
    }

    const stepX = fromX < toX ? 1 : -1
    const stepY = fromY < toY ? 1 : -1
    for (let i = fromX + stepX, j = fromY + stepY; i !== toX; i += stepX, j += stepY) {
      if (board[i][j]) {
        return false
      }
    }
    
    const isAttack = !!board[toX][toY]
    if (isAttack) {
      const isOppositeColor = board[toX][toY][0] !== piece[0]
      return isOppositeColor
    }

    return true
  }
}

class KnightStrategy {
  constructor() {
    /** @type {string} */
    this.type = 'N'
  }

  canMove(board, fromX, fromY, toX, toY) {
    const piece = board[fromX][fromY]
    if (!piece || piece[1] !== this.type) {
      return null
    }

    const dx = Math.abs(fromX - toX)
    const dy = Math.abs(fromY - toY)
    if (dx + dy !== 3 || dx === 0 || dy === 0) {
      return false
    }

    const isAttack = !!board[toX][toY]
    if (isAttack) {
      const isOppositeColor = board[toX][toY][0] !== piece[0]
      return isOppositeColor
    }
    
    return true
  }
}

class QueenStrategy {
  constructor() {
    /** @type {string} */
    this.type = 'Q'

    this.rook = new RookStrategy()
    this.bishop = new BishopStrategy()
  }

  canMove(board, fromX, fromY, toX, toY) {
    return this.bishop.canMove(board, fromX, fromY, toX, toY) || this.rook.canMove(board, fromX, fromY, toX, toY)
  }
}

class KingStrategy {
  constructor() {
    /** @type {string} */
    this.type = 'K'
  }

  canMove(board, fromX, fromY, toX, toY) {
    const piece = board[fromX][fromY]
    if (!piece || piece[1] !== this.type) {
      return null
    }

    const dx = Math.abs(fromX - toX)
    const dy = Math.abs(fromY - toY)
    if (dx > 1 || dy > 1) {
      return false
    }

    const isAttack = !!board[toX][toY]
    if (isAttack) {
      const isOppositeColor = board[toX][toY][0] !== piece[0]
      return isOppositeColor
    }

    return true
  }
}

class CheckStrategy {
  /**
   * 
   * @param {Record<string, KingStrategy>} strategies 
   */
  constructor(strategies) {
    /** @type {Record<string, KingStrategy>} */
    this.strategies = strategies
  }

  isCheck(board, color) {
    const attackBoard = this.findAttackBoard(board, color)
    const kingPosition = this.findKing(board, color)
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = board[i][j]
        if (!piece || piece[0] === color[0]) {
          continue
        }
        if (this.strategies['K'].canMove(attackBoard, i, j, kingPosition[0], kingPosition[1])) {
          return true
        }
      }
    }
    return false
  }

  findAttackBoard(board, color) {
    const attackBoard = board.map(row => [...row])
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = board[i][j]
        if (!piece || piece[0] === color[0]) {
          continue
        }
        for (const strategy of Object.values(this.strategies)) {
          if (strategy.canMove(board, i, j, i, j)) {
            attackBoard[i][j] = piece
          }
        }
      }
    }
    return attackBoard
  }

  findKing(board, color) {
    const K = `${color}K`
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = board[i][j]
        if (piece === K) {
          return [i, j]
        }
      }
    }
  }
}

export default class Chess {
  constructor() {
    /** @type {(string | null)[][]} */
    this.board = []

    /** @type {'white' | 'black'} */
    this.turn = 'white'

    this.init()

    this.strategies = {
      P: new PawnStrategy(),
      R: new RookStrategy(),
      B: new BishopStrategy(),
      N: new KnightStrategy(),
      Q: new QueenStrategy(),
      K: new KingStrategy(),
    }
    this.check = new CheckStrategy(this.strategies)
  }

  init() {
    this.board = new Array(8).fill(null).map(() => new Array(8).fill(null))
    this.board[0] = ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR']
    this.board[1] = new Array(8).fill('bP')
    this.board[6] = new Array(8).fill('wP')
    this.board[7] = ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR']
  }

  move(from, to) {
    const piece = this.board[from[0]][from[1]]
    if (!piece) {
      return false
    }
    if (piece[0] !== this.turn[0]) {
      return false
    }
    if (!this.strategies[piece[1]].canMove(this.board, from[0], from[1], to[0], to[1])) {
      return false
    }
    this.board[to[0]][to[1]] = piece
    this.board[from[0]][from[1]] = null
    const nextTurn = this.turn === 'white' ? 'black' : 'white'

    if (this.check.isCheck(this.board, nextTurn[0])) {
      this.board[from[0]][from[1]] = piece
      this.board[to[0]][to[1]] = null
      return false
    }

    this.turn = nextTurn
    return true
  }

  print() {
    console.log(this.board)
  }

  getBoard() {
    return this.board
  }

  getTurn() {
    return this.turn
  }

  getPiece(x, y) {
    return this.board[x][y]
  }
}
