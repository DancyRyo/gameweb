'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const ROAD_WIDTH = 300;
const ROAD_OFFSET = (CANVAS_WIDTH - ROAD_WIDTH) / 2;
const CAR_WIDTH = 40;
const CAR_HEIGHT = 60;
const LANE_COUNT = 3;
const LANE_WIDTH = ROAD_WIDTH / LANE_COUNT;

export default function RacingGame() {
  const { t } = useLanguage();
  const canvasRef = useRef(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(5);
  const [playerLane, setPlayerLane] = useState(1);
  const [playerY] = useState(CANVAS_HEIGHT - 100);
  const [cars, setCars] = useState([]);
  const [roadOffset, setRoadOffset] = useState(0);
  const [keys, setKeys] = useState({});

  const handleKeyDown = useCallback((e) => {
    if (!gameStarted || gameOver) return;
    setKeys(prev => ({ ...prev, [e.key]: true }));
  }, [gameStarted, gameOver]);

  const handleKeyUp = useCallback((e) => {
    setKeys(prev => ({ ...prev, [e.key]: false }));
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const getLaneX = (lane) => {
    return ROAD_OFFSET + lane * LANE_WIDTH + LANE_WIDTH / 2 - CAR_WIDTH / 2;
  };

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    // Handle lane changes
    if (keys.ArrowLeft) {
      setPlayerLane(prev => Math.max(0, prev - 1));
      setKeys(prev => ({ ...prev, ArrowLeft: false }));
    } else if (keys.ArrowRight) {
      setPlayerLane(prev => Math.min(LANE_COUNT - 1, prev + 1));
      setKeys(prev => ({ ...prev, ArrowRight: false }));
    }
  }, [keys, gameStarted, gameOver]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameLoop = setInterval(() => {
      // Increase speed gradually
      setSpeed(s => Math.min(s + 0.01, 15));

      // Increase score
      setScore(s => s + 1);

      // Move road
      setRoadOffset(offset => (offset + speed) % 100);

      // Spawn cars
      if (Math.random() < 0.02) {
        const lane = Math.floor(Math.random() * LANE_COUNT);
        setCars(prev => [...prev, {
          id: Date.now(),
          lane,
          y: -CAR_HEIGHT,
          color: ['#FF0000', '#0000FF', '#00FF00', '#FFFF00', '#FF00FF'][Math.floor(Math.random() * 5)],
        }]);
      }

      // Move cars
      setCars(prev => prev
        .map(car => ({ ...car, y: car.y + speed }))
        .filter(car => car.y < CANVAS_HEIGHT)
      );

      // Check collisions
      const playerX = getLaneX(playerLane);
      const collision = cars.some(car => {
        const carX = getLaneX(car.lane);
        return Math.abs(car.y - playerY) < CAR_HEIGHT - 10 &&
               Math.abs(carX - playerX) < CAR_WIDTH - 10;
      });

      if (collision) {
        setGameOver(true);
      }
    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver, speed, playerLane, playerY, cars]);

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Draw grass
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw road
    ctx.fillStyle = '#555';
    ctx.fillRect(ROAD_OFFSET, 0, ROAD_WIDTH, CANVAS_HEIGHT);

    // Draw road lines
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 3;
    ctx.setLineDash([20, 20]);

    for (let i = 1; i < LANE_COUNT; i++) {
      ctx.beginPath();
      ctx.moveTo(ROAD_OFFSET + i * LANE_WIDTH, 0);
      ctx.lineTo(ROAD_OFFSET + i * LANE_WIDTH, CANVAS_HEIGHT);
      ctx.stroke();
    }

    // Draw road edge lines
    ctx.setLineDash([]);
    ctx.strokeStyle = '#FFFF00';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(ROAD_OFFSET, 0);
    ctx.lineTo(ROAD_OFFSET, CANVAS_HEIGHT);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ROAD_OFFSET + ROAD_WIDTH, 0);
    ctx.lineTo(ROAD_OFFSET + ROAD_WIDTH, CANVAS_HEIGHT);
    ctx.stroke();

    // Draw other cars
    cars.forEach(car => {
      const carX = getLaneX(car.lane);

      // Car body
      ctx.fillStyle = car.color;
      ctx.fillRect(carX, car.y, CAR_WIDTH, CAR_HEIGHT);

      // Car windows
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(carX + 5, car.y + 10, CAR_WIDTH - 10, 15);
      ctx.fillRect(carX + 5, car.y + 35, CAR_WIDTH - 10, 15);

      // Car outline
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.strokeRect(carX, car.y, CAR_WIDTH, CAR_HEIGHT);
    });

    // Draw player car
    const playerX = getLaneX(playerLane);

    // Player car body
    ctx.fillStyle = '#FF4500';
    ctx.fillRect(playerX, playerY, CAR_WIDTH, CAR_HEIGHT);

    // Player car windows
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(playerX + 5, playerY + 10, CAR_WIDTH - 10, 15);
    ctx.fillRect(playerX + 5, playerY + 35, CAR_WIDTH - 10, 15);

    // Player car outline
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(playerX, playerY, CAR_WIDTH, CAR_HEIGHT);

    // Draw spoiler
    ctx.fillStyle = '#000';
    ctx.fillRect(playerX + 5, playerY + CAR_HEIGHT - 5, CAR_WIDTH - 10, 3);
  }, [playerLane, playerY, cars, roadOffset]);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setSpeed(5);
    setPlayerLane(1);
    setCars([]);
    setRoadOffset(0);
    setKeys({});
  };

  return (
    <GameLayout gameId="racing">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6 relative">
          <div className="flex justify-between items-center mb-4 gap-8">
            <div className="text-lg font-semibold">
              {t.score}: <span className="text-blue-600">{score}</span>
            </div>
            <div className="text-lg font-semibold">
              Speed: <span className="text-green-600">{Math.floor(speed)}</span>
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
                className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xl font-bold"
              >
                {t.start}
              </button>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 rounded">
              <div className="text-white text-3xl font-bold mb-4">{t.gameOver}</div>
              <div className="text-white text-xl mb-2">{t.score}: {score}</div>
              <div className="text-white text-xl mb-6">Top Speed: {Math.floor(speed)}</div>
              <button
                onClick={startGame}
                className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xl font-bold"
              >
                {t.restart}
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
          <h3 className="font-bold text-lg mb-2">{t.controls}</h3>
          <p className="text-gray-700 mb-4">{t.games.racing.controls}</p>
          <div className="text-sm text-gray-600">
            <p>• {t.games.racing.description}</p>
            <p className="mt-2">• Use ← → arrow keys to change lanes</p>
            <p>• Avoid crashing into other cars</p>
            <p>• Speed increases over time</p>
            <p>• Score points for distance traveled</p>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
