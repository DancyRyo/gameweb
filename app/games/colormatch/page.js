'use client';

import { useState, useEffect, useRef } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const COLORS = [
  { name: 'Red', nameCh: '红色', hex: '#ef4444' },
  { name: 'Blue', nameCh: '蓝色', hex: '#3b82f6' },
  { name: 'Green', nameCh: '绿色', hex: '#22c55e' },
  { name: 'Yellow', nameCh: '黄色', hex: '#eab308' },
  { name: 'Purple', nameCh: '紫色', hex: '#a855f7' },
  { name: 'Orange', nameCh: '橙色', hex: '#f97316' }
];

const GAME_TIME = 30;

export default function ColorMatchGame() {
  const { t, language } = useLanguage();
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentColor, setCurrentColor] = useState(null);
  const [displayedText, setDisplayedText] = useState(null);
  const [textColor, setTextColor] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('colorMatchHighScore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const generateRound = () => {
    const colorForText = COLORS[Math.floor(Math.random() * COLORS.length)];
    const colorForDisplay = COLORS[Math.floor(Math.random() * COLORS.length)];
    setDisplayedText(colorForText);
    setTextColor(colorForDisplay);
    setCurrentColor(colorForDisplay);
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(GAME_TIME);
    setIsPlaying(true);
    generateRound();

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
    clearInterval(timerRef.current);

    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('colorMatchHighScore', score.toString());
    }
  };

  const handleAnswer = (isMatch) => {
    const correct = (displayedText.hex === textColor.hex) === isMatch;
    if (correct) {
      setScore(prev => prev + 10);
      generateRound();
    } else {
      setScore(prev => Math.max(0, prev - 5));
    }
  };

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <GameLayout gameId="colormatch">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl">
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

          {isPlaying && currentColor && displayedText && (
            <div className="mb-8">
              <div className="text-center mb-6">
                <p className="text-gray-600 mb-4">
                  {language === 'en'
                    ? 'Does the text color match the word meaning?'
                    : '文字颜色与文字含义是否匹配？'}
                </p>
                <div
                  className="text-6xl font-bold"
                  style={{ color: textColor.hex }}
                >
                  {language === 'en' ? displayedText.name : displayedText.nameCh}
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => handleAnswer(true)}
                  className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors text-xl"
                >
                  {language === 'en' ? 'Match' : '匹配'}
                </button>
                <button
                  onClick={() => handleAnswer(false)}
                  className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors text-xl"
                >
                  {language === 'en' ? 'No Match' : '不匹配'}
                </button>
              </div>
            </div>
          )}

          {!isPlaying && (
            <div className="flex justify-center mb-6">
              <button
                onClick={startGame}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                {timeLeft === 0 ? t.restart : t.start}
              </button>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">{t.controls}</h3>
            <p className="text-gray-600">{t.games.colormatch.controls}</p>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
