'use client';

import { useState, useEffect, useRef } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const GRID_SIZE = 9;

const DIFFICULTY_SETTINGS = {
  easy: { spawnInterval: 1000, gameTime: 40, moleStayTime: 1200 },
  medium: { spawnInterval: 800, gameTime: 30, moleStayTime: 1000 },
  hard: { spawnInterval: 500, gameTime: 25, moleStayTime: 700 }
};

export default function WhackAMoleGame() {
  const { t } = useLanguage();
  const [moles, setMoles] = useState(Array(GRID_SIZE).fill(false));
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [difficulty, setDifficulty] = useState('medium');
  const [timeLeft, setTimeLeft] = useState(DIFFICULTY_SETTINGS.medium.gameTime);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef(null);
  const timerRef = useRef(null);
  const moleTimeoutRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('whackamoleHighScore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const startGame = () => {
    const settings = DIFFICULTY_SETTINGS[difficulty];
    setScore(0);
    setTimeLeft(settings.gameTime);
    setIsPlaying(true);
    setMoles(Array(GRID_SIZE).fill(false));

    // Mole spawning
    intervalRef.current = setInterval(() => {
      const index = Math.floor(Math.random() * GRID_SIZE);
      setMoles(prev => {
        const newMoles = Array(GRID_SIZE).fill(false);
        newMoles[index] = true;
        return newMoles;
      });

      // Auto-hide mole after some time
      clearTimeout(moleTimeoutRef.current);
      moleTimeoutRef.current = setTimeout(() => {
        setMoles(Array(GRID_SIZE).fill(false));
      }, settings.moleStayTime);
    }, settings.spawnInterval);

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

  const endGame = () => {
    setIsPlaying(false);
    clearInterval(intervalRef.current);
    clearInterval(timerRef.current);
    clearTimeout(moleTimeoutRef.current);
    setMoles(Array(GRID_SIZE).fill(false));

    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('whackamoleHighScore', score.toString());
    }
  };

  const whackMole = (index) => {
    if (!isPlaying || !moles[index]) return;

    setScore(prev => prev + 10);
    setMoles(prev => {
      const newMoles = [...prev];
      newMoles[index] = false;
      return newMoles;
    });
  };

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      clearInterval(timerRef.current);
      clearTimeout(moleTimeoutRef.current);
    };
  }, []);

  return (
    <GameLayout gameId="whackamole">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="text-lg font-semibold text-gray-700">
              {t.score}: <span className="text-blue-600">{score}</span>
            </div>
            <div className="text-lg font-semibold text-gray-700">
              {t.difficulty}:
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                disabled={isPlaying}
                className="ml-2 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="easy">{t.easy}</option>
                <option value="medium">{t.medium}</option>
                <option value="hard">{t.hard}</option>
              </select>
            </div>
            <div className="text-lg font-semibold text-gray-700">
              {t.time}: <span className="text-green-600">{timeLeft}s</span>
            </div>
            <div className="text-lg font-semibold text-gray-700">
              {t.highScore}: <span className="text-purple-600">{highScore}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {moles.map((hasMole, index) => (
              <button
                key={index}
                onClick={() => whackMole(index)}
                className={`h-24 rounded-lg text-5xl transition-all ${
                  hasMole
                    ? 'bg-red-400 hover:bg-red-500 scale-110'
                    : 'bg-green-200'
                }`}
              >
                {hasMole ? '🐹' : '⚫'}
              </button>
            ))}
          </div>

          <div className="flex justify-center">
            {!isPlaying ? (
              <button
                onClick={startGame}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                {timeLeft === 0 ? t.restart : t.start}
              </button>
            ) : (
              <div className="text-xl font-bold text-blue-600">
                {t.language === 'en' ? 'Playing...' : '游戏中...'}
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">{t.controls}</h3>
            <p className="text-gray-600">{t.games.whackamole.controls}</p>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
