'use client';

import { useState, useEffect } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const GRID_SIZE = 5;

export default function LightsOutGame() {
  const { t } = useLanguage();
  const [lights, setLights] = useState([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  const initGame = () => {
    const newLights = Array(GRID_SIZE).fill().map(() =>
      Array(GRID_SIZE).fill().map(() => Math.random() > 0.5)
    );
    setLights(newLights);
    setMoves(0);
    setWon(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  const toggleLight = (row, col) => {
    if (won) return;

    const newLights = lights.map(r => [...r]);

    // Toggle clicked light
    newLights[row][col] = !newLights[row][col];

    // Toggle adjacent lights
    if (row > 0) newLights[row - 1][col] = !newLights[row - 1][col];
    if (row < GRID_SIZE - 1) newLights[row + 1][col] = !newLights[row + 1][col];
    if (col > 0) newLights[row][col - 1] = !newLights[row][col - 1];
    if (col < GRID_SIZE - 1) newLights[row][col + 1] = !newLights[row][col + 1];

    setLights(newLights);
    setMoves(moves + 1);

    // Check if won
    if (newLights.every(row => row.every(light => !light))) {
      setWon(true);
    }
  };

  return (
    <GameLayout gameId="lightsout">
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
            <div className="inline-grid gap-2" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
              {lights.map((row, r) =>
                row.map((light, c) => (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => toggleLight(r, c)}
                    className={`w-16 h-16 rounded-lg transition-all ${
                      light ? 'bg-yellow-400 shadow-lg' : 'bg-gray-700'
                    }`}
                  >
                    {light ? '💡' : ''}
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
            <p className="text-gray-600">{t.games.lightsout.controls}</p>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
