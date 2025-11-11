'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 400;
const PADDLE_WIDTH = 75;
const PADDLE_HEIGHT = 10;
const BALL_RADIUS = 8;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_WIDTH = 55;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 5;

export default function BreakoutGame() {
  const { t } = useLanguage();
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const animationRef = useRef(null);
  const gameStateRef = useRef({
    paddle: { x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2, y: CANVAS_HEIGHT - 30 },
    ball: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 50, dx: 3, dy: -3 },
    bricks: []
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
    gameStateRef.current = {
      paddle: { x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2, y: CANVAS_HEIGHT - 30 },
      ball: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 50, dx: 3, dy: -3 },
      bricks: initBricks()
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
    ctx.fillRect(paddle.x, paddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);

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
      ball.x < paddle.x + PADDLE_WIDTH
    ) {
      ball.dy = -ball.dy;
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
      gameStateRef.current.paddle.x = Math.max(
        0,
        Math.min(relativeX - PADDLE_WIDTH / 2, CANVAS_WIDTH - PADDLE_WIDTH)
      );
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isPlaying]);

  return (
    <GameLayout gameId="breakout">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl">
          <div className="flex justify-between items-center mb-4">
            <div className="text-lg font-semibold text-gray-700">
              {t.score}: <span className="text-blue-600">{score}</span>
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

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">{t.controls}</h3>
            <p className="text-gray-600">{t.games.breakout.controls}</p>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
