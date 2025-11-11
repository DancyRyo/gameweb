'use client';

import { useState } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const SIZE = 15;

export default function GomokuGame() {
  const { t } = useLanguage();
  const [board, setBoard] = useState(Array(SIZE).fill().map(() => Array(SIZE).fill(null)));
  const [isBlackTurn, setIsBlackTurn] = useState(true);
  const [winner, setWinner] = useState(null);

  const checkWinner = (r, c, player) => {
    const directions = [
      [[0, 1], [0, -1]], // horizontal
      [[1, 0], [-1, 0]], // vertical
      [[1, 1], [-1, -1]], // diagonal \
      [[1, -1], [-1, 1]]  // diagonal /
    ];

    for (let [dir1, dir2] of directions) {
      let count = 1;

      // Check direction 1
      let [dr, dc] = dir1;
      let nr = r + dr, nc = c + dc;
      while (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && board[nr][nc] === player) {
        count++;
        nr += dr;
        nc += dc;
      }

      // Check direction 2
      [dr, dc] = dir2;
      nr = r + dr;
      nc = c + dc;
      while (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && board[nr][nc] === player) {
        count++;
        nr += dr;
        nc += dc;
      }

      if (count >= 5) return true;
    }
    return false;
  };

  const handleClick = (row, col) => {
    if (board[row][col] || winner) return;

    const newBoard = board.map(r => [...r]);
    const player = isBlackTurn ? 'black' : 'white';
    newBoard[row][col] = player;
    setBoard(newBoard);

    if (checkWinner(row, col, player)) {
      setWinner(player);
    } else {
      setIsBlackTurn(!isBlackTurn);
    }
  };

  const resetGame = () => {
    setBoard(Array(SIZE).fill().map(() => Array(SIZE).fill(null)));
    setIsBlackTurn(true);
    setWinner(null);
  };

  return (
    <GameLayout gameId="gomoku">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-3xl">
          <div className="text-center mb-4">
            {winner ? (
              <div className="text-2xl font-bold text-green-600">
                {t.language === 'en'
                  ? `${winner === 'black' ? 'Black' : 'White'} wins!`
                  : `${winner === 'black' ? '黑方' : '白方'}获胜！`}
              </div>
            ) : (
              <div className="text-xl font-semibold text-gray-700">
                {t.language === 'en'
                  ? `Next: ${isBlackTurn ? 'Black' : 'White'}`
                  : `下一个: ${isBlackTurn ? '黑方' : '白方'}`}
              </div>
            )}
          </div>

          <div className="flex justify-center mb-4 overflow-auto">
            <div
              className="inline-grid gap-0 bg-amber-100 p-4"
              style={{ gridTemplateColumns: `repeat(${SIZE}, 24px)` }}
            >
              {board.map((row, r) =>
                row.map((cell, c) => (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => handleClick(r, c)}
                    className="w-6 h-6 border border-gray-400 hover:bg-amber-200 transition-colors flex items-center justify-center"
                  >
                    {cell === 'black' && (
                      <div className="w-5 h-5 rounded-full bg-black" />
                    )}
                    {cell === 'white' && (
                      <div className="w-5 h-5 rounded-full bg-white border-2 border-gray-600" />
                    )}
                  </button>
                ))
              )}
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
            <p className="text-gray-600">{t.games.gomoku.controls}</p>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
