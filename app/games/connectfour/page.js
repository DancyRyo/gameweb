'use client';

import { useState } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const ROWS = 6;
const COLS = 7;

export default function ConnectFourGame() {
  const { t } = useLanguage();
  const [board, setBoard] = useState(Array(ROWS).fill().map(() => Array(COLS).fill(null)));
  const [currentPlayer, setCurrentPlayer] = useState('red');
  const [winner, setWinner] = useState(null);
  const [winningCells, setWinningCells] = useState([]);

  const checkWinner = (board, row, col, player) => {
    const directions = [
      [[0, 1], [0, -1]], // horizontal
      [[1, 0], [-1, 0]], // vertical
      [[1, 1], [-1, -1]], // diagonal \
      [[1, -1], [-1, 1]]  // diagonal /
    ];

    for (let [dir1, dir2] of directions) {
      const cells = [[row, col]];

      // Check direction 1
      let [dr, dc] = dir1;
      let nr = row + dr, nc = col + dc;
      while (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc] === player) {
        cells.push([nr, nc]);
        nr += dr;
        nc += dc;
      }

      // Check direction 2
      [dr, dc] = dir2;
      nr = row + dr;
      nc = col + dc;
      while (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc] === player) {
        cells.push([nr, nc]);
        nr += dr;
        nc += dc;
      }

      if (cells.length >= 4) return cells;
    }
    return null;
  };

  const dropDisc = (col) => {
    if (winner) return;

    // Find the lowest empty row in this column
    let row = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (!board[r][col]) {
        row = r;
        break;
      }
    }

    if (row === -1) return; // Column is full

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);

    const winCells = checkWinner(newBoard, row, col, currentPlayer);
    if (winCells) {
      setWinner(currentPlayer);
      setWinningCells(winCells);
    } else if (newBoard.every(row => row.every(cell => cell !== null))) {
      setWinner('draw');
    } else {
      setCurrentPlayer(currentPlayer === 'red' ? 'yellow' : 'red');
    }
  };

  const resetGame = () => {
    setBoard(Array(ROWS).fill().map(() => Array(COLS).fill(null)));
    setCurrentPlayer('red');
    setWinner(null);
    setWinningCells([]);
  };

  const isWinningCell = (row, col) => {
    return winningCells.some(([r, c]) => r === row && c === col);
  };

  return (
    <GameLayout gameId="connectfour">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl">
          <div className="text-center mb-6">
            {winner ? (
              <div className="text-2xl font-bold text-green-600">
                {winner === 'draw'
                  ? (t.language === 'en' ? 'Draw!' : '平局！')
                  : t.language === 'en'
                  ? `${winner === 'red' ? 'Red' : 'Yellow'} wins!`
                  : `${winner === 'red' ? '红方' : '黄方'}获胜！`}
              </div>
            ) : (
              <div className="text-xl font-semibold text-gray-700">
                {t.language === 'en'
                  ? `Current: ${currentPlayer === 'red' ? 'Red' : 'Yellow'}`
                  : `当前: ${currentPlayer === 'red' ? '红方' : '黄方'}`}
              </div>
            )}
          </div>

          <div className="flex justify-center mb-6">
            <div className="inline-block bg-blue-600 p-4 rounded-lg">
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
                {board.map((row, r) =>
                  row.map((cell, c) => (
                    <button
                      key={`${r}-${c}`}
                      onClick={() => dropDisc(c)}
                      className={`w-14 h-14 rounded-full ${
                        cell === 'red'
                          ? isWinningCell(r, c)
                            ? 'bg-red-700 ring-4 ring-yellow-300'
                            : 'bg-red-500'
                          : cell === 'yellow'
                          ? isWinningCell(r, c)
                            ? 'bg-yellow-600 ring-4 ring-yellow-300'
                            : 'bg-yellow-400'
                          : 'bg-white hover:bg-gray-200'
                      } transition-all`}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              {t.restart}
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">{t.controls}</h3>
            <p className="text-gray-600">{t.games.connectfour.controls}</p>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
