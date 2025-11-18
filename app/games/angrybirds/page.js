'use client';

import { useState, useEffect, useRef } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AngryBirdsGame() {
  const { t } = useLanguage();
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bird, setBird] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPos, setDragPos] = useState({ x: 15, y: 70 });
  const [targets, setTargets] = useState([]);
  const [birdsLeft, setBirdsLeft] = useState(3);
  const gameRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('angrybirdsHighScore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const startGame = () => {
    setScore(0);
    setIsPlaying(true);
    setBirdsLeft(3);
    setBird(null);
    setTargets([
      { id: 1, x: 70, y: 75, hit: false },
      { id: 2, x: 80, y: 75, hit: false },
      { id: 3, x: 90, y: 75, hit: false },
      { id: 4, x: 75, y: 60, hit: false },
      { id: 5, x: 85, y: 60, hit: false }
    ]);
  };

  const endGame = () => {
    setIsPlaying(false);
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('angrybirdsHighScore', score.toString());
    }
  };

  const handleMouseDown = (e) => {
    if (!isPlaying || bird) return;
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !gameRef.current) return;

    const rect = gameRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Limit drag distance
    const dx = x - 15;
    const dy = y - 70;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDrag = 15;

    if (distance > maxDrag) {
      const angle = Math.atan2(dy, dx);
      setDragPos({
        x: 15 + Math.cos(angle) * maxDrag,
        y: 70 + Math.sin(angle) * maxDrag
      });
    } else {
      setDragPos({ x, y });
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const velocityX = (15 - dragPos.x) * 0.8;
    const velocityY = (70 - dragPos.y) * 0.8;

    setBird({
      x: 15,
      y: 70,
      vx: velocityX,
      vy: velocityY
    });

    setBirdsLeft(prev => prev - 1);
  };

  useEffect(() => {
    if (!bird) return;

    const gameLoop = () => {
      setBird(prev => {
        if (!prev) return null;

        const newBird = {
          ...prev,
          x: prev.x + prev.vx,
          y: prev.y + prev.vy,
          vy: prev.vy + 0.3 // gravity
        };

        // Check if bird is out of bounds
        if (newBird.y > 100 || newBird.x > 100 || newBird.x < 0) {
          if (birdsLeft === 0) {
            const allHit = targets.every(t => t.hit);
            if (allHit) {
              setScore(s => s + 100);
            }
            setTimeout(endGame, 500);
          }
          return null;
        }

        // Check collisions with targets
        setTargets(prevTargets => {
          return prevTargets.map(target => {
            if (target.hit) return target;

            const dx = target.x - newBird.x;
            const dy = target.y - newBird.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 5) {
              setScore(s => s + 20);
              return { ...target, hit: true };
            }
            return target;
          });
        });

        return newBird;
      });

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [bird, birdsLeft, targets]);

  return (
    <GameLayout gameId="angrybirds">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <div className="text-lg font-semibold text-gray-700">
              {t.score}: <span className="text-blue-600">{score}</span>
            </div>
            <div className="text-lg font-semibold text-gray-700">
              Birds: <span className="text-red-600">{'🐦'.repeat(birdsLeft)}</span>
            </div>
            <div className="text-lg font-semibold text-gray-700">
              {t.highScore}: <span className="text-purple-600">{highScore}</span>
            </div>
          </div>

          <div
            ref={gameRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => setIsDragging(false)}
            className="relative h-96 bg-gradient-to-b from-sky-300 to-green-200 rounded-lg overflow-hidden mb-6 border-4 border-gray-300 cursor-crosshair"
          >
            {/* Ground */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-green-600"></div>

            {/* Slingshot */}
            <div
              className="absolute w-2 h-20 bg-brown-600 bg-gradient-to-b from-yellow-800 to-yellow-900"
              style={{ left: '15%', bottom: '16%' }}
            ></div>

            {/* Drag line */}
            {isDragging && (
              <>
                <line
                  x1="15%"
                  y1="70%"
                  x2={`${dragPos.x}%`}
                  y2={`${dragPos.y}%`}
                  className="absolute"
                />
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <line
                    x1="15%"
                    y1="70%"
                    x2={`${dragPos.x}%`}
                    y2={`${dragPos.y}%`}
                    stroke="brown"
                    strokeWidth="2"
                  />
                </svg>
              </>
            )}

            {/* Bird on slingshot */}
            {!bird && isPlaying && (
              <div
                className="absolute text-4xl"
                style={{
                  left: isDragging ? `${dragPos.x}%` : '15%',
                  top: isDragging ? `${dragPos.y}%` : '70%',
                  transform: 'translate(-50%, -50%)'
                }}
              >
                🐦
              </div>
            )}

            {/* Flying bird */}
            {bird && (
              <div
                className="absolute text-4xl transition-all"
                style={{
                  left: `${bird.x}%`,
                  top: `${bird.y}%`,
                  transform: `translate(-50%, -50%) rotate(${Math.atan2(bird.vy, bird.vx) * 180 / Math.PI}deg)`
                }}
              >
                🐦
              </div>
            )}

            {/* Targets (pigs) */}
            {targets.map(target => (
              !target.hit && (
                <div
                  key={target.id}
                  className="absolute text-4xl"
                  style={{
                    left: `${target.x}%`,
                    top: `${target.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  🐷
                </div>
              )
            ))}

            {/* Structures */}
            <div
              className="absolute w-12 h-20 bg-yellow-700 opacity-70"
              style={{ left: '68%', bottom: '16%' }}
            ></div>
            <div
              className="absolute w-12 h-20 bg-yellow-700 opacity-70"
              style={{ left: '82%', bottom: '16%' }}
            ></div>
            <div
              className="absolute w-20 h-3 bg-yellow-700 opacity-70"
              style={{ left: '70%', bottom: '35%' }}
            ></div>

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
                Drag and release to launch the bird!
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">{t.controls}</h3>
            <p className="text-gray-600">{t.games.angrybirds.controls}</p>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
