'use client';

import { useState, useEffect, useRef } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const SYMBOLS = ['🍒', '🍋', '🍊', '🍉', '⭐', '💎', '7️⃣'];
const REEL_COUNT = 3;
const SPIN_DURATION = 2000;
const INITIAL_CREDITS = 100;
const BET_AMOUNT = 10;

const PAYOUTS = {
  '💎💎💎': 100,
  '7️⃣7️⃣7️⃣': 50,
  '⭐⭐⭐': 30,
  '🍉🍉🍉': 20,
  '🍊🍊🍊': 15,
  '🍋🍋🍋': 10,
  '🍒🍒🍒': 5,
};

export default function SlotMachineGame() {
  const { t } = useLanguage();
  const [reels, setReels] = useState([
    SYMBOLS[0],
    SYMBOLS[0],
    SYMBOLS[0],
  ]);
  const [spinning, setSpinning] = useState(false);
  const [credits, setCredits] = useState(INITIAL_CREDITS);
  const [lastWin, setLastWin] = useState(0);
  const [message, setMessage] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const spinningReels = useRef([]);

  const getRandomSymbol = () => {
    return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
  };

  const checkWin = (finalReels) => {
    const combination = finalReels.join('');

    for (const [pattern, payout] of Object.entries(PAYOUTS)) {
      if (combination === pattern) {
        return payout * BET_AMOUNT / 10;
      }
    }

    // Check for two matches
    if (finalReels[0] === finalReels[1] ||
        finalReels[1] === finalReels[2] ||
        finalReels[0] === finalReels[2]) {
      return BET_AMOUNT / 2;
    }

    return 0;
  };

  const spin = () => {
    if (spinning || credits < BET_AMOUNT) return;

    setSpinning(true);
    setCredits(c => c - BET_AMOUNT);
    setLastWin(0);
    setMessage('');

    // Start spinning animation for each reel
    spinningReels.current = [
      setInterval(() => setReels(prev => [getRandomSymbol(), prev[1], prev[2]]), 50),
      setInterval(() => setReels(prev => [prev[0], getRandomSymbol(), prev[2]]), 50),
      setInterval(() => setReels(prev => [prev[0], prev[1], getRandomSymbol()]), 50),
    ];

    // Stop reels one by one
    setTimeout(() => {
      clearInterval(spinningReels.current[0]);
      const reel1 = getRandomSymbol();
      setReels(prev => [reel1, prev[1], prev[2]]);
    }, SPIN_DURATION * 0.4);

    setTimeout(() => {
      clearInterval(spinningReels.current[1]);
      const reel2 = getRandomSymbol();
      setReels(prev => [prev[0], reel2, prev[2]]);
    }, SPIN_DURATION * 0.7);

    setTimeout(() => {
      clearInterval(spinningReels.current[2]);
      const reel3 = getRandomSymbol();

      setReels(prev => {
        const finalReels = [prev[0], prev[1], reel3];
        const winAmount = checkWin(finalReels);

        if (winAmount > 0) {
          setCredits(c => c + winAmount);
          setLastWin(winAmount);
          setMessage(`You won ${winAmount} credits!`);
        } else {
          setMessage('Try again!');
        }

        setSpinning(false);
        return finalReels;
      });
    }, SPIN_DURATION);
  };

  const startGame = () => {
    setGameStarted(true);
    setCredits(INITIAL_CREDITS);
    setLastWin(0);
    setMessage('');
    setReels([SYMBOLS[0], SYMBOLS[0], SYMBOLS[0]]);
  };

  useEffect(() => {
    return () => {
      spinningReels.current.forEach(interval => clearInterval(interval));
    };
  }, []);

  return (
    <GameLayout gameId="slotmachine">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-gradient-to-b from-red-600 to-red-800 rounded-lg shadow-2xl p-8 relative">
          {/* Display */}
          <div className="bg-black rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <div className="text-yellow-400 text-xl font-bold">
                Credits: {credits}
              </div>
              <div className="text-green-400 text-xl font-bold">
                Bet: {BET_AMOUNT}
              </div>
            </div>
            {lastWin > 0 && (
              <div className="text-center text-yellow-300 text-2xl font-bold animate-pulse">
                WIN: +{lastWin}
              </div>
            )}
          </div>

          {/* Reels */}
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg p-6 mb-6">
            <div className="flex gap-4 justify-center">
              {reels.map((symbol, index) => (
                <div
                  key={index}
                  className={`
                    w-32 h-32 bg-white rounded-lg shadow-inner
                    flex items-center justify-center text-6xl
                    ${spinning ? 'animate-spin' : ''}
                    border-4 border-yellow-500
                  `}
                >
                  {symbol}
                </div>
              ))}
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className="text-center mb-4">
              <div className={`text-xl font-bold ${lastWin > 0 ? 'text-yellow-300' : 'text-white'}`}>
                {message}
              </div>
            </div>
          )}

          {/* Spin Button */}
          <div className="flex justify-center">
            <button
              onClick={spin}
              disabled={spinning || credits < BET_AMOUNT}
              className={`
                px-12 py-6 rounded-full text-2xl font-bold
                ${spinning || credits < BET_AMOUNT
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-b from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 shadow-lg'
                }
                text-red-900 transition-all transform hover:scale-105
              `}
            >
              {spinning ? 'SPINNING...' : 'SPIN'}
            </button>
          </div>

          {credits < BET_AMOUNT && gameStarted && (
            <div className="text-center mt-4">
              <div className="text-white text-lg mb-2">Out of credits!</div>
              <button
                onClick={startGame}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold"
              >
                New Game
              </button>
            </div>
          )}

          {!gameStarted && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 rounded-lg">
              <button
                onClick={startGame}
                className="px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-red-900 rounded-lg text-xl font-bold"
              >
                {t.start}
              </button>
            </div>
          )}
        </div>

        {/* Paytable */}
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
          <h3 className="font-bold text-lg mb-4 text-center">Paytable</h3>
          <div className="space-y-2 text-sm">
            {Object.entries(PAYOUTS).map(([pattern, payout]) => (
              <div key={pattern} className="flex justify-between items-center border-b pb-2">
                <div className="text-2xl">{pattern}</div>
                <div className="font-bold text-green-600">×{payout / 10}</div>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2">
              <div className="text-sm">Two Match</div>
              <div className="font-bold text-blue-600">×0.5</div>
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-600">
            <p>• {t.games.slotmachine.description}</p>
            <p className="mt-2">• Bet: {BET_AMOUNT} credits per spin</p>
            <p>• Starting credits: {INITIAL_CREDITS}</p>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
