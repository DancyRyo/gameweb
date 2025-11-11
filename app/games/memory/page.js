'use client';

import { useState, useEffect } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const EMOJIS = ['🎮', '🎯', '🎲', '🎨', '🎭', '🎪', '🎸', '🎹'];
const CARDS = [...EMOJIS, ...EMOJIS];

export default function MemoryGame() {
  const { t } = useLanguage();
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const shuffleCards = () => {
    const shuffled = [...CARDS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({ id: index, emoji }));
    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setGameStarted(true);
  };

  useEffect(() => {
    shuffleCards();
  }, []);

  useEffect(() => {
    if (flipped.length === 2) {
      setIsChecking(true);
      const [first, second] = flipped;

      if (cards[first].emoji === cards[second].emoji) {
        setMatched([...matched, first, second]);
        setFlipped([]);
        setIsChecking(false);
      } else {
        setTimeout(() => {
          setFlipped([]);
          setIsChecking(false);
        }, 1000);
      }
      setMoves(moves + 1);
    }
  }, [flipped]);

  const handleClick = (index) => {
    if (
      flipped.length === 2 ||
      flipped.includes(index) ||
      matched.includes(index) ||
      isChecking
    ) {
      return;
    }
    setFlipped([...flipped, index]);
  };

  const isWon = matched.length === cards.length && cards.length > 0;

  return (
    <GameLayout gameId="memory">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl">
          <div className="flex justify-between items-center mb-6">
            <div className="text-lg font-semibold text-gray-700">
              {t.language === 'en' ? 'Moves' : '移动次数'}: <span className="text-blue-600">{moves}</span>
            </div>
            {isWon && (
              <div className="text-xl font-bold text-green-600">
                {t.youWin}
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 gap-3 mb-6">
            {cards.map((card, index) => (
              <button
                key={card.id}
                onClick={() => handleClick(index)}
                className={`h-24 rounded-lg text-4xl font-bold transition-all transform ${
                  flipped.includes(index) || matched.includes(index)
                    ? 'bg-white border-2 border-blue-400'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {(flipped.includes(index) || matched.includes(index)) && card.emoji}
              </button>
            ))}
          </div>

          <div className="flex justify-center">
            <button
              onClick={shuffleCards}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              {t.restart}
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">{t.controls}</h3>
            <p className="text-gray-600">{t.games.memory.controls}</p>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
