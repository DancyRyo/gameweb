'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const BIRD_SIZE = 30;
const PIPE_WIDTH = 60;

const DIFFICULTY_SETTINGS = {
  easy: { gravity: 0.4, jump: -9, pipeSpeed: 2, pipeGap: 180, pipeSpacing: 300 },
  medium: { gravity: 0.6, jump: -10, pipeSpeed: 3, pipeGap: 150, pipeSpacing: 250 },
  hard: { gravity: 0.8, jump: -11, pipeSpeed: 4, pipeGap: 120, pipeSpacing: 220 }
};

export default function FlappyBirdGame() {
  const { t } = useLanguage();
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const animationRef = useRef(null);
  const gameStateRef = useRef({
    birdY: CANVAS_HEIGHT / 2,
    birdVelocity: 0,
    pipes: [],
    difficulty: 'medium'
  });

  useEffect(() => {
    const saved = localStorage.getItem('flappyHighScore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const startGame = () => {
    gameStateRef.current = {
      birdY: CANVAS_HEIGHT / 2,
      birdVelocity: 0,
      pipes: [{ x: CANVAS_WIDTH, height: 200 }],
      difficulty: difficulty
    };
    setScore(0);
    setIsPlaying(true);
    setGameOver(false);
  };

  const jump = () => {
    if (!isPlaying || gameOver) return;
    const settings = DIFFICULTY_SETTINGS[gameStateRef.current.difficulty || 'medium'];
    gameStateRef.current.birdVelocity = settings.jump;
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { birdY, pipes, difficulty } = gameStateRef.current;
    const settings = DIFFICULTY_SETTINGS[difficulty || 'medium'];

    // Clear canvas
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw bird
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(100, birdY, BIRD_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw pipes
    ctx.fillStyle = '#22c55e';
    pipes.forEach(pipe => {
      // Top pipe
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.height);
      // Bottom pipe
      ctx.fillRect(pipe.x, pipe.height + settings.pipeGap, PIPE_WIDTH, CANVAS_HEIGHT);
    });

    // Draw score
    ctx.fillStyle = '#000';
    ctx.font = 'bold 32px Arial';
    ctx.fillText(score.toString(), 20, 50);
  }, [score]);

  const update = useCallback(() => {
    const state = gameStateRef.current;
    const settings = DIFFICULTY_SETTINGS[state.difficulty || 'medium'];

    // Update bird
    state.birdVelocity += settings.gravity;
    state.birdY += state.birdVelocity;

    // Check ground/ceiling collision
    if (state.birdY > CANVAS_HEIGHT - BIRD_SIZE / 2 || state.birdY < BIRD_SIZE / 2) {
      setIsPlaying(false);
      setGameOver(true);
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('flappyHighScore', score.toString());
      }
      return;
    }

    // Update pipes
    state.pipes.forEach((pipe, index) => {
      pipe.x -= settings.pipeSpeed;

      // Check collision
      if (
        100 + BIRD_SIZE / 2 > pipe.x &&
        100 - BIRD_SIZE / 2 < pipe.x + PIPE_WIDTH
      ) {
        if (
          state.birdY - BIRD_SIZE / 2 < pipe.height ||
          state.birdY + BIRD_SIZE / 2 > pipe.height + settings.pipeGap
        ) {
          setIsPlaying(false);
          setGameOver(true);
          if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('flappyHighScore', score.toString());
          }
          return;
        }
      }

      // Score point
      if (pipe.x + PIPE_WIDTH === 100) {
        setScore(prev => prev + 1);
      }
    });

    // Remove off-screen pipes
    state.pipes = state.pipes.filter(pipe => pipe.x > -PIPE_WIDTH);

    // Add new pipes
    if (state.pipes.length === 0 || state.pipes[state.pipes.length - 1].x < CANVAS_WIDTH - settings.pipeSpacing) {
      state.pipes.push({
        x: CANVAS_WIDTH,
        height: Math.random() * (CANVAS_HEIGHT - settings.pipeGap - 100) + 50
      });
    }
  }, [score, highScore]);

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
    const handleKeyPress = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        jump();
      }
    };

    const handleClick = () => {
      jump();
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('click', handleClick);
    };
  }, [isPlaying, gameOver]);

  return (
    <GameLayout gameId="flappybird">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            <div className="text-lg font-semibold text-gray-700">
              {t.score}: <span className="text-blue-600">{score}</span>
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
              {t.highScore}: <span className="text-purple-600">{highScore}</span>
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
              <div className="text-2xl font-bold text-red-600">
                {t.gameOver}
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
            <p className="text-gray-600">{t.games.flappybird.controls}</p>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
