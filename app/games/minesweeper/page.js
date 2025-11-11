'use client';

import { useState, useEffect } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const ROWS = 10;
const COLS = 10;
const MINES = 15;

export default function MinesweeperGame() {
  const { t } = useLanguage();
  const [board, setBoard] = useState([]);
  const [revealed, setRevealed] = useState([]);
  const [flagged, setFlagged] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const initGame = () => {
    // Create empty board
    const newBoard = Array(ROWS).fill().map(() => Array(COLS).fill(0));

    // Place mines
    let minesPlaced = 0;
    while (minesPlaced < MINES) {
      const row = Math.floor(Math.random() * ROWS);
      const col = Math.floor(Math.random() * COLS);
      if (newBoard[row][col] !== -1) {
        newBoard[row][col] = -1;
        minesPlaced++;
      }
    }

    // Calculate numbers
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (newBoard[r][c] === -1) continue;
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && newBoard[nr][nc] === -1) {
              count++;
            }
          }
        }
        newBoard[r][c] = count;
      }
    }

    setBoard(newBoard);
    setRevealed(Array(ROWS).fill().map(() => Array(COLS).fill(false)));
    setFlagged(Array(ROWS).fill().map(() => Array(COLS).fill(false)));
    setGameOver(false);
    setWon(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  const revealCell = (row, col) => {
    if (gameOver || won || revealed[row][col] || flagged[row][col]) return;

    const newRevealed = revealed.map(r => [...r]);

    const reveal = (r, c) => {
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS || newRevealed[r][c]) return;

      newRevealed[r][c] = true;

      if (board[r][c] === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            reveal(r + dr, c + dc);
          }
        }
      }
    };

    if (board[row][col] === -1) {
      newRevealed[row][col] = true;
      setRevealed(newRevealed);
      setGameOver(true);
      return;
    }

    reveal(row, col);
    setRevealed(newRevealed);

    // Check win
    let cellsToReveal = ROWS * COLS - MINES;
    let revealedCount = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (newRevealed[r][c] && board[r][c] !== -1) revealedCount++;
      }
    }
    if (revealedCount === cellsToReveal) {
      setWon(true);
    }
  };

  const toggleFlag = (row, col, e) => {
    e.preventDefault();
    if (gameOver || won || revealed[row][col]) return;

    const newFlagged = flagged.map(r => [...r]);
    newFlagged[row][col] = !newFlagged[row][col];
    setFlagged(newFlagged);
  };

  const getCellContent = (row, col) => {
    if (flagged[row][col]) return '🚩';
    if (!revealed[row][col]) return '';
    if (board[row][col] === -1) return '💣';
    if (board[row][col] === 0) return '';
    return board[row][col];
  };

  const getCellColor = (row, col) => {
    if (!revealed[row][col]) return 'bg-gray-300 hover:bg-gray-400';
    if (board[row][col] === -1) return 'bg-red-500';
    return 'bg-gray-100';
  };

  return (
    <GameLayout gameId="minesweeper">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl">
          {(gameOver || won) && (
            <div className="text-center mb-4">
              <div className={`text-2xl font-bold ${won ? 'text-green-600' : 'text-red-600'}`}>
                {won ? t.youWin : t.gameOver}
              </div>
            </div>
          )}

          <div className="flex justify-center mb-4">
            <div className="inline-grid gap-1 bg-gray-400 p-2 rounded" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
              {board.map((row, r) =>
                row.map((cell, c) => (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => revealCell(r, c)}
                    onContextMenu={(e) => toggleFlag(r, c, e)}
                    className={`w-8 h-8 ${getCellColor(r, c)} border border-gray-400 flex items-center justify-center text-sm font-bold`}
                  >
                    {getCellContent(r, c)}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={initGame}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              {t.restart}
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">{t.controls}</h3>
            <p className="text-gray-600">{t.games.minesweeper.controls}</p>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
