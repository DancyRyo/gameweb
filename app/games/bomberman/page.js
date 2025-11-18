'use client';

import { useState, useEffect, useRef } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const GRID_SIZE = 11;

export default function BombermanGame() {
  const { t } = useLanguage();
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
  const [grid, setGrid] = useState([]);
  const [bombs, setBombs] = useState([]);
  const [explosions, setExplosions] = useState([]);
  const keysPressed = useRef({});

  useEffect(() => {
    const saved = localStorage.getItem('bombermanHighScore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const createGrid = () => {
    const newGrid = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      newGrid[i] = [];
      for (let j = 0; j < GRID_SIZE; j++) {
        // Walls on edges and every other row/col
        if (i === 0 || j === 0 || i === GRID_SIZE - 1 || j === GRID_SIZE - 1 ||
            (i % 2 === 0 && j % 2 === 0)) {
          newGrid[i][j] = 'wall';
        }
        // Random breakable blocks
        else if (!(i === 1 && j === 1) && Math.random() < 0.4) {
          newGrid[i][j] = 'block';
        } else {
          newGrid[i][j] = 'empty';
        }
      }
    }
    return newGrid;
  };

  const startGame = () => {
    setScore(0);
    setIsPlaying(true);
    setPlayerPos({ x: 1, y: 1 });
    setGrid(createGrid());
    setBombs([]);
    setExplosions([]);
  };

  const endGame = () => {
    setIsPlaying(false);
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('bombermanHighScore', score.toString());
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isPlaying) return;
      keysPressed.current[e.key] = true;

      if (e.key === ' ') {
        e.preventDefault();
        placeBomb();
      }
    };

    const handleKeyUp = (e) => {
      keysPressed.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying, playerPos, bombs, grid]);

  const placeBomb = () => {
    const bombExists = bombs.some(b => b.x === playerPos.x && b.y === playerPos.y);
    if (!bombExists && bombs.length < 3) {
      setBombs(prev => [...prev, {
        id: Date.now(),
        x: playerPos.x,
        y: playerPos.y,
        timer: 3
      }]);
    }
  };

  useEffect(() => {
    if (!isPlaying) return;

    const gameLoop = setInterval(() => {
      // Move player
      setPlayerPos(prev => {
        let newPos = { ...prev };

        if (keysPressed.current['ArrowUp']) {
          const newY = prev.y - 1;
          if (grid[newY]?.[prev.x] === 'empty') newPos.y = newY;
        }
        if (keysPressed.current['ArrowDown']) {
          const newY = prev.y + 1;
          if (grid[newY]?.[prev.x] === 'empty') newPos.y = newY;
        }
        if (keysPressed.current['ArrowLeft']) {
          const newX = prev.x - 1;
          if (grid[prev.y]?.[newX] === 'empty') newPos.x = newX;
        }
        if (keysPressed.current['ArrowRight']) {
          const newX = prev.x + 1;
          if (grid[prev.y]?.[newX] === 'empty') newPos.x = newX;
        }

        // Check if player is in explosion
        if (explosions.some(e => e.x === newPos.x && e.y === newPos.y)) {
          endGame();
        }

        return newPos;
      });

      // Update bomb timers
      setBombs(prev => {
        const updated = prev.map(bomb => ({
          ...bomb,
          timer: bomb.timer - 0.1
        }));

        // Explode bombs with timer <= 0
        const exploding = updated.filter(b => b.timer <= 0);
        exploding.forEach(bomb => {
          const newExplosions = [{ x: bomb.x, y: bomb.y }];

          // Explosion spreads in 4 directions
          const directions = [
            { dx: 0, dy: -1 },
            { dx: 0, dy: 1 },
            { dx: -1, dy: 0 },
            { dx: 1, dy: 0 }
          ];

          directions.forEach(({ dx, dy }) => {
            for (let i = 1; i <= 2; i++) {
              const newX = bomb.x + dx * i;
              const newY = bomb.y + dy * i;
              if (grid[newY]?.[newX] === 'wall') break;
              newExplosions.push({ x: newX, y: newY });
              if (grid[newY]?.[newX] === 'block') {
                // Destroy block
                setGrid(g => {
                  const newGrid = g.map(row => [...row]);
                  newGrid[newY][newX] = 'empty';
                  return newGrid;
                });
                setScore(s => s + 10);
                break;
              }
            }
          });

          setExplosions(newExplosions);
          setTimeout(() => setExplosions([]), 500);
        });

        return updated.filter(b => b.timer > 0);
      });
    }, 100);

    return () => clearInterval(gameLoop);
  }, [isPlaying, grid, explosions]);

  return (
    <GameLayout gameId="bomberman">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <div className="text-lg font-semibold text-gray-700">
              {t.score}: <span className="text-blue-600">{score}</span>
            </div>
            <div className="text-lg font-semibold text-gray-700">
              Bombs: <span className="text-orange-600">{3 - bombs.length}</span>
            </div>
            <div className="text-lg font-semibold text-gray-700">
              {t.highScore}: <span className="text-purple-600">{highScore}</span>
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <div className="inline-grid gap-1 p-4 bg-gradient-to-br from-green-200 to-green-300 rounded-lg">
              {grid.map((row, i) => (
                <div key={i} className="flex gap-1">
                  {row.map((cell, j) => (
                    <div
                      key={`${i}-${j}`}
                      className={`w-8 h-8 flex items-center justify-center text-xl ${
                        cell === 'wall' ? 'bg-gray-700' :
                        cell === 'block' ? 'bg-orange-400' :
                        'bg-green-100'
                      }`}
                    >
                      {playerPos.x === j && playerPos.y === i && '😊'}
                      {bombs.some(b => b.x === j && b.y === i) && '💣'}
                      {explosions.some(e => e.x === j && e.y === i) && '💥'}
                    </div>
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
                Destroy all blocks!
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">{t.controls}</h3>
            <p className="text-gray-600">{t.games.bomberman.controls}</p>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
