const fs = require('fs')

function oldParseGame(content) {
  // BUG: chessLetters & chessNumbers are inverted
  const chessLetters = Array.from('abcdefgh').reverse()
  const chessNumbers = Array.from('12345678')
  const lines = content
    .split('\n')
    .map((it) => it.trim())
    .filter((it) => it.length > 0)
    .reverse()
  if (lines.length === 0) return []
  const result = []
  while (lines.length > 0) {
    const line = lines.pop()
    if (line.startsWith('*')) {
      result.push({ kind: 'line', line })
      continue
    }
    if (line.startsWith('-')) {
      result.push({ kind: 'line', line })
      continue
    }
    if (line.startsWith('put:')) {
      const [_, pieceName, pieceColor, position] = line.split(/\s+/)
      result.push({
        kind: 'put',
        pieceName,
        pieceColor,
        y: chessLetters.indexOf(position[0]),
        x: chessNumbers.indexOf(position[1]),
      })
    } else {
      const play = line.split(':')
      if (play.length !== 2) continue
      result.push({
        kind: 'move',
        y1: chessLetters.indexOf(play[0][0]),
        x1: chessNumbers.indexOf(play[0][1]),
        y2: chessLetters.indexOf(play[1][0]),
        x2: chessNumbers.indexOf(play[1][1]),
      })
    }
  }
  return result
}

function dumpNewFormat(game, writer) {
  const letters = Array.from('abcdefgh') // x-axis
  const numbers = Array.from('12345678').reverse() // y-axis

  game.forEach((move) => {
    switch (move.kind) {
      case 'move': {
        writer.write(`${letters[move.x1]}${numbers[move.y1]}:${letters[move.x2]}${numbers[move.y2]}\n`)
        break
      }
      case 'put': {
        writer.write(`put: ${move.pieceName} ${move.pieceColor} ${letters[move.x]}${numbers[move.y]}\n`)
        break
      }
      case 'line': {
        writer.write(`${move.line}\n`)
        break
      }
      default: {
        throw new Error('unknown kind')
      }
    }
  })
}

const args = process.argv.slice(2)

const gamePath = args[0]
if (!gamePath) throw new Error('no game path')

const outputPath = args[1]

const game = oldParseGame(fs.readFileSync(gamePath).toString('utf-8'))

let writer = {
  write: (text) => process.stdout.write(text),
  complete: () => {},
}

if (outputPath) {
  const stream = fs.createWriteStream(outputPath, {
    autoClose: true,
    encoding: 'utf-8',
    flush: true,
  })
  writer = {
    write: (text) => stream.write(text),
    complete: () => stream.end(),
  }
}

dumpNewFormat(game, writer)
writer.complete()
