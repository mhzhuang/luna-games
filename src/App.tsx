import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

type Player = 1 | 2
type Cell = Player | null
type Mode = 'easy' | 'medium' | 'hard' | 'two-player'

const ROWS = 6
const COLS = 7
const FIRECRACKERS = Array.from({ length: 15 }, (_, index) => index)
const emptyBoard = (): Cell[][] =>
  Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(null))

const getOpenRow = (board: Cell[][], column: number) => {
  for (let row = ROWS - 1; row >= 0; row -= 1) {
    if (board[row][column] === null) return row
  }
  return -1
}

const findWinner = (board: Cell[][]) => {
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]]

  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const player = board[row][col]
      if (!player) continue

      for (const [dr, dc] of directions) {
        const cells = Array.from({ length: 4 }, (_, index) => [
          row + dr * index,
          col + dc * index,
        ] as const)
        if (cells.every(([r, c]) => board[r]?.[c] === player)) {
          return { player, cells }
        }
      }
    }
  }
  return null
}

const tryWinningColumn = (board: Cell[][], player: Player) => {
  for (let col = 0; col < COLS; col += 1) {
    const row = getOpenRow(board, col)
    if (row < 0) continue
    const copy = board.map((line) => [...line])
    copy[row][col] = player
    if (findWinner(copy)?.player === player) return col
  }
  return null
}

const availableColumns = (board: Cell[][]) =>
  [3, 2, 4, 1, 5, 0, 6].filter((col) => getOpenRow(board, col) >= 0)

const boardAfterMove = (board: Cell[][], column: number, player: Player) => {
  const copy = board.map((line) => [...line])
  const row = getOpenRow(copy, column)
  if (row >= 0) copy[row][column] = player
  return copy
}

const scoreWindow = (window: Cell[], player: Player) => {
  const opponent: Player = player === 1 ? 2 : 1
  const own = window.filter((cell) => cell === player).length
  const theirs = window.filter((cell) => cell === opponent).length
  const empty = window.filter((cell) => cell === null).length
  if (own === 4) return 100_000
  if (own === 3 && empty === 1) return 120
  if (own === 2 && empty === 2) return 14
  if (theirs === 3 && empty === 1) return -150
  if (theirs === 2 && empty === 2) return -12
  return 0
}

const scorePosition = (board: Cell[][], player: Player) => {
  let score = board.reduce((total, row) => total + (row[3] === player ? 8 : 0), 0)
  const windows: Cell[][] = []

  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col <= COLS - 4; col += 1) windows.push(board[row].slice(col, col + 4))
  }
  for (let col = 0; col < COLS; col += 1) {
    for (let row = 0; row <= ROWS - 4; row += 1) windows.push(Array.from({ length: 4 }, (_, i) => board[row + i][col]))
  }
  for (let row = 0; row <= ROWS - 4; row += 1) {
    for (let col = 0; col <= COLS - 4; col += 1) windows.push(Array.from({ length: 4 }, (_, i) => board[row + i][col + i]))
  }
  for (let row = 0; row <= ROWS - 4; row += 1) {
    for (let col = 3; col < COLS; col += 1) windows.push(Array.from({ length: 4 }, (_, i) => board[row + i][col - i]))
  }
  windows.forEach((window) => { score += scoreWindow(window, player) })
  return score
}

const chooseEasyMove = (board: Cell[][]) => {
  const winningMove = tryWinningColumn(board, 2)
  if (winningMove !== null) return winningMove

  const blockingMove = tryWinningColumn(board, 1)
  if (blockingMove !== null && Math.random() < 0.58) return blockingMove

  const available = Array.from({ length: COLS }, (_, col) => col).filter(
    (col) => getOpenRow(board, col) >= 0,
  )
  const friendlyChoices = available.flatMap((col) => {
    const centerBonus = 3 - Math.abs(3 - col)
    return Array(1 + centerBonus).fill(col) as number[]
  })
  return friendlyChoices[Math.floor(Math.random() * friendlyChoices.length)]
}

const chooseMediumMove = (board: Cell[][]) => {
  const winningMove = tryWinningColumn(board, 2)
  if (winningMove !== null) return winningMove
  const blockingMove = tryWinningColumn(board, 1)
  if (blockingMove !== null) return blockingMove

  const ranked = availableColumns(board).map((col) => {
    const next = boardAfterMove(board, col, 2)
    const givesAwayWin = tryWinningColumn(next, 1) !== null
    return { col, score: scorePosition(next, 2) - (givesAwayWin ? 10_000 : 0) + Math.random() * 8 }
  }).sort((a, b) => b.score - a.score)
  return ranked[0]?.col
}

