import Chess from './chess.js'

function drawBoard(root) {
  /** @type {HTMLDivElement[][]} */
  const table = []
  const board = document.createElement('div')
  for (let i = 0; i < 8; i++) {
    const row = document.createElement('div')
    row.dataset.x = i
    row.classList.add('row')
    table.push([])
    for (let j = 0; j < 8; j++) {
      const col = document.createElement('div')
      col.classList.add('cell')
      col.classList.add(i % 2 === j % 2 ? 'white' : 'black')
      col.dataset.x = i
      col.dataset.y = j
      row.appendChild(col)
      table[i].push(col)
    }
    board.appendChild(row)
  }
  root.appendChild(board)
  return table
}

/**
 * 
 * @param {HTMLDivElement[][]} table 
 * @param {number} x 
 * @param {number} y 
 * @param {string} piece 
 * @param {string} color 
 */
function drawPiece(table, x, y, piece, color) {
  table[x][y].innerText = piece
  table[x][y].classList.add(`piece-${color}`)
}

function drawPieces(table, chess) {
  const pieces = {
    white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
    black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' },
  }
  const pieceTypes = {
    K: 'king',
    Q: 'queen',
    R: 'rook',
    B: 'bishop',
    N: 'knight',
    P: 'pawn',
  }
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = chess.getPiece(i, j)
      if (!piece) {
        continue
      }
      const color = piece[0] === 'w' ? 'white' : 'black'
      const type = pieceTypes[piece[1]]
      drawPiece(table, i, j, pieces[color][type], color)
    }
  }
}

const drawMove = (chess, from, to) => {
  const piece = table[from[0]][from[1]].innerText
  const color = chess.getPiece(to[0], to[1])[0] === 'w' ? 'white' : 'black'
  const oppositeColor = color === 'white' ? 'black' : 'white'
  drawPiece(table, to[0], to[1], piece, color)
  table[to[0]][to[1]].classList.remove(`piece-${oppositeColor}`)
  table[from[0]][from[1]].innerText = ''
}

const chess = new Chess()

const root = document.getElementById('root')
const table = drawBoard(root)
drawPieces(table, chess)

const selectedCells = []

document.addEventListener('click', (ev) => {
  if (ev.target && ev.target.classList.contains('cell')) {
    if (selectedCells.length === 2) {
      selectedCells.forEach(([x, y]) => table[x][y].classList.remove('highlight', 'error'))
      selectedCells.length = 0
    }

    const cell = ev.target
    if (cell.classList.contains('highlight')) {
      cell.classList.remove('highlight')
      selectedCells.pop()
    } else {
      selectedCells.push([Number(cell.dataset.x), Number(cell.dataset.y)])
      cell.classList.add('highlight')
    }

    if (selectedCells.length === 2) {
      const [from, to] = selectedCells
      if (chess.move(from, to)) {
        drawMove(chess, from, to)
      } else {
        selectedCells.forEach(([x, y]) => {
          table[x][y].classList.remove('highlight')
          table[x][y].classList.add('error')
        })
      }
    }
  }
})
