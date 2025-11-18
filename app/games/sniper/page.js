'use client';

import { useState, useEffect, useRef } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

export default function SniperGame() {
  const { t } = useLanguage();
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [targets, setTargets] = useState([]);
  const [crosshair, setCrosshair] = useState({ x: 50, y: 50 });
  const [isZoomed, setIsZoomed] = useState(false);
  const gameRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('sniperHighScore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(true);
    setTargets([]);
    setIsZoomed(false);
    spawnTarget();
  };

  const spawnTarget = () => {
    const newTarget = {
      id: Date.now(),
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      size: Math.random() * 30 + 40 // 40-70px
    };
    setTargets(prev => [...prev, newTarget]);

    setTimeout(() => {
      setTargets(prev => prev.filter(t => t.id !== newTarget.id));
    }, 2000);
  };

  const endGame = () => {
    setIsPlaying(false);
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('sniperHighScore', score.toString());
    }
  };

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const spawner = setInterval(() => {
      spawnTarget();
    }, 1500);

    return () => {
      clearInterval(timer);
      clearInterval(spawner);
    };
  }, [isPlaying]);

  const handleMouseMove = (e) => {
    if (!gameRef.current) return;
    const rect = gameRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCrosshair({ x, y });
  };

  const handleClick = (e) => {
    if (!isPlaying) return;

    e.preventDefault();

    // Check if any target was hit
    const hitTargets = targets.filter(target => {
      const dx = target.x - crosshair.x;
      const dy = target.y - crosshair.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < (target.size / 20); // Convert size to percentage
    });

    if (hitTargets.length > 0) {
      hitTargets.forEach(target => {
        const points = Math.round((100 - target.size) / 5); // Smaller targets = more points
        setScore(s => s + points);
        setTargets(prev => prev.filter(t => t.id !== target.id));
      });
    }
  };

  const handleRightClick = (e) => {
    e.preventDefault();
    setIsZoomed(!isZoomed);
  };

  return (
    <GameLayout gameId="sniper">
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
              {t.highScore}: <span className="text-purple-600">{highScore}</span>
            </div>
          </div>

          <div
            ref={gameRef}
            onMouseMove={handleMouseMove}
            onClick={handleClick}
            onContextMenu={handleRightClick}
            className={`relative h-96 bg-gradient-to-br from-sky-200 to-green-300 rounded-lg overflow-hidden mb-6 border-4 border-gray-300 cursor-none transition-transform ${
              isZoomed ? 'scale-150' : 'scale-100'
            }`}
          >
            {/* Targets */}
            {targets.map(target => (
              <div
                key={target.id}
                className="absolute transition-all"
                style={{
                  left: `${target.x}%`,
                  top: `${target.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div
                  className="relative"
                  style={{
                    width: `${target.size}px`,
                    height: `${target.size}px`
                  }}
                >
                  <div className="absolute inset-0 rounded-full bg-red-500"></div>
                  <div className="absolute inset-2 rounded-full bg-white"></div>
                  <div className="absolute inset-4 rounded-full bg-red-500"></div>
                  <div className="absolute inset-6 rounded-full bg-white"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-red-600"></div>
                  </div>
                </div>
              </div>
            ))}

            {/* Crosshair */}
            {isPlaying && (
              <div
                className="absolute pointer-events-none"
                style={{
                  left: `${crosshair.x}%`,
                  top: `${crosshair.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <svg width="40" height="40" className="text-red-600">
                  <circle cx="20" cy="20" r="15" stroke="currentColor" strokeWidth="2" fill="none" />
                  <line x1="20" y1="0" x2="20" y2="10" stroke="currentColor" strokeWidth="2" />
                  <line x1="20" y1="30" x2="20" y2="40" stroke="currentColor" strokeWidth="2" />
                  <line x1="0" y1="20" x2="10" y2="20" stroke="currentColor" strokeWidth="2" />
                  <line x1="30" y1="20" x2="40" y2="20" stroke="currentColor" strokeWidth="2" />
                  <circle cx="20" cy="20" r="2" fill="currentColor" />
                </svg>
              </div>
            )}

            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-700 text-2xl font-bold bg-white bg-opacity-50">
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
                {score > 0 ? t.restart : t.start}
              </button>
            ) : (
              <div className="text-xl font-bold text-blue-600">
                Shoot the targets! Right-click to zoom!
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">{t.controls}</h3>
            <p className="text-gray-600">{t.games.sniper.controls}</p>
            <p className="text-gray-600 mt-2">Tip: Smaller targets give more points!</p>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
