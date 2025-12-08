'use client';

import { useState, useEffect, useRef } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const PLAYER_SIZE = 40;
const PLATFORM_WIDTH = 80;
const PLATFORM_HEIGHT = 15;

const SIZE_SETTINGS = {
  small: {
    width: 350,
    height: 500
  },
  medium: {
    width: 400,
    height: 600
  },
  large: {
    width: 500,
    height: 700
  }
};

const DIFFICULTY_SETTINGS = {
  easy: { gravity: 0.35, jumpForce: -10, playerSpeed: 4, platformSpacing: 60 },
  medium: { gravity: 0.5, jumpForce: -12, playerSpeed: 5, platformSpacing: 75 },
  hard: { gravity: 0.65, jumpForce: -14, playerSpeed: 6, platformSpacing: 90 }
};

export default function DoodleJumpGame() {
  const { t } = useLanguage();
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [boardSize, setBoardSize] = useState('medium');
  const sizeConfig = SIZE_SETTINGS[boardSize];
  const gameStateRef = useRef({
    player: { x: sizeConfig.width / 2, y: sizeConfig.height - 100, velocityY: 0 },
    platforms: [],
    score: 0,
    keys: {},
    boardSize: 'medium'
  });

  useEffect(() => {
    const saved = localStorage.getItem('doodlejumpHighScore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const initPlatforms = (size) => {
    const sizeConf = SIZE_SETTINGS[size];
    const settings = DIFFICULTY_SETTINGS[difficulty];
    const platforms = [];
    for (let i = 0; i < 8; i++) {
      platforms.push({
        x: Math.random() * (sizeConf.width - PLATFORM_WIDTH),
        y: i * settings.platformSpacing + 100
      });
    }
    return platforms;
  };

  const startGame = () => {
    const initialPlatforms = initPlatforms(boardSize);
    const size = SIZE_SETTINGS[boardSize];
    gameStateRef.current = {
      player: { x: size.width / 2, y: size.height - 100, velocityY: 0 },
      platforms: initialPlatforms,
      score: 0,
      keys: {},
      difficulty: difficulty,
      boardSize: boardSize
    };
    setScore(0);
    setIsPlaying(true);
    setGameOver(false);
  };

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const handleKeyDown = (e) => {
      gameStateRef.current.keys[e.key] = true;
    };

    const handleKeyUp = (e) => {
      gameStateRef.current.keys[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const gameLoop = setInterval(() => {
      const state = gameStateRef.current;
      const settings = DIFFICULTY_SETTINGS[state.difficulty || 'medium'];
      const size = SIZE_SETTINGS[state.boardSize || 'medium'];

      // Player movement
      if (state.keys['ArrowLeft']) {
        state.player.x -= settings.playerSpeed;
      }
      if (state.keys['ArrowRight']) {
        state.player.x += settings.playerSpeed;
      }

      // Wrap around screen
      if (state.player.x < 0) state.player.x = size.width;
      if (state.player.x > size.width) state.player.x = 0;

      // Gravity
      state.player.velocityY += settings.gravity;
      state.player.y += state.player.velocityY;

      // Platform collision (only when falling)
      if (state.player.velocityY > 0) {
        state.platforms.forEach(platform => {
          if (
            state.player.x + PLAYER_SIZE > platform.x &&
            state.player.x < platform.x + PLATFORM_WIDTH &&
            state.player.y + PLAYER_SIZE > platform.y &&
            state.player.y + PLAYER_SIZE < platform.y + PLATFORM_HEIGHT + 10
          ) {
            state.player.velocityY = settings.jumpForce;
          }
        });
      }

      // Scroll platforms down when player is in upper half
      if (state.player.y < size.height / 2) {
        const diff = size.height / 2 - state.player.y;
        state.player.y = size.height / 2;

        state.platforms.forEach(platform => {
          platform.y += diff;
        });

        state.score += Math.floor(diff);
        setScore(Math.floor(state.score));

        // Remove platforms that went off screen and add new ones
        state.platforms = state.platforms.filter(p => p.y < size.height);
        while (state.platforms.length < 8) {
          state.platforms.push({
            x: Math.random() * (size.width - PLATFORM_WIDTH),
            y: state.platforms.length > 0 ? Math.min(...state.platforms.map(p => p.y)) - settings.platformSpacing : 0
          });
        }
      }

      // Game over
      if (state.player.y > size.height) {
        setIsPlaying(false);
        setGameOver(true);
        if (state.score > highScore) {
          setHighScore(Math.floor(state.score));
          localStorage.setItem('doodlejumpHighScore', Math.floor(state.score).toString());
        }
        clearInterval(gameLoop);
        return;
      }

      // Draw
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(0, 0, size.width, size.height);

      // Draw platforms
      ctx.fillStyle = '#22c55e';
      state.platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, PLATFORM_WIDTH, PLATFORM_HEIGHT);
      });

      // Draw player
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(state.player.x, state.player.y, PLAYER_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();

      // Draw eyes
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(state.player.x - 8, state.player.y - 5, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(state.player.x + 8, state.player.y - 5, 5, 0, Math.PI * 2);
      ctx.fill();
    }, 1000 / 60);

    return () => {
      clearInterval(gameLoop);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying, gameOver, highScore]);

  return (
    <GameLayout gameId="doodlejump">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="text-lg font-semibold text-gray-700">
              {t.score}: <span className="text-blue-600">{Math.floor(score)}</span>
            </div>
            <div className="text-lg font-semibold text-gray-700">
              {t.difficulty}:
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                disabled={isPlaying}
                className="ml-2 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="easy">{t.easy}</option>
                <option value="medium">{t.medium}</option>
                <option value="hard">{t.hard}</option>
              </select>
            </div>
            <div className="text-lg font-semibold text-gray-700">
              {t.language === 'en' ? 'Size' : '大小'}:
              <select
                value={boardSize}
                onChange={(e) => setBoardSize(e.target.value)}
                disabled={isPlaying}
                className="ml-2 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="small">{t.language === 'en' ? 'Small' : '小'}</option>
                <option value="medium">{t.language === 'en' ? 'Medium' : '中'}</option>
                <option value="large">{t.language === 'en' ? 'Large' : '大'}</option>
              </select>
            </div>
            <div className="text-lg font-semibold text-gray-700">
              {t.highScore}: <span className="text-purple-600">{Math.floor(highScore)}</span>
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <canvas
              ref={canvasRef}
              width={sizeConfig.width}
              height={sizeConfig.height}
              className="border-4 border-gray-300 rounded-lg"
            />
          </div>

          <div className="flex justify-center">
            {!isPlaying ? (
              <button
                onClick={startGame}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                {gameOver ? t.restart : t.start}
              </button>
            ) : (
              <div className="text-xl font-bold text-blue-600">
                Jump to the top!
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">{t.controls}</h3>
            <p className="text-gray-600">{t.games.doodlejump.controls}</p>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
