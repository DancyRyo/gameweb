'use client';

import { useState, useEffect } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const SIZE = 4;

export default function SlidingPuzzleGame() {
  const { t } = useLanguage();
  const [tiles, setTiles] = useState([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  const initGame = () => {
    let numbers = Array.from({ length: SIZE * SIZE - 1 }, (_, i) => i + 1);
    numbers.push(0); // 0 represents the empty tile

    // Shuffle
    for (let i = 0; i < 100; i++) {
      const emptyIndex = numbers.indexOf(0);
      const row = Math.floor(emptyIndex / SIZE);
      const col = emptyIndex % SIZE;
      const moves = [];

      if (row > 0) moves.push(emptyIndex - SIZE);
      if (row < SIZE - 1) moves.push(emptyIndex + SIZE);
      if (col > 0) moves.push(emptyIndex - 1);
      if (col < SIZE - 1) moves.push(emptyIndex + 1);

      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      [numbers[emptyIndex], numbers[randomMove]] = [numbers[randomMove], numbers[emptyIndex]];
    }

    setTiles(numbers);
    setMoves(0);
    setWon(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  const canMove = (index) => {
    const emptyIndex = tiles.indexOf(0);
    const row = Math.floor(index / SIZE);
    const col = index % SIZE;
    const emptyRow = Math.floor(emptyIndex / SIZE);
    const emptyCol = emptyIndex % SIZE;

    return (
      (row === emptyRow && Math.abs(col - emptyCol) === 1) ||
      (col === emptyCol && Math.abs(row - emptyRow) === 1)
    );
  };

  const moveTile = (index) => {
    if (!canMove(index) || won) return;

    const newTiles = [...tiles];
    const emptyIndex = tiles.indexOf(0);
    [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];

    setTiles(newTiles);
    setMoves(moves + 1);

    // Check if won
    const isWon = newTiles.every((tile, i) =>
      i === SIZE * SIZE - 1 ? tile === 0 : tile === i + 1
    );
    if (isWon) setWon(true);
  };

  return (
    <GameLayout gameId="sliding">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl">
          <div className="flex justify-between items-center mb-6">
            <div className="text-lg font-semibold text-gray-700">
              {t.language === 'en' ? 'Moves' : '移动次数'}: <span className="text-blue-600">{moves}</span>
            </div>
            {won && (
              <div className="text-xl font-bold text-green-600">
                {t.youWin}
              </div>
            )}
          </div>

          <div className="flex justify-center mb-6">
            <div className="inline-grid gap-2 bg-gray-400 p-3 rounded-lg" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
              {tiles.map((tile, index) => (
                <button
                  key={index}
                  onClick={() => moveTile(index)}
                  className={`w-20 h-20 rounded-lg text-2xl font-bold transition-all ${
                    tile === 0
                      ? 'bg-gray-400'
                      : canMove(index)
                      ? 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
                      : 'bg-blue-400 text-white cursor-not-allowed'
                  }`}
                >
                  {tile !== 0 && tile}
                </button>
              ))}
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
            <p className="text-gray-600">{t.games.sliding.controls}</p>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
