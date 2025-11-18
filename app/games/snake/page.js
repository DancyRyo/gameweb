'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 1, y: 0 };

const DIFFICULTY_SETTINGS = {
  easy: { speed: 200, name: 'Easy' },
  medium: { speed: 150, name: 'Medium' },
  hard: { speed: 100, name: 'Hard' },
  veryhard: { speed: 60, name: 'Very Hard' }
};

export default function SnakeGame() {
  const { t } = useLanguage();
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const gameLoopRef = useRef(null);
  const nextDirectionRef = useRef(INITIAL_DIRECTION);

  useEffect(() => {
    const saved = localStorage.getItem('snakeHighScore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const generateFood = useCallback(() => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, [snake]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    nextDirectionRef.current = INITIAL_DIRECTION;
    setFood(generateFood());
    setGameOver(false);
    setScore(0);
    setIsPlaying(false);
    setIsPaused(false);
  };

  const startGame = () => {
    resetGame();
    setIsPlaying(true);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const gameLoop = useCallback(() => {
    setSnake(prevSnake => {
      const newHead = {
        x: prevSnake[0].x + nextDirectionRef.current.x,
        y: prevSnake[0].y + nextDirectionRef.current.y
      };

      // Check wall collision
      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        setGameOver(true);
        setIsPlaying(false);
        return prevSnake;
      }

      // Check self collision
      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        setIsPlaying(false);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check food collision
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(prev => {
          const newScore = prev + 10;
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem('snakeHighScore', newScore.toString());
          }
          return newScore;
        });
        setFood(generateFood());
      } else {
        newSnake.pop();
      }

      setDirection(nextDirectionRef.current);
      return newSnake;
    });
  }, [food, highScore, generateFood]);

  useEffect(() => {
    if (isPlaying && !isPaused && !gameOver) {
      const gameSpeed = DIFFICULTY_SETTINGS[difficulty].speed;
      gameLoopRef.current = setInterval(gameLoop, gameSpeed);
      return () => clearInterval(gameLoopRef.current);
    }
  }, [isPlaying, isPaused, gameOver, gameLoop, difficulty]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isPlaying || gameOver) return;

      if (e.key === ' ') {
        e.preventDefault();
        togglePause();
        return;
      }

      const keyMap = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 }
      };

      const newDirection = keyMap[e.key];
      if (newDirection) {
        e.preventDefault();
        // Prevent reversing
        if (
          newDirection.x !== -direction.x &&
          newDirection.y !== -direction.y
        ) {
          nextDirectionRef.current = newDirection;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, gameOver, direction, isPaused]);

  return (
    <GameLayout gameId="snake">
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
                <option value="veryhard">Very Hard</option>
              </select>
            </div>
            <div className="text-lg font-semibold text-gray-700">
              {t.highScore}: <span className="text-purple-600">{highScore}</span>
            </div>
          </div>

          <div className="flex justify-center mb-4">
            <div
              className="border-4 border-gray-800 bg-green-100"
              style={{
                width: GRID_SIZE * CELL_SIZE,
                height: GRID_SIZE * CELL_SIZE,
                position: 'relative'
              }}
            >
              {/* Snake */}
              {snake.map((segment, index) => (
                <div
                  key={index}
                  className={index === 0 ? 'bg-green-600' : 'bg-green-500'}
                  style={{
                    position: 'absolute',
                    left: segment.x * CELL_SIZE,
                    top: segment.y * CELL_SIZE,
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    border: '1px solid #16a34a'
                  }}
                />
              ))}

              {/* Food */}
              <div
                className="bg-red-500 rounded-full"
                style={{
                  position: 'absolute',
                  left: food.x * CELL_SIZE,
                  top: food.y * CELL_SIZE,
                  width: CELL_SIZE,
                  height: CELL_SIZE
                }}
              />

              {/* Game Over Overlay */}
              {gameOver && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-white text-3xl font-bold mb-4">
                      {t.gameOver}
                    </div>
                    <div className="text-white text-xl">
                      {t.score}: {score}
                    </div>
                  </div>
                </div>
              )}

              {/* Paused Overlay */}
              {isPaused && !gameOver && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-white text-3xl font-bold">
                    {t.pause}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center gap-4">
            {!isPlaying ? (
              <button
                onClick={startGame}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                {gameOver ? t.restart : t.start}
              </button>
            ) : (
              <button
                onClick={togglePause}
                className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors"
              >
                {isPaused ? t.resume : t.pause}
              </button>
            )}
          </div>

          <div className="mt-6 space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">{t.controls}</h3>
              <p className="text-gray-600">{t.games.snake.controls}</p>
              <p className="text-gray-600 mt-2">
                {t.language === 'en' ? 'Press Space to pause/resume' : '按空格键暂停/继续'}
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">
                {t.language === 'en' ? 'Difficulty Levels' : '难度级别'}
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-gray-600">{t.easy}: {t.language === 'en' ? 'Slow' : '慢速'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  <span className="text-gray-600">{t.medium}: {t.language === 'en' ? 'Normal' : '正常'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  <span className="text-gray-600">{t.hard}: {t.language === 'en' ? 'Fast' : '快速'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span className="text-gray-600">Very Hard: {t.language === 'en' ? 'Very Fast' : '超快'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
