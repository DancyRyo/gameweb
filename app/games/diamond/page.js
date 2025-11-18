'use client';

import { useState, useEffect } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const GEMS = ['💎', '💍', '💰', '⭐', '🔶', '🔷'];
const GRID_SIZE = 8;

export default function DiamondDashGame() {
  const { t } = useLanguage();
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [grid, setGrid] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('diamondHighScore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const createGrid = () => {
    const newGrid = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      newGrid[i] = [];
      for (let j = 0; j < GRID_SIZE; j++) {
        newGrid[i][j] = GEMS[Math.floor(Math.random() * GEMS.length)];
      }
    }
    return newGrid;
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setIsPlaying(true);
    setGrid(createGrid());
    setSelected(null);
  };

  const endGame = () => {
    setIsPlaying(false);
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('diamondHighScore', score.toString());
    }
  };

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleCellClick = (row, col) => {
    if (!isPlaying) return;

    if (!selected) {
      setSelected({ row, col });
    } else {
      const rowDiff = Math.abs(selected.row - row);
      const colDiff = Math.abs(selected.col - col);

      if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
        swapGems(selected, { row, col });
      }

      setSelected(null);
    }
  };

  const swapGems = (pos1, pos2) => {
    const newGrid = grid.map(row => [...row]);
    const temp = newGrid[pos1.row][pos1.col];
    newGrid[pos1.row][pos1.col] = newGrid[pos2.row][pos2.col];
    newGrid[pos2.row][pos2.col] = temp;

    setGrid(newGrid);

    setTimeout(() => {
      checkMatches(newGrid);
    }, 300);
  };

  const checkMatches = (currentGrid) => {
    const newGrid = currentGrid.map(row => [...row]);
    let matches = [];

    // Check horizontal matches
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE - 2; j++) {
        if (newGrid[i][j] === newGrid[i][j + 1] &&
            newGrid[i][j] === newGrid[i][j + 2]) {
          matches.push([i, j], [i, j + 1], [i, j + 2]);
        }
      }
    }

    // Check vertical matches
    for (let i = 0; i < GRID_SIZE - 2; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (newGrid[i][j] === newGrid[i + 1][j] &&
            newGrid[i][j] === newGrid[i + 2][j]) {
          matches.push([i, j], [i + 1, j], [i + 2, j]);
        }
      }
    }

    if (matches.length > 0) {
      // Remove matches
      matches.forEach(([i, j]) => {
        newGrid[i][j] = null;
      });

      setScore(s => s + matches.length * 10);

      // Drop gems
      for (let j = 0; j < GRID_SIZE; j++) {
        let emptyRow = GRID_SIZE - 1;
        for (let i = GRID_SIZE - 1; i >= 0; i--) {
          if (newGrid[i][j] !== null) {
            newGrid[emptyRow][j] = newGrid[i][j];
            if (emptyRow !== i) {
              newGrid[i][j] = null;
            }
            emptyRow--;
          }
        }

        // Fill empty spaces
        for (let i = emptyRow; i >= 0; i--) {
          newGrid[i][j] = GEMS[Math.floor(Math.random() * GEMS.length)];
        }
      }

      setGrid(newGrid);

      setTimeout(() => {
        checkMatches(newGrid);
      }, 500);
    } else {
      setGrid(newGrid);
    }
  };

  return (
    <GameLayout gameId="diamond">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <div className="text-lg font-semibold text-gray-700">
              {t.score}: <span className="text-blue-600">{score}</span>
            </div>
            <div className="text-lg font-semibold text-gray-700">
              {t.time}: <span className="text-green-600">{timeLeft}s</span>
            </div>
            <div className="text-lg font-semibold text-gray-700">
              {t.highScore}: <span className="text-purple-600">{highScore}</span>
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <div className="inline-grid gap-1 p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
              {grid.map((row, i) => (
                <div key={i} className="flex gap-1">
                  {row.map((gem, j) => (
                    <button
                      key={`${i}-${j}`}
                      onClick={() => handleCellClick(i, j)}
                      className={`w-12 h-12 text-3xl flex items-center justify-center rounded-lg transition-all transform hover:scale-110 ${
                        selected?.row === i && selected?.col === j
                          ? 'bg-yellow-300 scale-110 shadow-lg'
                          : 'bg-white hover:bg-yellow-100'
                      }`}
                    >
                      {gem}
                    </button>
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
                Match 3 or more gems!
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">{t.controls}</h3>
            <p className="text-gray-600">{t.games.diamond.controls}</p>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
