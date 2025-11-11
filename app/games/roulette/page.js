'use client';

import { useState, useRef, useEffect } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const NUMBERS = [
  { num: 0, color: 'green' },
  { num: 32, color: 'red' }, { num: 15, color: 'black' }, { num: 19, color: 'red' },
  { num: 4, color: 'black' }, { num: 21, color: 'red' }, { num: 2, color: 'black' },
  { num: 25, color: 'red' }, { num: 17, color: 'black' }, { num: 34, color: 'red' },
  { num: 6, color: 'black' }, { num: 27, color: 'red' }, { num: 13, color: 'black' },
  { num: 36, color: 'red' }, { num: 11, color: 'black' }, { num: 30, color: 'red' },
  { num: 8, color: 'black' }, { num: 23, color: 'red' }, { num: 10, color: 'black' },
  { num: 5, color: 'red' }, { num: 24, color: 'black' }, { num: 16, color: 'red' },
  { num: 33, color: 'black' }, { num: 1, color: 'red' }, { num: 20, color: 'black' },
  { num: 14, color: 'red' }, { num: 31, color: 'black' }, { num: 9, color: 'red' },
  { num: 22, color: 'black' }, { num: 18, color: 'red' }, { num: 29, color: 'black' },
  { num: 7, color: 'red' }, { num: 28, color: 'black' }, { num: 12, color: 'red' },
  { num: 35, color: 'black' }, { num: 3, color: 'red' }, { num: 26, color: 'black' },
];

const INITIAL_CHIPS = 1000;
const BET_AMOUNTS = [10, 25, 50, 100];

