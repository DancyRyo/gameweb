'use client';

import { useState, useEffect } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const COLORS = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];
const GRID_SIZE = 10;

export default function CubeCrushGame() {
  const { t } = useLanguage();
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [grid, setGrid] = useState([]);
  const [moves, setMoves] = useState(30);

  useEffect(() => {
    const saved = localStorage.getItem('cubecrushHighScore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const createGrid = () => {
    const newGrid = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      newGrid[i] = [];
      for (let j = 0; j < GRID_SIZE; j++) {
        newGrid[i][j] = {
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          id: `${i}-${j}-${Date.now()}`
        };
      }
    }
    return newGrid;
  };

  const startGame = () => {
    setScore(0);
    setMoves(30);
    setIsPlaying(true);
    setGrid(createGrid());
  };

  const endGame = () => {
    setIsPlaying(false);
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('cubecrushHighScore', score.toString());
    }
  };

  const findConnectedCubes = (row, col, color, visited = new Set()) => {
    const key = `${row}-${col}`;
    if (visited.has(key)) return [];
    if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return [];
    if (!grid[row] || !grid[row][col] || grid[row][col].color !== color) return [];

    visited.add(key);
    const connected = [{ row, col }];

    // Check all 4 directions
    connected.push(...findConnectedCubes(row - 1, col, color, visited));
    connected.push(...findConnectedCubes(row + 1, col, color, visited));
    connected.push(...findConnectedCubes(row, col - 1, color, visited));
    connected.push(...findConnectedCubes(row, col + 1, color, visited));

    return connected;
  };

  const handleCubeClick = (row, col) => {
    if (!isPlaying || !grid[row] || !grid[row][col]) return;

    const color = grid[row][col].color;
    const connected = findConnectedCubes(row, col, color);

    if (connected.length >= 2) {
      // Remove connected cubes
      const newGrid = grid.map(r => [...r]);
      connected.forEach(({ row, col }) => {
        newGrid[row][col] = null;
      });

      setScore(s => s + connected.length * connected.length);
      setMoves(m => {
        const newMoves = m - 1;
        if (newMoves <= 0) {
          setTimeout(endGame, 500);
        }
        return newMoves;
      });

      // Gravity - drop cubes down
      for (let j = 0; j < GRID_SIZE; j++) {
        let emptyRow = GRID_SIZE - 1;
        for (let i = GRID_SIZE - 1; i >= 0; i--) {
          if (newGrid[i][j] !== null) {
            if (emptyRow !== i) {
              newGrid[emptyRow][j] = newGrid[i][j];
              newGrid[i][j] = null;
            }
            emptyRow--;
          }
        }
      }

      // Shift columns left to fill gaps
      let writeCol = 0;
      for (let j = 0; j < GRID_SIZE; j++) {
        const hasBlocks = newGrid.some(row => row[j] !== null);
        if (hasBlocks) {
          if (writeCol !== j) {
            for (let i = 0; i < GRID_SIZE; i++) {
              newGrid[i][writeCol] = newGrid[i][j];
              newGrid[i][j] = null;
            }
          }
          writeCol++;
        }
      }

      setGrid(newGrid);
    }
  };

  return (
    <GameLayout gameId="cubecrush">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <div className="text-lg font-semibold text-gray-700">
              {t.score}: <span className="text-blue-600">{score}</span>
            </div>
            <div className="text-lg font-semibold text-gray-700">
              Moves: <span className="text-orange-600">{moves}</span>
            </div>
            <div className="text-lg font-semibold text-gray-700">
              {t.highScore}: <span className="text-purple-600">{highScore}</span>
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <div className="inline-grid gap-1 p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg">
              {grid.map((row, i) => (
                <div key={i} className="flex gap-1">
                  {row.map((cube, j) => (
                    <button
                      key={cube?.id || `empty-${i}-${j}`}
                      onClick={() => handleCubeClick(i, j)}
                      className={`w-10 h-10 rounded transition-all transform hover:scale-110 ${
                        cube ? `${cube.color} shadow-md` : 'bg-transparent'
                      }`}
                      disabled={!cube}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            {!isPlaying ? (
              <button
                onClick={startGame}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                {score > 0 ? t.restart : t.start}
              </button>
            ) : (
              <div className="text-xl font-bold text-blue-600">
                Click groups of 2+ same colored cubes!
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">{t.controls}</h3>
            <p className="text-gray-600">{t.games.cubecrush.controls}</p>
            <p className="text-gray-600 mt-2">Tip: Larger groups give more points!</p>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
