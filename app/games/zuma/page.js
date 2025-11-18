'use client';

import { useState, useEffect, useRef } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const COLORS = ['🔴', '🟢', '🔵', '🟡', '🟣'];

export default function ZumaGame() {
  const { t } = useLanguage();
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [balls, setBalls] = useState([]);
  const [shooterBall, setShooterBall] = useState(COLORS[0]);
  const [nextBall, setNextBall] = useState(COLORS[1]);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const gameRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('zumaHighScore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const startGame = () => {
    setScore(0);
    setIsPlaying(true);
    const initialBalls = [];
    for (let i = 0; i < 15; i++) {
      initialBalls.push({
        id: i,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        position: i * 5
      });
    }
    setBalls(initialBalls);
    setShooterBall(COLORS[Math.floor(Math.random() * COLORS.length)]);
    setNextBall(COLORS[Math.floor(Math.random() * COLORS.length)]);
  };

  const endGame = () => {
    setIsPlaying(false);
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('zumaHighScore', score.toString());
    }
  };

  const handleMouseMove = (e) => {
    if (!gameRef.current) return;
    const rect = gameRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  const handleClick = () => {
    if (!isPlaying) return;

    // Simple matching logic - find closest ball and check for matches
    const closestBallIndex = balls.findIndex((_, idx) => idx === Math.floor(balls.length / 2));

    if (closestBallIndex !== -1) {
      const newBalls = [...balls];
      newBalls.splice(closestBallIndex + 1, 0, {
        id: Date.now(),
        color: shooterBall,
        position: newBalls[closestBallIndex]?.position + 2.5 || 0
      });

      // Check for matches
      let matches = 0;
      for (let i = 0; i < newBalls.length - 2; i++) {
        if (newBalls[i].color === newBalls[i + 1]?.color &&
            newBalls[i].color === newBalls[i + 2]?.color) {
          newBalls.splice(i, 3);
          matches += 3;
          setScore(s => s + matches * 10);
          break;
        }
      }

      // Update positions
      newBalls.forEach((ball, idx) => {
        ball.position = idx * 5;
      });

      setBalls(newBalls);

      if (newBalls.length === 0) {
        setScore(s => s + 100);
        setTimeout(startGame, 1000);
      }
    }

    setShooterBall(nextBall);
    setNextBall(COLORS[Math.floor(Math.random() * COLORS.length)]);
  };

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setBalls(prev => {
        const updated = prev.map(ball => ({
          ...ball,
          position: ball.position + 0.5
        }));

        if (updated.some(ball => ball.position > 95)) {
          endGame();
        }

        return updated;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const angle = Math.atan2(mousePos.y - 85, mousePos.x - 50) * 180 / Math.PI;

  return (
    <GameLayout gameId="zuma">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <div className="text-lg font-semibold text-gray-700">
              {t.score}: <span className="text-blue-600">{score}</span>
            </div>
            <div className="text-lg font-semibold text-gray-700">
              {t.highScore}: <span className="text-purple-600">{highScore}</span>
            </div>
          </div>

          <div
            ref={gameRef}
            onMouseMove={handleMouseMove}
            onClick={handleClick}
            className="relative h-96 bg-gradient-to-br from-green-100 to-green-200 rounded-lg overflow-hidden mb-6 border-4 border-gray-300 cursor-crosshair"
          >
            {/* Path line */}
            <div className="absolute top-1/2 left-0 right-0 h-12 bg-yellow-200 opacity-50 rounded-full transform -translate-y-1/2"></div>

            {/* Balls on path */}
            {balls.map(ball => (
              <div
                key={ball.id}
                className="absolute text-4xl transition-all"
                style={{
                  left: `${ball.position}%`,
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              >
                {ball.color}
              </div>
            ))}

            {/* Shooter */}
            {isPlaying && (
              <div
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
              >
                <div
                  className="relative"
                  style={{
                    transform: `rotate(${angle}deg)`,
                    transformOrigin: 'center'
                  }}
                >
                  <div className="w-1 h-16 bg-gray-600 mx-auto"></div>
                </div>
                <div className="text-5xl absolute bottom-0 left-1/2 transform -translate-x-1/2">
                  {shooterBall}
                </div>
                <div className="text-3xl absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-50">
                  {nextBall}
                </div>
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
                Match 3 or more balls of the same color!
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">{t.controls}</h3>
            <p className="text-gray-600">{t.games.zuma.controls}</p>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
