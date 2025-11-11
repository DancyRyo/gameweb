'use client';

import { useState, useEffect, useRef } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const COLORS = [
  { id: 0, color: 'bg-red-500', activeColor: 'bg-red-300' },
  { id: 1, color: 'bg-blue-500', activeColor: 'bg-blue-300' },
  { id: 2, color: 'bg-green-500', activeColor: 'bg-green-300' },
  { id: 3, color: 'bg-yellow-500', activeColor: 'bg-yellow-300' }
];

export default function SimonGame() {
  const { t } = useLanguage();
  const [sequence, setSequence] = useState([]);
  const [userSequence, setUserSequence] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('simonHighScore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const startGame = () => {
    const firstColor = Math.floor(Math.random() * 4);
    setSequence([firstColor]);
    setUserSequence([]);
    setScore(0);
    setIsPlaying(true);
    setGameOver(false);
    setTimeout(() => showSequence([firstColor]), 500);
  };

  const showSequence = async (seq) => {
    setIsShowingSequence(true);
    for (let color of seq) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setActiveButton(color);
      await new Promise(resolve => setTimeout(resolve, 600));
      setActiveButton(null);
    }
    setIsShowingSequence(false);
  };

  const handleColorClick = (colorId) => {
    if (!isPlaying || isShowingSequence) return;

    const newUserSequence = [...userSequence, colorId];
    setUserSequence(newUserSequence);

    // Flash the button
    setActiveButton(colorId);
    setTimeout(() => setActiveButton(null), 300);

    // Check if correct
    if (newUserSequence[newUserSequence.length - 1] !== sequence[newUserSequence.length - 1]) {
      // Wrong!
      setGameOver(true);
      setIsPlaying(false);
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('simonHighScore', score.toString());
      }
      return;
    }

    // Check if sequence complete
    if (newUserSequence.length === sequence.length) {
      // Correct! Add new color
      const newScore = score + 1;
      setScore(newScore);
      setUserSequence([]);

      const nextColor = Math.floor(Math.random() * 4);
      const newSequence = [...sequence, nextColor];
      setSequence(newSequence);

      setTimeout(() => showSequence(newSequence), 1000);
    }
  };

  return (
    <GameLayout gameId="simon">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl">
          <div className="flex justify-between items-center mb-6">
            <div className="text-lg font-semibold text-gray-700">
              {t.level}: <span className="text-blue-600">{score}</span>
            </div>
            <div className="text-lg font-semibold text-gray-700">
              {t.highScore}: <span className="text-purple-600">{highScore}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 w-80 h-80 mx-auto">
            {COLORS.map((btn) => (
              <button
                key={btn.id}
                onClick={() => handleColorClick(btn.id)}
                disabled={!isPlaying || isShowingSequence}
                className={`${
                  activeButton === btn.id ? btn.activeColor : btn.color
                } rounded-lg transition-all hover:opacity-80 disabled:cursor-not-allowed`}
              />
            ))}
          </div>

          {gameOver && (
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-red-600 mb-2">
                {t.gameOver}
              </div>
              <div className="text-gray-600">
                {t.level}: {score}
              </div>
            </div>
          )}

          <div className="flex justify-center">
            {!isPlaying && (
              <button
                onClick={startGame}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                {gameOver ? t.restart : t.start}
              </button>
            )}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">{t.controls}</h3>
            <p className="text-gray-600">{t.games.simon.controls}</p>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