export default function RouletteGame() {
  const { t } = useLanguage();
  const canvasRef = useRef(null);
  const [chips, setChips] = useState(INITIAL_CHIPS);
  const [currentBet, setCurrentBet] = useState(10);
  const [bets, setBets] = useState({});
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);

  const getTotalBets = () => {
    return Object.values(bets).reduce((sum, amount) => sum + amount, 0);
  };

  const placeBet = (betType, betValue) => {
    if (spinning || chips < currentBet) return;

    const betKey = `${betType}-${betValue}`;
    setBets(prev => ({
      ...prev,
      [betKey]: (prev[betKey] || 0) + currentBet,
    }));
    setChips(c => c - currentBet);
  };

  const clearBets = () => {
    const totalBets = getTotalBets();
    setChips(c => c + totalBets);
    setBets({});
  };

  const spin = () => {
    if (spinning || getTotalBets() === 0) return;

    setSpinning(true);
    setMessage('');
    setResult(null);

    const randomIndex = Math.floor(Math.random() * NUMBERS.length);
    const winningNumber = NUMBERS[randomIndex];

    // Animate wheel
    const spins = 5;
    const finalRotation = spins * 360 + (randomIndex / NUMBERS.length) * 360;

    let currentRotation = 0;
    const animationDuration = 3000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);

      // Ease out
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      currentRotation = easeProgress * finalRotation;

      setWheelRotation(currentRotation);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Calculate winnings
        let totalWin = 0;

        Object.entries(bets).forEach(([betKey, amount]) => {
          const [type, value] = betKey.split('-');

          if (type === 'number' && parseInt(value) === winningNumber.num) {
            totalWin += amount * 36;
          } else if (type === 'color' && value === winningNumber.color) {
            totalWin += amount * 2;
          } else if (type === 'even' && winningNumber.num !== 0 && winningNumber.num % 2 === 0) {
            totalWin += amount * 2;
          } else if (type === 'odd' && winningNumber.num % 2 === 1) {
            totalWin += amount * 2;
          } else if (type === 'low' && winningNumber.num >= 1 && winningNumber.num <= 18) {
            totalWin += amount * 2;
          } else if (type === 'high' && winningNumber.num >= 19 && winningNumber.num <= 36) {
            totalWin += amount * 2;
          }
        });

        setChips(c => c + totalWin);
        setResult(winningNumber);
        setBets({});

        if (totalWin > 0) {
          setMessage(`You won ${totalWin} chips!`);
        } else {
          setMessage('Better luck next time!');
        }

        setSpinning(false);
      }
    };

    animate();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = 200;
    const centerY = 200;
    const radius = 180;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 400, 400);

    // Save context
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((wheelRotation * Math.PI) / 180);

    // Draw wheel segments
    const segmentAngle = (2 * Math.PI) / NUMBERS.length;

    NUMBERS.forEach((item, index) => {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, index * segmentAngle, (index + 1) * segmentAngle);
      ctx.closePath();

      ctx.fillStyle = item.color === 'red' ? '#e63946' : item.color === 'black' ? '#2b2d42' : '#06a77d';
      ctx.fill();

      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw number
      ctx.save();
      ctx.rotate(index * segmentAngle + segmentAngle / 2);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px Arial';
      ctx.fillText(item.num.toString(), radius * 0.75, 5);
      ctx.restore();
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffd700';
    ctx.fill();

    ctx.restore();

    // Draw pointer
    ctx.beginPath();
    ctx.moveTo(centerX, 10);
    ctx.lineTo(centerX - 15, 40);
    ctx.lineTo(centerX + 15, 40);
    ctx.closePath();
    ctx.fillStyle = '#ffd700';
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [wheelRotation]);

  const startGame = () => {
    setGameStarted(true);
    setChips(INITIAL_CHIPS);
    setBets({});
    setResult(null);
    setMessage('');
    setSpinning(false);
  };

  return (
    <GameLayout gameId="roulette">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-gradient-to-b from-green-800 to-green-900 rounded-lg shadow-2xl p-8 relative">
          <div className="flex justify-between items-center mb-4">
            <div className="text-yellow-400 text-xl font-bold">
              Chips: {chips}
            </div>
            <div className="text-white text-xl font-bold">
              Total Bet: {getTotalBets()}
            </div>
          </div>

          {/* Wheel */}
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="mb-4 rounded-lg"
          />

          {/* Result Display */}
          {result && (
            <div className="text-center mb-4">
              <div className={`text-4xl font-bold ${
                result.color === 'red' ? 'text-red-500' :
                result.color === 'black' ? 'text-gray-800' :
                'text-green-500'
              }`}>
                {result.num}
              </div>
              <div className="text-white text-lg">{message}</div>
            </div>
          )}

          {/* Bet Selection */}
          <div className="mb-4">
            <div className="text-white text-sm mb-2">Chip Value:</div>
            <div className="flex gap-2">
              {BET_AMOUNTS.map(amount => (
                <button
                  key={amount}
                  onClick={() => setCurrentBet(amount)}
                  disabled={spinning}
                  className={`
                    px-4 py-2 rounded-full font-bold
                    ${currentBet === amount
                      ? 'bg-yellow-500 text-black'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                    }
                  `}
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>

          {/* Betting Grid */}
          <div className="bg-green-700 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-3 gap-2 mb-2">
              <button
                onClick={() => placeBet('color', 'red')}
                disabled={spinning}
                className="px-4 py-3 bg-red-600 text-white rounded font-bold hover:bg-red-700"
              >
                Red
                {bets['color-red'] && <div className="text-xs">({bets['color-red']})</div>}
              </button>
              <button
                onClick={() => placeBet('color', 'black')}
                disabled={spinning}
                className="px-4 py-3 bg-gray-800 text-white rounded font-bold hover:bg-gray-900"
              >
                Black
                {bets['color-black'] && <div className="text-xs">({bets['color-black']})</div>}
              </button>
              <button
                onClick={() => placeBet('color', 'green')}
                disabled={spinning}
                className="px-4 py-3 bg-green-600 text-white rounded font-bold hover:bg-green-700"
              >
                0
                {bets['color-green'] && <div className="text-xs">({bets['color-green']})</div>}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                onClick={() => placeBet('even', 'even')}
                disabled={spinning}
                className="px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700"
              >
                Even
                {bets['even-even'] && <div className="text-xs">({bets['even-even']})</div>}
              </button>
              <button
                onClick={() => placeBet('odd', 'odd')}
                disabled={spinning}
                className="px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700"
              >
                Odd
                {bets['odd-odd'] && <div className="text-xs">({bets['odd-odd']})</div>}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => placeBet('low', 'low')}
                disabled={spinning}
                className="px-4 py-2 bg-purple-600 text-white rounded font-bold hover:bg-purple-700"
              >
                1-18
                {bets['low-low'] && <div className="text-xs">({bets['low-low']})</div>}
              </button>
              <button
                onClick={() => placeBet('high', 'high')}
                disabled={spinning}
                className="px-4 py-2 bg-purple-600 text-white rounded font-bold hover:bg-purple-700"
              >
                19-36
                {bets['high-high'] && <div className="text-xs">({bets['high-high']})</div>}
              </button>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={spin}
              disabled={spinning || getTotalBets() === 0}
              className={`
                px-8 py-4 rounded-lg text-xl font-bold
                ${spinning || getTotalBets() === 0
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-b from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500'
                }
                text-black
              `}
            >
              {spinning ? 'SPINNING...' : 'SPIN'}
            </button>

            <button
              onClick={clearBets}
              disabled={spinning || getTotalBets() === 0}
              className="px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold disabled:bg-gray-500"
            >
              Clear Bets
            </button>
          </div>

          {chips === 0 && !spinning && (
            <div className="text-center mt-4">
              <div className="text-white text-lg mb-2">Out of chips!</div>
              <button
                onClick={startGame}
                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg font-bold"
              >
                New Game
              </button>
            </div>
          )}

          {!gameStarted && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 rounded-lg">
              <button
                onClick={startGame}
                className="px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg text-xl font-bold"
              >
                {t.start}
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
          <h3 className="font-bold text-lg mb-2">Payouts</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Single Number: 36:1</p>
            <p>• Red/Black: 2:1</p>
            <p>• Even/Odd: 2:1</p>
            <p>• 1-18/19-36: 2:1</p>
            <p className="mt-3">• {t.games.roulette.description}</p>
            <p>• Starting chips: {INITIAL_CHIPS}</p>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
