'use client';

import { useState, useEffect, useRef } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 10;

const SIZE_SETTINGS = {
  small: {
    width: 600,
    height: 350
  },
  medium: {
    width: 800,
    height: 400
  },
  large: {
    width: 1000,
    height: 500
  }
};

const DIFFICULTY_SETTINGS = {
  easy: { ballSpeed: 3, aiSpeed: 2.5 },
  medium: { ballSpeed: 5, aiSpeed: 4 },
  hard: { ballSpeed: 7, aiSpeed: 6 }
};

export default function PingPongGame() {
  const { t } = useLanguage();
  const canvasRef = useRef(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAIScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [boardSize, setBoardSize] = useState('medium');
  const sizeConfig = SIZE_SETTINGS[boardSize];
  const gameStateRef = useRef({
    player: { x: 20, y: sizeConfig.height / 2 - PADDLE_HEIGHT / 2 },
    ai: { x: sizeConfig.width - 30, y: sizeConfig.height / 2 - PADDLE_HEIGHT / 2 },
    ball: {
      x: sizeConfig.width / 2,
      y: sizeConfig.height / 2,
      velocityX: 5,
      velocityY: 5
    },
    boardSize: 'medium'
  });

  useEffect(() => {
    const saved = localStorage.getItem('pingpongHighScore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const startGame = () => {
    const settings = DIFFICULTY_SETTINGS[difficulty];
    const size = SIZE_SETTINGS[boardSize];
    gameStateRef.current = {
      player: { x: 20, y: size.height / 2 - PADDLE_HEIGHT / 2 },
      ai: { x: size.width - 30, y: size.height / 2 - PADDLE_HEIGHT / 2 },
      ball: {
        x: size.width / 2,
        y: size.height / 2,
        velocityX: settings.ballSpeed * (Math.random() > 0.5 ? 1 : -1),
        velocityY: settings.ballSpeed * (Math.random() > 0.5 ? 1 : -1)
      },
      difficulty: difficulty,
      boardSize: boardSize
    };
    setPlayerScore(0);
    setAIScore(0);
    setIsPlaying(true);
    setGameOver(false);
  };

  const resetBall = (direction) => {
    const state = gameStateRef.current;
    const settings = DIFFICULTY_SETTINGS[state.difficulty || 'medium'];
    const size = SIZE_SETTINGS[state.boardSize || 'medium'];
    state.ball = {
      x: size.width / 2,
      y: size.height / 2,
      velocityX: settings.ballSpeed * direction,
      velocityY: settings.ballSpeed * (Math.random() > 0.5 ? 1 : -1)
    };
  };

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseY = e.clientY - rect.top;
      const size = SIZE_SETTINGS[gameStateRef.current.boardSize || 'medium'];
      gameStateRef.current.player.y = Math.max(
        0,
        Math.min(size.height - PADDLE_HEIGHT, mouseY - PADDLE_HEIGHT / 2)
      );
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    const gameLoop = setInterval(() => {
      const state = gameStateRef.current;
      const size = SIZE_SETTINGS[state.boardSize || 'medium'];

      // Move ball
      state.ball.x += state.ball.velocityX;
      state.ball.y += state.ball.velocityY;

      // Ball collision with top and bottom
      if (state.ball.y <= 0 || state.ball.y >= size.height - BALL_SIZE) {
        state.ball.velocityY = -state.ball.velocityY;
      }

      // Ball collision with player paddle
      if (
        state.ball.x <= state.player.x + PADDLE_WIDTH &&
        state.ball.y >= state.player.y &&
        state.ball.y <= state.player.y + PADDLE_HEIGHT &&
        state.ball.velocityX < 0
      ) {
        state.ball.velocityX = -state.ball.velocityX * 1.1;
        const deltaY = state.ball.y - (state.player.y + PADDLE_HEIGHT / 2);
        state.ball.velocityY = deltaY * 0.3;
      }

      // Ball collision with AI paddle
      if (
        state.ball.x >= state.ai.x - BALL_SIZE &&
        state.ball.y >= state.ai.y &&
        state.ball.y <= state.ai.y + PADDLE_HEIGHT &&
        state.ball.velocityX > 0
      ) {
        state.ball.velocityX = -state.ball.velocityX * 1.1;
        const deltaY = state.ball.y - (state.ai.y + PADDLE_HEIGHT / 2);
        state.ball.velocityY = deltaY * 0.3;
      }

      // AI movement (simple AI that follows the ball)
      const settings = DIFFICULTY_SETTINGS[state.difficulty || 'medium'];
      const aiCenter = state.ai.y + PADDLE_HEIGHT / 2;
      const ballCenter = state.ball.y + BALL_SIZE / 2;
      if (aiCenter < ballCenter - 35) {
        state.ai.y += settings.aiSpeed;
      } else if (aiCenter > ballCenter + 35) {
        state.ai.y -= settings.aiSpeed;
      }
      state.ai.y = Math.max(0, Math.min(size.height - PADDLE_HEIGHT, state.ai.y));

      // Scoring
      if (state.ball.x <= 0) {
        setAIScore(prev => {
          const newScore = prev + 1;
          if (newScore >= 10) {
            setIsPlaying(false);
            setGameOver(true);
            clearInterval(gameLoop);
          }
          return newScore;
        });
        resetBall(1);
      } else if (state.ball.x >= size.width - BALL_SIZE) {
        setPlayerScore(prev => {
          const newScore = prev + 1;
          if (newScore >= 10) {
            setIsPlaying(false);
            setGameOver(true);
            if (newScore > highScore) {
              setHighScore(newScore);
              localStorage.setItem('pingpongHighScore', newScore.toString());
            }
            clearInterval(gameLoop);
          }
          return newScore;
        });
        resetBall(-1);
      }

      // Draw
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, size.width, size.height);

      // Draw center line
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(size.width / 2, 0);
      ctx.lineTo(size.width / 2, size.height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw paddles
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(state.player.x, state.player.y, PADDLE_WIDTH, PADDLE_HEIGHT);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(state.ai.x, state.ai.y, PADDLE_WIDTH, PADDLE_HEIGHT);

      // Draw ball
      ctx.fillStyle = '#fff';
      ctx.fillRect(state.ball.x, state.ball.y, BALL_SIZE, BALL_SIZE);

      // Draw scores
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 48px monospace';
      ctx.fillText(playerScore.toString(), size.width / 4, 60);
      ctx.fillText(aiScore.toString(), (size.width * 3) / 4, 60);
    }, 1000 / 60);

    return () => {
      clearInterval(gameLoop);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isPlaying, gameOver, playerScore, aiScore, highScore]);

  return (
    <GameLayout gameId="pingpong">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="text-lg font-semibold text-blue-600">
              Player: <span className="text-2xl">{playerScore}</span>
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
            <div className="text-lg font-semibold text-red-600">
              AI: <span className="text-2xl">{aiScore}</span>
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <canvas
              ref={canvasRef}
              width={sizeConfig.width}
              height={sizeConfig.height}
              className="border-4 border-gray-300 rounded-lg cursor-none"
            />
          </div>

          <div className="flex justify-center mb-6">
            {!isPlaying ? (
              <div className="text-center">
                {gameOver && (
                  <div className="mb-4">
                    {playerScore >= 10 ? (
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        🎉 You Win! 🎉
                      </div>
                    ) : (
                      <div className="text-3xl font-bold text-red-600 mb-2">
                        AI Wins!
                      </div>
                    )}
                  </div>
                )}
                <button
                  onClick={startGame}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  {gameOver ? t.restart : t.start}
                </button>
              </div>
            ) : (
              <div className="text-xl font-bold text-blue-600">
                Move your mouse to control the paddle!
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">{t.controls}</h3>
              <p className="text-gray-600">{t.games.pingpong.controls}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">{t.highScore}</h3>
              <p className="text-gray-600">Best winning score: <span className="text-2xl font-bold text-purple-600">{highScore}</span></p>
            </div>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
