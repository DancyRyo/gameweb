'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 600;
const CELL_SIZE = 50;
const ROWS = 12;
const COLS = 10;

export default function FroggerGame() {
  const { t } = useLanguage();
  const canvasRef = useRef(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [frog, setFrog] = useState({ x: 4, y: 11 });
  const [cars, setCars] = useState([]);
  const [logs, setLogs] = useState([]);
  const [finished, setFinished] = useState([false, false, false, false, false]);

  const initObstacles = useCallback(() => {
    const newCars = [];
    const newLogs = [];

    // Cars (rows 7-10)
    for (let row = 7; row <= 10; row++) {
      const direction = row % 2 === 0 ? 1 : -1;
      const speed = 0.03 + (row - 7) * 0.01;
      const count = 2 + (row % 2);

      for (let i = 0; i < count; i++) {
        newCars.push({
          id: `car-${row}-${i}`,
          x: (i * COLS / count) * direction,
          y: row,
          width: 2,
          direction,
          speed,
        });
      }
    }

    // Logs (rows 2-5)
    for (let row = 2; row <= 5; row++) {
      const direction = row % 2 === 0 ? -1 : 1;
      const speed = 0.02 + (row - 2) * 0.005;
      const count = 2;

      for (let i = 0; i < count; i++) {
        newLogs.push({
          id: `log-${row}-${i}`,
          x: (i * COLS / count) * direction,
          y: row,
          width: 3,
          direction,
          speed,
        });
      }
    }

    return { newCars, newLogs };
  }, []);

  const handleKeyPress = useCallback((e) => {
    if (!gameStarted || gameOver) return;

    setFrog(prev => {
      let newX = prev.x;
      let newY = prev.y;

      switch(e.key) {
        case 'ArrowLeft': newX = Math.max(0, prev.x - 1); break;
        case 'ArrowRight': newX = Math.min(COLS - 1, prev.x + 1); break;
        case 'ArrowUp': newY = Math.max(0, prev.y - 1); break;
        case 'ArrowDown': newY = Math.min(ROWS - 1, prev.y + 1); break;
        default: return prev;
      }

      e.preventDefault();

      // Check if reached goal
      if (newY === 0) {
        if (!finished[newX]) {
          setFinished(f => {
            const newFinished = [...f];
            newFinished[newX] = true;

            // Check win
            if (newFinished.every(f => f)) {
              setGameOver(true);
              setScore(s => s + 1000);
            }

            return newFinished;
          });
          setScore(s => s + 100);
        }
        return { x: 4, y: 11 };
      }

      return { x: newX, y: newY };
    });
  }, [gameStarted, gameOver, finished]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameLoop = setInterval(() => {
      // Move cars
      setCars(prevCars => prevCars.map(car => {
        let newX = car.x + car.direction * car.speed;

        // Wrap around
        if (car.direction > 0 && newX > COLS) {
          newX = -car.width;
        } else if (car.direction < 0 && newX < -car.width) {
          newX = COLS;
        }

        return { ...car, x: newX };
      }));

      // Move logs
      setLogs(prevLogs => prevLogs.map(log => {
        let newX = log.x + log.direction * log.speed;

        // Wrap around
        if (log.direction > 0 && newX > COLS) {
          newX = -log.width;
        } else if (log.direction < 0 && newX < -log.width) {
          newX = COLS;
        }

        return { ...log, x: newX };
      }));

      // Check collisions with cars
      const onRoad = frog.y >= 7 && frog.y <= 10;
      if (onRoad) {
        const hitByCar = cars.some(car => {
          if (car.y !== frog.y) return false;
          return frog.x >= Math.floor(car.x) &&
                 frog.x < Math.floor(car.x) + car.width;
        });

        if (hitByCar) {
          setLives(l => {
            const newLives = l - 1;
            if (newLives <= 0) {
              setGameOver(true);
            }
            return newLives;
          });
          setFrog({ x: 4, y: 11 });
        }
      }

      // Check if on water
      const onWater = frog.y >= 2 && frog.y <= 5;
      if (onWater) {
        const onLog = logs.find(log => {
          if (log.y !== frog.y) return false;
          return frog.x >= Math.floor(log.x) &&
                 frog.x < Math.floor(log.x) + log.width;
        });

        if (onLog) {
          // Move with log
          setFrog(prev => {
            let newX = prev.x + onLog.direction * onLog.speed;
            if (newX < 0 || newX >= COLS) {
              setLives(l => {
                const newLives = l - 1;
                if (newLives <= 0) {
                  setGameOver(true);
                }
                return newLives;
              });
              return { x: 4, y: 11 };
            }
            return { ...prev, x: newX };
          });
        } else {
          // Fell in water
          setLives(l => {
            const newLives = l - 1;
            if (newLives <= 0) {
              setGameOver(true);
            }
            return newLives;
          });
          setFrog({ x: 4, y: 11 });
        }
      }
    }, 50);

    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver, frog, cars, logs]);

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw goal area (row 0)
    ctx.fillStyle = '#2E7D32';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CELL_SIZE);

    // Draw finish spots
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = finished[i] ? '#FFD700' : '#1B5E20';
      ctx.fillRect(i * 2 * CELL_SIZE + CELL_SIZE / 4, CELL_SIZE / 4, CELL_SIZE / 2, CELL_SIZE / 2);

      if (finished[i]) {
        ctx.font = '30px Arial';
        ctx.fillText('🐸', i * 2 * CELL_SIZE + CELL_SIZE / 4, CELL_SIZE * 0.7);
      }
    }

    // Draw safe zone (row 1)
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(0, CELL_SIZE, CANVAS_WIDTH, CELL_SIZE);

    // Draw water (rows 2-5)
    ctx.fillStyle = '#1565C0';
    ctx.fillRect(0, 2 * CELL_SIZE, CANVAS_WIDTH, 4 * CELL_SIZE);

    // Draw logs
    ctx.fillStyle = '#6D4C41';
    logs.forEach(log => {
      ctx.fillRect(
        log.x * CELL_SIZE,
        log.y * CELL_SIZE + 10,
        log.width * CELL_SIZE,
        CELL_SIZE - 20
      );
    });

    // Draw safe zone (row 6)
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(0, 6 * CELL_SIZE, CANVAS_WIDTH, CELL_SIZE);

    // Draw road (rows 7-10)
    ctx.fillStyle = '#424242';
    ctx.fillRect(0, 7 * CELL_SIZE, CANVAS_WIDTH, 4 * CELL_SIZE);

    // Draw road lines
    ctx.strokeStyle = '#FFEB3B';
    ctx.setLineDash([20, 10]);
    for (let row = 7; row < 10; row++) {
      ctx.beginPath();
      ctx.moveTo(0, (row + 0.5) * CELL_SIZE);
      ctx.lineTo(CANVAS_WIDTH, (row + 0.5) * CELL_SIZE);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Draw cars
    cars.forEach(car => {
      ctx.fillStyle = car.direction > 0 ? '#F44336' : '#2196F3';
      ctx.fillRect(
        car.x * CELL_SIZE,
        car.y * CELL_SIZE + 10,
        car.width * CELL_SIZE,
        CELL_SIZE - 20
      );

      // Headlights
      ctx.fillStyle = '#FFFF00';
      if (car.direction > 0) {
        ctx.fillRect(car.x * CELL_SIZE + car.width * CELL_SIZE - 5, car.y * CELL_SIZE + 15, 3, 8);
        ctx.fillRect(car.x * CELL_SIZE + car.width * CELL_SIZE - 5, car.y * CELL_SIZE + 27, 3, 8);
      } else {
        ctx.fillRect(car.x * CELL_SIZE + 2, car.y * CELL_SIZE + 15, 3, 8);
        ctx.fillRect(car.x * CELL_SIZE + 2, car.y * CELL_SIZE + 27, 3, 8);
      }
    });

    // Draw start zone (row 11)
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(0, 11 * CELL_SIZE, CANVAS_WIDTH, CELL_SIZE);

    // Draw frog
    ctx.font = '35px Arial';
    ctx.fillText('🐸', frog.x * CELL_SIZE + 7, frog.y * CELL_SIZE + 37);
  }, [frog, cars, logs, finished]);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setLives(3);
    setFrog({ x: 4, y: 11 });
    setFinished([false, false, false, false, false]);

    const { newCars, newLogs } = initObstacles();
    setCars(newCars);
    setLogs(newLogs);
  };

  return (
    <GameLayout gameId="frogger">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6 relative">
          <div className="flex justify-between items-center mb-4 gap-12">
            <div className="text-lg font-semibold">
              {t.score}: <span className="text-blue-600">{score}</span>
            </div>
            <div className="text-lg font-semibold">
              {t.lives || 'Lives'}: <span className="text-red-600">{'❤️'.repeat(lives)}</span>
            </div>
          </div>

          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="border-4 border-gray-800 rounded"
          />

          {!gameStarted && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded">
              <button
                onClick={startGame}
                className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xl font-bold"
              >
                {t.start}
              </button>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 rounded">
              <div className="text-white text-3xl font-bold mb-4">
                {finished.every(f => f) ? t.youWin : t.gameOver}
              </div>
              <div className="text-white text-xl mb-6">{t.score}: {score}</div>
              <button
                onClick={startGame}
                className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xl font-bold"
              >
                {t.restart}
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
          <h3 className="font-bold text-lg mb-2">{t.controls}</h3>
          <p className="text-gray-700 mb-4">{t.games.frogger.controls}</p>
          <div className="text-sm text-gray-600">
            <p>• {t.games.frogger.description}</p>
            <p className="mt-2">• Avoid cars on the road</p>
            <p>• Jump on logs to cross the river</p>
            <p>• Don't fall in the water!</p>
            <p>• Reach all 5 goal spots to win</p>
            <p>• Each goal = 100 points</p>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
