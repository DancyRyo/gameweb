'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 400;
const BALL_RADIUS = 8;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_WIDTH = 55;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 5;

const DIFFICULTY_SETTINGS = {
  easy: {
    ballSpeed: 2.5,
    paddleWidth: 100,
    paddleHeight: 10,
    name: 'Easy'
  },
  medium: {
    ballSpeed: 3.5,
    paddleWidth: 75,
    paddleHeight: 10,
    name: 'Medium'
  },
  hard: {
    ballSpeed: 5,
    paddleWidth: 60,
    paddleHeight: 10,
    name: 'Hard'
  }
};

export default function BreakoutGame() {
  const { t } = useLanguage();
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const animationRef = useRef(null);
  const gameStateRef = useRef({
    paddle: { x: CANVAS_WIDTH / 2 - 75 / 2, y: CANVAS_HEIGHT - 30 },
    ball: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 50, dx: 3, dy: -3 },
    bricks: [],
    difficulty: 'medium'
  });

  useEffect(() => {
    const saved = localStorage.getItem('breakoutHighScore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const initBricks = () => {
    const bricks = [];
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        bricks.push({
          x: col * (BRICK_WIDTH + BRICK_PADDING) + 35,
          y: row * (BRICK_HEIGHT + BRICK_PADDING) + 30,
          status: 1
        });
      }
    }
    return bricks;
  };

  const startGame = () => {
    const settings = DIFFICULTY_SETTINGS[difficulty];
    const angle = (Math.random() * 60 - 30) * (Math.PI / 180); // Random angle between -30 and 30 degrees
    const speed = settings.ballSpeed;

    gameStateRef.current = {
      paddle: {
        x: CANVAS_WIDTH / 2 - settings.paddleWidth / 2,
        y: CANVAS_HEIGHT - 30,
        width: settings.paddleWidth,
        height: settings.paddleHeight
      },
      ball: {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT - 50,
        dx: speed * Math.sin(angle),
        dy: -speed * Math.cos(angle)
      },
      bricks: initBricks(),
      difficulty: difficulty
    };
    setScore(0);
    setIsPlaying(true);
    setGameOver(false);
    setWon(false);
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { paddle, ball, bricks } = gameStateRef.current;

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw bricks
    bricks.forEach(brick => {
      if (brick.status === 1) {
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
        ctx.strokeStyle = '#1e40af';
        ctx.strokeRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
      }
    });

    // Draw paddle
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

    // Draw ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#ef4444';
    ctx.fill();
    ctx.closePath();
  }, []);

  const update = useCallback(() => {
    const { paddle, ball, bricks } = gameStateRef.current;

    // Move ball
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collision
    if (ball.x + ball.dx > CANVAS_WIDTH - BALL_RADIUS || ball.x + ball.dx < BALL_RADIUS) {
      ball.dx = -ball.dx;
    }
    if (ball.y + ball.dy < BALL_RADIUS) {
      ball.dy = -ball.dy;
    }

    // Paddle collision
    if (
      ball.y + ball.dy > paddle.y - BALL_RADIUS &&
      ball.x > paddle.x &&
      ball.x < paddle.x + paddle.width
    ) {
      // Add spin based on where the ball hits the paddle
      const hitPos = (ball.x - paddle.x) / paddle.width; // 0 to 1
      const angle = (hitPos - 0.5) * 60 * (Math.PI / 180); // -30 to 30 degrees
      const settings = DIFFICULTY_SETTINGS[gameStateRef.current.difficulty];
      const speed = settings.ballSpeed;

      ball.dx = speed * Math.sin(angle);
      ball.dy = -speed * Math.cos(angle);
    }

    // Bottom wall
    if (ball.y + ball.dy > CANVAS_HEIGHT - BALL_RADIUS) {
      setIsPlaying(false);
      setGameOver(true);
      return;
    }

    // Brick collision
    bricks.forEach(brick => {
      if (brick.status === 1) {
        if (
          ball.x > brick.x &&
          ball.x < brick.x + BRICK_WIDTH &&
          ball.y > brick.y &&
          ball.y < brick.y + BRICK_HEIGHT
        ) {
          ball.dy = -ball.dy;
          brick.status = 0;
          setScore(prev => {
            const newScore = prev + 10;
            if (newScore > highScore) {
              setHighScore(newScore);
              localStorage.setItem('breakoutHighScore', newScore.toString());
            }
            return newScore;
          });
        }
      }
    });

    // Check win
    if (bricks.every(brick => brick.status === 0)) {
      setIsPlaying(false);
      setWon(true);
    }
  }, [highScore]);

  const gameLoop = useCallback(() => {
    if (!isPlaying) return;
    update();
    draw();
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [isPlaying, update, draw]);

  useEffect(() => {
    if (isPlaying) {
      gameLoop();
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, gameLoop]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isPlaying) return;
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const paddle = gameStateRef.current.paddle;
      paddle.x = Math.max(
        0,
        Math.min(relativeX - paddle.width / 2, CANVAS_WIDTH - paddle.width)
      );
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isPlaying]);

  return (
    <GameLayout gameId="breakout">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <div className="text-lg font-semibold text-gray-700">
              {t.score}: <span className="text-blue-600">{score}</span>
            </div>
            <div className="text-lg font-semibold text-gray-700">
              {t.difficulty}:
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                disabled={isPlaying}
                className="ml-2 px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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

          <div className="flex justify-center mb-4">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="border-4 border-gray-800 bg-gray-900"
            />
          </div>

          {(gameOver || won) && (
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-gray-700">
                {won ? t.youWin : t.gameOver}
              </div>
            </div>
          )}

          <div className="flex justify-center">
            {!isPlaying && (
              <button
                onClick={startGame}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                {gameOver || won ? t.restart : t.start}
              </button>
            )}
          </div>

          <div className="mt-6 space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">{t.controls}</h3>
              <p className="text-gray-600">{t.games.breakout.controls}</p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">
                {t.language === 'en' ? 'Difficulty Levels' : '难度级别'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="font-semibold text-gray-700">{t.easy}</span>
                  </div>
                  <span className="text-gray-600 ml-4">
                    {t.language === 'en' ? 'Wider paddle, slower ball' : '宽挡板，慢球速'}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    <span className="font-semibold text-gray-700">{t.medium}</span>
                  </div>
                  <span className="text-gray-600 ml-4">
                    {t.language === 'en' ? 'Normal paddle, normal ball' : '正常挡板，正常球速'}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    <span className="font-semibold text-gray-700">{t.hard}</span>
                  </div>
                  <span className="text-gray-600 ml-4">
                    {t.language === 'en' ? 'Narrower paddle, faster ball' : '窄挡板，快球速'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
