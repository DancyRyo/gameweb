'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 500;
const BASKET_WIDTH = 80;
const BASKET_HEIGHT = 20;
const FRUIT_SIZE = 30;

const FRUITS = ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍑', '🥝', '🍒'];

export default function CatchFruitGame() {
  const { t } = useLanguage();
  const canvasRef = useRef(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [basketX, setBasketX] = useState(CANVAS_WIDTH / 2 - BASKET_WIDTH / 2);
  const [fruits, setFruits] = useState([]);
  const [level, setLevel] = useState(1);
  const mouseX = useRef(CANVAS_WIDTH / 2);

  const handleMouseMove = useCallback((e) => {
    if (!gameStarted || gameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newX = Math.max(0, Math.min(x - BASKET_WIDTH / 2, CANVAS_WIDTH - BASKET_WIDTH));
    mouseX.current = newX;
    setBasketX(newX);
  }, [gameStarted, gameOver]);

  const handleKeyPress = useCallback((e) => {
    if (!gameStarted || gameOver) return;

    setBasketX(prev => {
      let newX = prev;
      if (e.key === 'ArrowLeft') newX = prev - 20;
      if (e.key === 'ArrowRight') newX = prev + 20;
      return Math.max(0, Math.min(newX, CANVAS_WIDTH - BASKET_WIDTH));
    });
  }, [gameStarted, gameOver]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const spawnInterval = Math.max(500, 1500 - level * 100);

    const spawnFruit = setInterval(() => {
      const newFruit = {
        id: Date.now(),
        x: Math.random() * (CANVAS_WIDTH - FRUIT_SIZE),
        y: -FRUIT_SIZE,
        type: FRUITS[Math.floor(Math.random() * FRUITS.length)],
        speed: 2 + level * 0.5,
      };

      setFruits(prev => [...prev, newFruit]);
    }, spawnInterval);

    return () => clearInterval(spawnFruit);
  }, [gameStarted, gameOver, level]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameLoop = setInterval(() => {
      setFruits(prevFruits => {
        const newFruits = prevFruits
          .map(fruit => ({
            ...fruit,
            y: fruit.y + fruit.speed,
          }))
          .filter(fruit => {
            // Check if fruit is caught
            if (
              fruit.y + FRUIT_SIZE >= CANVAS_HEIGHT - BASKET_HEIGHT &&
              fruit.y <= CANVAS_HEIGHT &&
              fruit.x + FRUIT_SIZE >= basketX &&
              fruit.x <= basketX + BASKET_WIDTH
            ) {
              setScore(s => {
                const newScore = s + 10;
                if (newScore % 100 === 0) {
                  setLevel(l => l + 1);
                }
                return newScore;
              });
              return false; // Remove caught fruit
            }

            // Check if fruit hit the ground
            if (fruit.y > CANVAS_HEIGHT) {
              setLives(l => {
                const newLives = l - 1;
                if (newLives <= 0) {
                  setGameOver(true);
                }
                return newLives;
              });
              return false; // Remove missed fruit
            }

            return true; // Keep fruit
          });

        return newFruits;
      });
    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver, basketX]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw ground
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(0, CANVAS_HEIGHT - 40, CANVAS_WIDTH, 40);

    // Draw basket
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(basketX, CANVAS_HEIGHT - BASKET_HEIGHT - 40, BASKET_WIDTH, BASKET_HEIGHT);
    ctx.fillStyle = '#D2691E';
    ctx.beginPath();
    ctx.moveTo(basketX, CANVAS_HEIGHT - BASKET_HEIGHT - 40);
    ctx.lineTo(basketX + 10, CANVAS_HEIGHT - 40);
    ctx.lineTo(basketX + BASKET_WIDTH - 10, CANVAS_HEIGHT - 40);
    ctx.lineTo(basketX + BASKET_WIDTH, CANVAS_HEIGHT - BASKET_HEIGHT - 40);
    ctx.closePath();
    ctx.fill();

    // Draw fruits
    ctx.font = `${FRUIT_SIZE}px Arial`;
    fruits.forEach(fruit => {
      ctx.fillText(fruit.type, fruit.x, fruit.y + FRUIT_SIZE);
    });
  }, [basketX, fruits]);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setLives(3);
    setLevel(1);
    setBasketX(CANVAS_WIDTH / 2 - BASKET_WIDTH / 2);
    setFruits([]);
  };

  return (
    <GameLayout gameId="catchfruit">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6 relative">
          <div className="flex justify-between items-center mb-4 gap-8">
            <div className="text-lg font-semibold">
              {t.score}: <span className="text-blue-600">{score}</span>
            </div>
            <div className="text-lg font-semibold">
              {t.level}: <span className="text-green-600">{level}</span>
            </div>
            <div className="text-lg font-semibold">
              {t.lives || 'Lives'}: <span className="text-red-600">{'❤️'.repeat(lives)}</span>
            </div>
          </div>

          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            onMouseMove={handleMouseMove}
            className="border-4 border-gray-800 rounded cursor-none"
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
              <div className="text-white text-3xl font-bold mb-4">{t.gameOver}</div>
              <div className="text-white text-xl mb-2">{t.score}: {score}</div>
              <div className="text-white text-xl mb-6">{t.level}: {level}</div>
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
          <p className="text-gray-700 mb-4">{t.games.catchfruit.controls}</p>
          <div className="text-sm text-gray-600">
            <p>• {t.games.catchfruit.description}</p>
            <p className="mt-2">• Each fruit caught = 10 points</p>
            <p>• Every 100 points increases the level</p>
            <p>• Higher levels = faster fruits</p>
            <p>• You lose a life if a fruit hits the ground</p>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
