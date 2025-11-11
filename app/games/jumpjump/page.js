'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const PLAYER_SIZE = 30;
const PLATFORM_WIDTH = 80;
const PLATFORM_HEIGHT = 15;
const GRAVITY = 0.5;
const JUMP_POWER = -12;

export default function JumpJumpGame() {
  const { t } = useLanguage();
  const canvasRef = useRef(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [player, setPlayer] = useState({
    x: CANVAS_WIDTH / 2 - PLAYER_SIZE / 2,
    y: CANVAS_HEIGHT - 200,
    velocityY: 0,
    velocityX: 0,
  });
  const [platforms, setPlatforms] = useState([]);
  const [cameraY, setCameraY] = useState(0);
  const [keys, setKeys] = useState({});

  const handleKeyDown = useCallback((e) => {
    if (!gameStarted || gameOver) {
      if (e.key === ' ') {
        if (!gameStarted) {
          startGame();
        }
      }
      return;
    }
    setKeys(prev => ({ ...prev, [e.key]: true }));
  }, [gameStarted, gameOver]);

  const handleKeyUp = useCallback((e) => {
    setKeys(prev => ({ ...prev, [e.key]: false }));
  }, []);

  const handleClick = useCallback(() => {
    if (!gameStarted) {
      startGame();
    } else if (!gameOver) {
      setPlayer(prev => {
        if (prev.velocityY >= 0) {
          return { ...prev, velocityY: JUMP_POWER };
        }
        return prev;
      });
    }
  }, [gameStarted, gameOver]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const generatePlatform = (y) => ({
    id: Math.random(),
    x: Math.random() * (CANVAS_WIDTH - PLATFORM_WIDTH),
    y: y,
    width: PLATFORM_WIDTH,
  });

  const initPlatforms = useCallback(() => {
    const initialPlatforms = [];
    // Starting platform
    initialPlatforms.push({
      id: Math.random(),
      x: CANVAS_WIDTH / 2 - PLATFORM_WIDTH / 2,
      y: CANVAS_HEIGHT - 100,
      width: PLATFORM_WIDTH,
    });

    // Generate more platforms going up
    for (let i = 1; i < 10; i++) {
      initialPlatforms.push(generatePlatform(CANVAS_HEIGHT - 100 - i * 80));
    }

    return initialPlatforms;
  }, []);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameLoop = setInterval(() => {
      setPlayer(prev => {
        let newX = prev.x;
        let newVelocityX = prev.velocityX;

        // Horizontal movement
        if (keys.ArrowLeft) {
          newVelocityX = -5;
        } else if (keys.ArrowRight) {
          newVelocityX = 5;
        } else {
          newVelocityX = 0;
        }

        newX += newVelocityX;

        // Wrap around screen
        if (newX < -PLAYER_SIZE) newX = CANVAS_WIDTH;
        if (newX > CANVAS_WIDTH) newX = -PLAYER_SIZE;

        // Apply gravity
        let newVelocityY = prev.velocityY + GRAVITY;
        let newY = prev.y + newVelocityY;

        // Check platform collisions (only when falling)
        if (newVelocityY > 0) {
          platforms.forEach(platform => {
            if (
              newY + PLAYER_SIZE >= platform.y &&
              prev.y + PLAYER_SIZE <= platform.y &&
              newX + PLAYER_SIZE > platform.x &&
              newX < platform.x + platform.width
            ) {
              newVelocityY = JUMP_POWER;
              newY = platform.y - PLAYER_SIZE;
              setScore(s => s + 1);
            }
          });
        }

        return {
          x: newX,
          y: newY,
          velocityX: newVelocityX,
          velocityY: newVelocityY,
        };
      });

      // Move camera up when player goes up
      setPlayer(prev => {
        if (prev.y < CANVAS_HEIGHT / 2) {
          const offset = CANVAS_HEIGHT / 2 - prev.y;
          setCameraY(cam => cam - offset);
          return { ...prev, y: CANVAS_HEIGHT / 2 };
        }
        return prev;
      });

      // Generate new platforms as camera moves up
      setPlatforms(prev => {
        let newPlatforms = [...prev];

        // Remove platforms that are too far down
        newPlatforms = newPlatforms.filter(p => p.y - cameraY < CANVAS_HEIGHT + 100);

        // Add new platforms at the top
        const highestPlatform = Math.min(...newPlatforms.map(p => p.y));
        if (highestPlatform - cameraY > -200) {
          for (let i = 0; i < 3; i++) {
            newPlatforms.push(generatePlatform(highestPlatform - (i + 1) * 80));
          }
        }

        return newPlatforms;
      });

      // Check if player fell off screen
      if (player.y - cameraY > CANVAS_HEIGHT) {
        setGameOver(true);
      }
    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver, keys, player, platforms, cameraY]);

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw platforms
    ctx.fillStyle = '#8B4513';
    platforms.forEach(platform => {
      const screenY = platform.y - cameraY;
      if (screenY > -50 && screenY < CANVAS_HEIGHT + 50) {
        ctx.fillRect(platform.x, screenY, platform.width, PLATFORM_HEIGHT);
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.strokeRect(platform.x, screenY, platform.width, PLATFORM_HEIGHT);
      }
    });

    // Draw player
    const playerScreenY = player.y - cameraY;
    ctx.fillStyle = '#FF6B6B';
    ctx.beginPath();
    ctx.arc(
      player.x + PLAYER_SIZE / 2,
      playerScreenY + PLAYER_SIZE / 2,
      PLAYER_SIZE / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Player eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(player.x + 10, playerScreenY + 12, 3, 0, Math.PI * 2);
    ctx.arc(player.x + 20, playerScreenY + 12, 3, 0, Math.PI * 2);
    ctx.fill();

    // Player smile
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(player.x + 15, playerScreenY + 15, 8, 0, Math.PI);
    ctx.stroke();
  }, [player, platforms, cameraY]);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setCameraY(0);
    setPlayer({
      x: CANVAS_WIDTH / 2 - PLAYER_SIZE / 2,
      y: CANVAS_HEIGHT - 200,
      velocityY: 0,
      velocityX: 0,
    });
    setPlatforms(initPlatforms());
    setKeys({});
  };

  return (
    <GameLayout gameId="jumpjump">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6 relative">
          <div className="flex justify-center items-center mb-4">
            <div className="text-2xl font-bold">
              {t.score}: <span className="text-blue-600">{score}</span>
            </div>
          </div>

          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            onClick={handleClick}
            className="border-4 border-gray-800 rounded cursor-pointer"
          />

          {!gameStarted && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded">
              <div className="text-center">
                <button
                  onClick={startGame}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xl font-bold"
                >
                  {t.start}
                </button>
                <p className="text-white mt-4">Click or press Space to jump</p>
              </div>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 rounded">
              <div className="text-white text-3xl font-bold mb-4">{t.gameOver}</div>
              <div className="text-white text-xl mb-6">{t.score}: {score}</div>
              <button
                onClick={startGame}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xl font-bold"
              >
                {t.restart}
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
          <h3 className="font-bold text-lg mb-2">{t.controls}</h3>
          <p className="text-gray-700 mb-4">{t.games.jumpjump.controls}</p>
          <div className="text-sm text-gray-600">
            <p>• {t.games.jumpjump.description}</p>
            <p className="mt-2">• Use arrow keys to move left/right</p>
            <p>• You automatically jump when landing on platforms</p>
            <p>• Don't fall off the screen!</p>
            <p>• Each successful jump = 1 point</p>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
