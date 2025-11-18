'use client';

import { useState, useEffect, useRef } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

export default function HelixJumpGame() {
  const { t } = useLanguage();
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [ballPos, setBallPos] = useState({ y: 10, velocity: 0 });
  const [rotation, setRotation] = useState(0);
  const [platforms, setPlatforms] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouseX, setLastMouseX] = useState(0);
  const animationRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('helixHighScore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const createPlatforms = () => {
    const newPlatforms = [];
    for (let i = 0; i < 10; i++) {
      const gapStart = Math.random() * 270; // Random gap position
      const isDanger = i > 0 && Math.random() < 0.3; // 30% chance of danger platform
      newPlatforms.push({
        id: i,
        y: i * 10,
        gapStart,
        gapSize: 90,
        isDanger
      });
    }
    return newPlatforms;
  };

  const startGame = () => {
    setScore(0);
    setIsPlaying(true);
    setBallPos({ y: 10, velocity: 0 });
    setRotation(0);
    setPlatforms(createPlatforms());
  };

  const endGame = () => {
    setIsPlaying(false);
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('helixHighScore', score.toString());
    }
  };

  const handleMouseDown = (e) => {
    if (!isPlaying) return;
    setIsDragging(true);
    setLastMouseX(e.clientX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const delta = e.clientX - lastMouseX;
    setRotation(prev => prev + delta * 0.5);
    setLastMouseX(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (!isPlaying) return;

    const gameLoop = () => {
      setBallPos(prev => {
        let newVelocity = prev.velocity + 0.5; // gravity
        let newY = prev.y + newVelocity;

        // Check platform collisions
        const currentPlatformIndex = Math.floor(newY / 10);
        const platform = platforms[currentPlatformIndex];

        if (platform && newY >= platform.y && newY <= platform.y + 2) {
          // Normalize rotation to 0-360
          const normalizedRotation = ((rotation % 360) + 360) % 360;

          // Check if ball is in the gap
          const gapEnd = (platform.gapStart + platform.gapSize) % 360;
          let isInGap = false;

          if (platform.gapStart < gapEnd) {
            isInGap = normalizedRotation >= platform.gapStart && normalizedRotation <= gapEnd;
          } else {
            isInGap = normalizedRotation >= platform.gapStart || normalizedRotation <= gapEnd;
          }

          if (isInGap) {
            // Ball falls through
            newVelocity = Math.max(newVelocity, 2);

            // Score points
            if (prev.y < platform.y) {
              setScore(s => s + 1);

              // Check for danger platform
              if (platform.isDanger) {
                endGame();
                return prev;
              }
            }
          } else {
            // Ball bounces
            newY = platform.y - 1;
            newVelocity = -8;
          }
        }

        // Check if reached bottom
        if (newY >= 100) {
          endGame();
          return prev;
        }

        return { y: newY, velocity: newVelocity };
      });

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, rotation, platforms]);

  return (
    <GameLayout gameId="helix">
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
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="relative h-96 bg-gradient-to-b from-purple-200 to-purple-400 rounded-lg overflow-hidden mb-6 border-4 border-gray-300 cursor-grab active:cursor-grabbing flex items-center justify-center"
          >
            {/* Tower view */}
            <div className="relative w-64 h-80">
              {/* Ball */}
              {isPlaying && (
                <div
                  className="absolute left-1/2 w-6 h-6 bg-gradient-to-br from-yellow-300 to-orange-500 rounded-full shadow-lg z-20"
                  style={{
                    top: `${ballPos.y}%`,
                    transform: `translate(-50%, -50%)`
                  }}
                ></div>
              )}

              {/* Platforms */}
              {platforms.map((platform, idx) => {
                const offset = (ballPos.y - platform.y) * 3;
                if (offset < -50 || offset > 150) return null;

                return (
                  <div
                    key={platform.id}
                    className="absolute left-1/2 w-48 h-4 rounded-full"
                    style={{
                      top: `${platform.y + offset}%`,
                      transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                      transformOrigin: 'center',
                      background: platform.isDanger
                        ? 'conic-gradient(from 0deg, red 0deg ' + platform.gapStart + 'deg, transparent ' + platform.gapStart + 'deg ' + (platform.gapStart + platform.gapSize) + 'deg, red ' + (platform.gapStart + platform.gapSize) + 'deg 360deg)'
                        : 'conic-gradient(from 0deg, #3b82f6 0deg ' + platform.gapStart + 'deg, transparent ' + platform.gapStart + 'deg ' + (platform.gapStart + platform.gapSize) + 'deg, #3b82f6 ' + (platform.gapStart + platform.gapSize) + 'deg 360deg)',
                      opacity: 1 - Math.abs(offset) / 100
                    }}
                  ></div>
                );
              })}

              {/* Center pole */}
              <div className="absolute left-1/2 top-0 w-2 h-full bg-gray-400 transform -translate-x-1/2 z-10"></div>
            </div>

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
                Drag to rotate the tower!
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">{t.controls}</h3>
            <p className="text-gray-600">{t.games.helix.controls}</p>
            <p className="text-gray-600 mt-2">Tip: Avoid red platforms!</p>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
