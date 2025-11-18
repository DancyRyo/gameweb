'use client';

import { useState, useEffect, useRef } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const GAME_TIME = 60;
const FRUITS = ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🥝'];
const BOMBS = ['💣'];

export default function FruitNinjaGame() {
  const { t } = useLanguage();
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lives, setLives] = useState(3);
  const [fruits, setFruits] = useState([]);
  const timerRef = useRef(null);
  const spawnRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('fruitninjaHighScore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const startGame = () => {
    setScore(0);
    setTimeLeft(GAME_TIME);
    setLives(3);
    setIsPlaying(true);
    setFruits([]);

    // Spawn fruits
    spawnRef.current = setInterval(() => {
      spawnFruit();
    }, 1000);

    // Timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const spawnFruit = () => {
    const isBomb = Math.random() < 0.2;
    const newFruit = {
      id: Date.now() + Math.random(),
      emoji: isBomb ? BOMBS[0] : FRUITS[Math.floor(Math.random() * FRUITS.length)],
      isBomb,
      left: Math.random() * 80 + 10,
      bottom: -10
    };

    setFruits(prev => [...prev, newFruit]);

    setTimeout(() => {
      setFruits(prev => prev.filter(f => f.id !== newFruit.id));
      if (!isBomb && isPlaying) {
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            endGame();
            return 0;
          }
          return newLives;
        });
      }
    }, 3000);
  };

  const endGame = () => {
    setIsPlaying(false);
    clearInterval(timerRef.current);
    clearInterval(spawnRef.current);
    setFruits([]);

    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('fruitninjaHighScore', score.toString());
    }
  };

  const sliceFruit = (fruit) => {
    if (!isPlaying) return;

    setFruits(prev => prev.filter(f => f.id !== fruit.id));

    if (fruit.isBomb) {
      endGame();
    } else {
      setScore(prev => prev + 10);
    }
  };

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearInterval(spawnRef.current);
    };
  }, []);

  return (
    <GameLayout gameId="fruitninja">
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
              Lives: <span className="text-red-600">{'❤️'.repeat(lives)}</span>
            </div>
            <div className="text-lg font-semibold text-gray-700">
              {t.highScore}: <span className="text-purple-600">{highScore}</span>
            </div>
          </div>

          <div className="relative h-96 bg-gradient-to-b from-sky-100 to-sky-200 rounded-lg overflow-hidden mb-6 border-4 border-gray-300">
            {fruits.map(fruit => (
              <button
                key={fruit.id}
                onClick={() => sliceFruit(fruit)}
                className="absolute text-6xl animate-bounce cursor-pointer hover:scale-125 transition-transform"
                style={{
                  left: `${fruit.left}%`,
                  bottom: `${fruit.bottom}%`,
                  animation: 'rise 3s linear'
                }}
              >
                {fruit.emoji}
              </button>
            ))}
            {!isPlaying && fruits.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-2xl font-bold">
                Click Start to Play!
              </div>
            )}
          </div>

          <div className="flex justify-center">
            {!isPlaying ? (
              <button
                onClick={startGame}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                {timeLeft === 0 || lives === 0 ? t.restart : t.start}
              </button>
            ) : (
              <div className="text-xl font-bold text-blue-600">
                Slice the fruits! Avoid bombs!
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">{t.controls}</h3>
            <p className="text-gray-600">{t.games.fruitninja.controls}</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes rise {
          from {
            bottom: -10%;
          }
          to {
            bottom: 110%;
          }
        }
      `}</style>
    </GameLayout>
  );
}