const minimax = (
  board: Cell[][],
  depth: number,
  maximizing: boolean,
  alpha: number,
  beta: number,
): number => {
  const result = findWinner(board)
  if (result?.player === 2) return 1_000_000 + depth
  if (result?.player === 1) return -1_000_000 - depth
  const columns = availableColumns(board)
  if (depth === 0 || columns.length === 0) return scorePosition(board, 2)

  if (maximizing) {
    let best = -Infinity
    for (const col of columns) {
      best = Math.max(best, minimax(boardAfterMove(board, col, 2), depth - 1, false, alpha, beta))
      alpha = Math.max(alpha, best)
      if (alpha >= beta) break
    }
    return best
  }

  let best = Infinity
  for (const col of columns) {
    best = Math.min(best, minimax(boardAfterMove(board, col, 1), depth - 1, true, alpha, beta))
    beta = Math.min(beta, best)
    if (alpha >= beta) break
  }
  return best
}

const chooseHardMove = (board: Cell[][]) => {
  const winningMove = tryWinningColumn(board, 2)
  if (winningMove !== null) return winningMove
  const blockingMove = tryWinningColumn(board, 1)
  if (blockingMove !== null) return blockingMove

  let bestScore = -Infinity
  let bestColumns: number[] = []
  for (const col of availableColumns(board)) {
    const score = minimax(boardAfterMove(board, col, 2), 5, false, -Infinity, Infinity)
    if (score > bestScore) {
      bestScore = score
      bestColumns = [col]
    } else if (score === bestScore) {
      bestColumns.push(col)
    }
  }
  return bestColumns[Math.floor(Math.random() * bestColumns.length)]
}

const chooseComputerMove = (board: Cell[][], mode: Mode) => {
  if (mode === 'hard') return chooseHardMove(board)
  if (mode === 'medium') return chooseMediumMove(board)
  return chooseEasyMove(board)
}

