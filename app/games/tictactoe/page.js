'use client';

import { useState } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

export default function TicTacToe() {
  const { t } = useLanguage();
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null);

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];

    for (let [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleClick = (i) => {
    if (board[i] || winner) return;

    const newBoard = [...board];
    newBoard[i] = isXNext ? 'X' : 'O';
    setBoard(newBoard);

    const gameWinner = calculateWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
    }

    setIsXNext(!isXNext);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
  };

  const isBoardFull = board.every(cell => cell !== null);

  return (
    <GameLayout gameId="tictactoe">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg">
          <div className="text-center mb-6">
            {winner ? (
              <div className="text-2xl font-bold text-green-600">
                {t.language === 'en' ? `Player ${winner} wins!` : `玩家 ${winner} 获胜！`}
              </div>
            ) : isBoardFull ? (
              <div className="text-2xl font-bold text-gray-600">
                {t.language === 'en' ? 'Draw!' : '平局！'}
              </div>
            ) : (
              <div className="text-xl font-semibold text-gray-700">
                {t.language === 'en' ? `Next: ${isXNext ? 'X' : 'O'}` : `下一个: ${isXNext ? 'X' : 'O'}`}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 mb-6 mx-auto w-80">
            {board.map((cell, i) => (
              <button
                key={i}
                onClick={() => handleClick(i)}
                className="h-24 bg-blue-50 border-2 border-blue-300 rounded-lg text-5xl font-bold hover:bg-blue-100 transition-colors"
              >
                {cell}
              </button>
            ))}
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
            <p className="text-gray-600">{t.games.tictactoe.controls}</p>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
