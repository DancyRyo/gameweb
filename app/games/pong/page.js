'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 10;

export default function PongGame() {
  const { t } = useLanguage();
  const canvasRef = useRef(null);
  const [score, setScore] = useState({ player: 0, computer: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const animationRef = useRef(null);
  const gameStateRef = useRef({
    playerY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    computerY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    ballX: CANVAS_WIDTH / 2,
    ballY: CANVAS_HEIGHT / 2,
    ballDX: 4,
    ballDY: 4
  });

  const startGame = () => {
    gameStateRef.current = {
      playerY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      computerY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      ballX: CANVAS_WIDTH / 2,
      ballY: CANVAS_HEIGHT / 2,
      ballDX: 4,
      ballDY: 4
    };
    setScore({ player: 0, computer: 0 });
    setIsPlaying(true);
    setGameOver(false);
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { playerY, computerY, ballX, ballY } = gameStateRef.current;

    // Clear canvas
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw center line
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = '#9ca3af';
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw player paddle
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(20, playerY, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Draw computer paddle
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(CANVAS_WIDTH - 30, computerY, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Draw ball
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(ballX, ballY, BALL_SIZE, BALL_SIZE);
  }, []);

  const update = useCallback(() => {
    const state = gameStateRef.current;

    // Move ball
    state.ballX += state.ballDX;
    state.ballY += state.ballDY;

    // Ball collision with top/bottom
    if (state.ballY <= 0 || state.ballY >= CANVAS_HEIGHT - BALL_SIZE) {
      state.ballDY = -state.ballDY;
    }

    // Ball collision with player paddle
    if (
      state.ballX <= 30 &&
      state.ballY + BALL_SIZE >= state.playerY &&
      state.ballY <= state.playerY + PADDLE_HEIGHT
    ) {
      state.ballDX = Math.abs(state.ballDX);
    }

    // Ball collision with computer paddle
    if (
      state.ballX >= CANVAS_WIDTH - 30 - BALL_SIZE &&
      state.ballY + BALL_SIZE >= state.computerY &&
      state.ballY <= state.computerY + PADDLE_HEIGHT
    ) {
      state.ballDX = -Math.abs(state.ballDX);
    }

    // Score
    if (state.ballX < 0) {
      setScore(prev => {
        const newScore = { ...prev, computer: prev.computer + 1 };
        if (newScore.computer >= 5) {
          setIsPlaying(false);
          setGameOver(true);
        }
        return newScore;
      });
      state.ballX = CANVAS_WIDTH / 2;
      state.ballY = CANVAS_HEIGHT / 2;
      state.ballDX = 4;
      state.ballDY = 4;
    }

    if (state.ballX > CANVAS_WIDTH) {
      setScore(prev => {
        const newScore = { ...prev, player: prev.player + 1 };
        if (newScore.player >= 5) {
          setIsPlaying(false);
          setGameOver(true);
        }
        return newScore;
      });
      state.ballX = CANVAS_WIDTH / 2;
      state.ballY = CANVAS_HEIGHT / 2;
      state.ballDX = -4;
      state.ballDY = 4;
    }

    // Computer AI
    if (state.ballY > state.computerY + PADDLE_HEIGHT / 2) {
      state.computerY = Math.min(state.computerY + 3, CANVAS_HEIGHT - PADDLE_HEIGHT);
    } else {
      state.computerY = Math.max(state.computerY - 3, 0);
    }
  }, []);

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
      const relativeY = e.clientY - rect.top;
      gameStateRef.current.playerY = Math.max(
        0,
        Math.min(relativeY - PADDLE_HEIGHT / 2, CANVAS_HEIGHT - PADDLE_HEIGHT)
      );
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isPlaying]);

  return (
    <GameLayout gameId="pong">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-3xl">
          <div className="flex justify-around items-center mb-4">
            <div className="text-lg font-semibold text-green-600">
              {t.language === 'en' ? 'Player' : '玩家'}: {score.player}
            </div>
            <div className="text-lg font-semibold text-red-600">
              {t.language === 'en' ? 'Computer' : '电脑'}: {score.computer}
            </div>
          </div>

          <div className="flex justify-center mb-4">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="border-4 border-gray-800"
            />
          </div>

          {gameOver && (
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-gray-700">
                {score.player >= 5 ? t.youWin : t.gameOver}
              </div>
            </div>
          )}

          <div className="flex justify-center">
            {!isPlaying && (
              <button
                onClick={startGame}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                {gameOver ? t.restart : t.start}
              </button>
            )}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">{t.controls}</h3>
            <p className="text-gray-600">{t.games.pong.controls}</p>
            <p className="text-gray-600 mt-2">
              {t.language === 'en' ? 'First to 5 points wins!' : '先得5分者获胜！'}
            </p>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
