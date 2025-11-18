'use client';

import { useState, useEffect, useRef } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const DIFFICULTY_SETTINGS = {
  easy: { ballSpeed: 0.3, maxNumber: 3, shootInterval: 300 },
  medium: { ballSpeed: 0.5, maxNumber: 5, shootInterval: 200 },
  hard: { ballSpeed: 0.7, maxNumber: 7, shootInterval: 200 }
};

export default function BallBlastGame() {
  const { t } = useLanguage();
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [cannonX, setCannonX] = useState(50);
  const [balls, setBalls] = useState([]);
  const [bullets, setBullets] = useState([]);
  const [difficulty, setDifficulty] = useState('medium');
  const gameRef = useRef(null);
  const animationRef = useRef(null);
  const shootIntervalRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('ballblastHighScore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const startGame = () => {
    setScore(0);
    setIsPlaying(true);
    setBalls([]);
    setBullets([]);
    setCannonX(50);
    spawnBall();
  };

  const spawnBall = () => {
    const settings = DIFFICULTY_SETTINGS[difficulty];
    const newBall = {
      id: Date.now(),
      x: Math.random() * 80 + 10,
      y: 0,
      number: Math.floor(Math.random() * settings.maxNumber) + 1,
      speed: settings.ballSpeed + Math.random() * 0.2
    };
    setBalls(prev => [...prev, newBall]);
  };

  const endGame = () => {
    setIsPlaying(false);
    clearInterval(shootIntervalRef.current);
    cancelAnimationFrame(animationRef.current);

    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('ballblastHighScore', score.toString());
    }
  };

  const handleMouseMove = (e) => {
    if (!isPlaying) return;
    const rect = gameRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setCannonX(Math.max(5, Math.min(95, x)));
  };

  const startShooting = () => {
    if (!isPlaying) return;
    const settings = DIFFICULTY_SETTINGS[difficulty];
    shootIntervalRef.current = setInterval(() => {
      setBullets(prev => [...prev, {
        id: Date.now() + Math.random(),
        x: cannonX,
        y: 90
      }]);
    }, settings.shootInterval);
  };

  const stopShooting = () => {
    clearInterval(shootIntervalRef.current);
  };

  useEffect(() => {
    if (!isPlaying) return;

    const gameLoop = () => {
      // Move balls down
      setBalls(prev => {
        const updated = prev.map(ball => ({
          ...ball,
          y: ball.y + ball.speed
        })).filter(ball => {
          if (ball.y > 95) {
            endGame();
            return false;
          }
          return ball.number > 0;
        });
        return updated;
      });

      // Move bullets up and check collisions
      setBullets(prev => {
        let newBullets = prev.map(bullet => ({
          ...bullet,
          y: bullet.y - 3
        })).filter(bullet => bullet.y > 0);

        // Check collisions
        newBullets.forEach(bullet => {
          setBalls(prevBalls => {
            return prevBalls.map(ball => {
              const dx = ball.x - bullet.x;
              const dy = ball.y - bullet.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < 8) {
                bullet.y = -10; // Remove bullet
                if (ball.number > 1) {
                  return { ...ball, number: ball.number - 1 };
                } else {
                  setScore(s => s + 1);
                  setTimeout(spawnBall, 500);
                  return null;
                }
              }
              return ball;
            }).filter(Boolean);
          });
        });

        return newBullets.filter(b => b.y > 0);
      });

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationRef.current);
      clearInterval(shootIntervalRef.current);
    };
  }, [isPlaying, cannonX]);

  return (
    <GameLayout gameId="ballblast">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <div className="text-lg font-semibold text-gray-700">
              {t.score}: <span className="text-blue-600">{score}</span>
            </div>
            <div className="text-lg font-semibold text-gray-700">
              {t.difficulty}:
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                disabled={isPlaying}
                className="ml-2 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="easy">{t.easy}</option>
                <option value="medium">{t.medium}</option>
                <option value="hard">{t.hard}</option>
              </select>
            </div>
            <div className="text-lg font-semibold text-gray-700">
              {t.highScore}: <span className="text-purple-600">{highScore}</span>
            </div>
          </div>

          <div
            ref={gameRef}
            onMouseMove={handleMouseMove}
            onMouseDown={startShooting}
            onMouseUp={stopShooting}
            onMouseLeave={stopShooting}
            className="relative h-96 bg-gradient-to-b from-purple-100 to-purple-200 rounded-lg overflow-hidden mb-6 border-4 border-gray-300 cursor-crosshair"
          >
            {/* Balls */}
            {balls.map(ball => (
              <div
                key={ball.id}
                className="absolute flex items-center justify-center text-white font-bold bg-gradient-to-br from-red-500 to-orange-500 rounded-full shadow-lg"
                style={{
                  left: `${ball.x}%`,
                  top: `${ball.y}%`,
                  width: '60px',
                  height: '60px',
                  transform: 'translate(-50%, -50%)'
                }}
              >
                {ball.number}
              </div>
            ))}

            {/* Bullets */}
            {bullets.map(bullet => (
              <div
                key={bullet.id}
                className="absolute w-2 h-3 bg-yellow-400 rounded-full"
                style={{
                  left: `${bullet.x}%`,
                  top: `${bullet.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              />
            ))}

            {/* Cannon */}
            {isPlaying && (
              <div
                className="absolute bottom-0 w-8 h-12 bg-gradient-to-t from-gray-700 to-gray-500 rounded-t-lg"
                style={{
                  left: `${cannonX}%`,
                  transform: 'translateX(-50%)'
                }}
              >
                <div className="w-3 h-6 bg-gray-600 mx-auto rounded-t-full"></div>
              </div>
            )}

            {!isPlaying && (
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
                {score > 0 ? t.restart : t.start}
              </button>
            ) : (
              <div className="text-xl font-bold text-blue-600">
                Move mouse and hold click to shoot!
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">{t.controls}</h3>
            <p className="text-gray-600">{t.games.ballblast.controls}</p>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