function App() {
  const [mode, setMode] = useState<Mode>('easy')
  const [board, setBoard] = useState<Cell[][]>(emptyBoard)
  const [currentPlayer, setCurrentPlayer] = useState<Player>(1)
  const [lastMove, setLastMove] = useState<[number, number] | null>(null)
  const [soundOn, setSoundOn] = useState(true)
  const audioContextRef = useRef<AudioContext | null>(null)

  const winner = useMemo(() => findWinner(board), [board])
  const isDraw = !winner && board.every((row) => row.every(Boolean))
  const gameOver = Boolean(winner) || isDraw
  const isComputerMode = mode !== 'two-player'
  const isThinking = isComputerMode && currentPlayer === 2 && !gameOver
  const winningCells = new Set(
    winner?.cells.map(([row, col]) => `${row}-${col}`) ?? [],
  )

  const playerName = (player: Player) => {
    if (player === 1) return 'Luna'
    return isComputerMode ? '小月亮' : '玩家 2'
  }

  const playTone = (kind: 'drop' | 'win') => {
    if (!soundOn) return
    const AudioCtx = window.AudioContext ||
      (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return
    const context = audioContextRef.current ?? new AudioCtx()
    audioContextRef.current = context
    void context.resume()

    if (kind === 'drop') {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.frequency.value = 250
      oscillator.type = 'sine'
      gain.gain.setValueAtTime(0.08, context.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.15)
      oscillator.connect(gain)
      gain.connect(context.destination)
      oscillator.start()
      oscillator.stop(context.currentTime + 0.15)
      return
    }

    // A short, playful string of synthesized firecracker pops.
    Array.from({ length: 22 }, (_, index) => {
      const start = context.currentTime + index * 0.105 + (index % 4) * 0.016
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.type = index % 2 ? 'square' : 'sawtooth'
      oscillator.frequency.setValueAtTime(120 + (index % 5) * 34, start)
      oscillator.frequency.exponentialRampToValueAtTime(55, start + 0.055)
      gain.gain.setValueAtTime(0.001, start)
      gain.gain.linearRampToValueAtTime(index >= 20 ? 0.095 : 0.05 + (index % 3) * 0.008, start + 0.004)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.07)
      oscillator.connect(gain)
      gain.connect(context.destination)
      oscillator.start(start)
      oscillator.stop(start + 0.075)
    })
  }

  const dropPiece = (column: number, player: Player) => {
    if (gameOver || (isThinking && player !== 2)) return false
    const row = getOpenRow(board, column)
    if (row < 0) return false

    const nextBoard = board.map((line) => [...line])
    nextBoard[row][column] = player
    setBoard(nextBoard)
    setLastMove([row, column])
    playTone('drop')

    const result = findWinner(nextBoard)
    if (result?.player === 1) {
      window.setTimeout(() => playTone('win'), 180)
    } else if (!nextBoard.every((line) => line.every(Boolean))) {
      setCurrentPlayer(player === 1 ? 2 : 1)
    }
    return true
  }

  useEffect(() => {
    if (!isComputerMode || currentPlayer !== 2 || gameOver) return
    const timer = window.setTimeout(() => {
      const column = chooseComputerMove(board, mode)
      if (column !== undefined) dropPiece(column, 2)
    }, mode === 'hard' ? 850 : 700)
    return () => window.clearTimeout(timer)
    // dropPiece intentionally uses the current board snapshot for the delayed AI turn.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlayer, mode, gameOver, isComputerMode])

  const restart = (nextMode = mode) => {
    setMode(nextMode)
    setBoard(emptyBoard())
    setCurrentPlayer(1)
    setLastMove(null)
  }

  const statusText = winner
    ? winner.player === 1
      ? '太棒了，Luna 赢啦！'
      : isComputerMode
        ? '差一点！再试一次吧'
        : '玩家 2 赢啦！'
    : isDraw
      ? '不分胜负，再来一局！'
      : isThinking
        ? '小月亮正在想一想…'
        : `轮到 ${playerName(currentPlayer)} 放棋子`

  return (
    <main className="game-shell">
      <div className="stars" aria-hidden="true">✦ · ✧ · ✦</div>

      {winner?.player === 1 && (
        <div className="firecracker-show" aria-hidden="true">
          {(['left', 'right'] as const).map((side) => (
            <div className={`firecracker-string ${side}`} key={side}>
              <span className="fuse" />
              {FIRECRACKERS.map((index) => (
                <span
                  className="cracker"
                  key={index}
                  style={{ '--cracker-index': index } as React.CSSProperties}
                >
                  <i className="spark one" /><i className="spark two" /><i className="spark three" />
                </span>
              ))}
            </div>
          ))}
          <div className="celebration-burst">★</div>
        </div>
      )}

      <header className="topbar">
        <div className="brand" aria-label="Luna 四子棋">
          <span className="brand-moon">☾</span>
          <span><strong>LUNA</strong><small>四子棋</small></span>
        </div>
        <button
          className="sound-button"
          type="button"
          onClick={() => setSoundOn((value) => !value)}
          aria-label={soundOn ? '关闭声音' : '打开声音'}
        >
          {soundOn ? '♪' : '♩'} <span>{soundOn ? '声音开' : '声音关'}</span>
        </button>
      </header>

      <section className="game-card">
        <nav className="mode-switch" aria-label="游戏模式">
          <button
            className={mode === 'easy' ? 'active' : ''}
            onClick={() => restart('easy')}
            type="button"
          >
            <span>☁</span> 和电脑玩 <small>简单</small>
          </button>
          <button
            className={mode === 'medium' ? 'active' : ''}
            onClick={() => restart('medium')}
            type="button"
          >
            <span>☽</span> 和电脑玩 <small>中等</small>
          </button>
          <button
            className={mode === 'hard' ? 'active' : ''}
            onClick={() => restart('hard')}
            type="button"
          >
            <span>★</span> 和电脑玩 <small>困难</small>
          </button>
          <button
            className={mode === 'two-player' ? 'active' : ''}
            onClick={() => restart('two-player')}
            type="button"
          >
            <span>☻</span> 两个人玩
          </button>
        </nav>

        <div className={`status ${winner ? 'celebrating' : ''}`} aria-live="polite">
          <div className={`status-piece player-${winner?.player ?? currentPlayer}`}>
            {winner?.player === 2 || (!winner && currentPlayer === 2) ? '☾' : '★'}
          </div>
          <div>
            <p>{statusText}</p>
            {!gameOver && <small>点一下你想放棋子的那一列</small>}
          </div>
        </div>

        <div className="board-wrap">
          <div className="column-buttons" aria-label="选择一列">
            {Array.from({ length: COLS }, (_, col) => (
              <button
                key={col}
                type="button"
                onClick={() => dropPiece(col, currentPlayer)}
                disabled={gameOver || isThinking || getOpenRow(board, col) < 0}
                aria-label={`把棋子放在第 ${col + 1} 列`}
              >
                <span>▼</span>
              </button>
            ))}
          </div>

          <div className="board" role="grid" aria-label="四子棋棋盘">
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const key = `${rowIndex}-${colIndex}`
                const isLast = lastMove?.[0] === rowIndex && lastMove?.[1] === colIndex
                return (
                  <button
                    key={key}
                    className={`slot ${cell ? `filled player-${cell}` : ''} ${isLast ? 'last-move' : ''} ${winningCells.has(key) ? 'winner' : ''}`}
                    type="button"
                    onClick={() => dropPiece(colIndex, currentPlayer)}
                    disabled={gameOver || isThinking || getOpenRow(board, colIndex) < 0}
                    aria-label={cell ? `${playerName(cell)} 的棋子` : `第 ${colIndex + 1} 列空位`}
                    role="gridcell"
                  >
                    <span>{cell === 1 ? '★' : cell === 2 ? '☾' : ''}</span>
                  </button>
                )
              }),
            )}
          </div>
          <div className="board-feet" aria-hidden="true"><i /><i /></div>
        </div>

        <button className="restart-button" type="button" onClick={() => restart()}>
          ↻ <span>重新开始</span>
        </button>
      </section>

      <p className="tip"><span>💡</span> 横着、竖着或斜着连成四颗棋子，就赢啦！</p>
    </main>
  )
}

export default App
