'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const CELL_SIZE = 20;
const GRID_WIDTH = 28;
const GRID_HEIGHT = 31;

// Simplified Pac-Man maze (0 = wall, 1 = dot, 2 = power pellet, 3 = empty)
const createMaze = () => {
  const maze = Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(1));

  // Create walls around the border
  for (let i = 0; i < GRID_HEIGHT; i++) {
    for (let j = 0; j < GRID_WIDTH; j++) {
      if (i === 0 || i === GRID_HEIGHT - 1 || j === 0 || j === GRID_WIDTH - 1) {
        maze[i][j] = 0;
      }
    }
  }

  // Add some internal walls
  for (let i = 2; i < 5; i++) {
    for (let j = 2; j < 12; j++) {
      maze[i][j] = 0;
    }
  }

  for (let i = 2; i < 5; i++) {
    for (let j = 16; j < 26; j++) {
      maze[i][j] = 0;
    }
  }

  // Power pellets in corners
  maze[1][1] = 2;
  maze[1][GRID_WIDTH - 2] = 2;
  maze[GRID_HEIGHT - 2][1] = 2;
  maze[GRID_HEIGHT - 2][GRID_WIDTH - 2] = 2;

  return maze;
};

const GHOST_COLORS = ['#FF0000', '#FFB8FF', '#00FFFF', '#FFB852'];

export default function PacManGame() {
  const { t } = useLanguage();
  const canvasRef = useRef(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [maze, setMaze] = useState(createMaze());
  const [pacman, setPacman] = useState({ x: 14, y: 23, direction: 0, nextDirection: 0 });
  const [ghosts, setGhosts] = useState([
    { x: 13, y: 14, direction: 0, scared: false },
    { x: 14, y: 14, direction: 1, scared: false },
    { x: 13, y: 15, direction: 2, scared: false },
    { x: 14, y: 15, direction: 3, scared: false },
  ]);
  const [powerMode, setPowerMode] = useState(false);

  const directionVectors = [
    { x: 1, y: 0 },   // right
    { x: 0, y: -1 },  // up
    { x: -1, y: 0 },  // left
    { x: 0, y: 1 },   // down
  ];

  const handleKeyPress = useCallback((e) => {
    if (!gameStarted || gameOver) return;

    setPacman(prev => {
      let nextDir = prev.nextDirection;
      switch(e.key) {
        case 'ArrowRight': nextDir = 0; break;
        case 'ArrowUp': nextDir = 1; break;
        case 'ArrowLeft': nextDir = 2; break;
        case 'ArrowDown': nextDir = 3; break;
        default: return prev;
      }
      return { ...prev, nextDirection: nextDir };
    });
  }, [gameStarted, gameOver]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameLoop = setInterval(() => {
      // Move Pac-Man
      setPacman(prev => {
        const nextVec = directionVectors[prev.nextDirection];
        const newX = prev.x + nextVec.x;
        const newY = prev.y + nextVec.y;

        // Check if next direction is valid
        if (newX >= 0 && newX < GRID_WIDTH && newY >= 0 && newY < GRID_HEIGHT &&
            maze[newY][newX] !== 0) {
          // Can move in next direction
          return { ...prev, x: newX, y: newY, direction: prev.nextDirection };
        } else {
          // Try current direction
          const currVec = directionVectors[prev.direction];
          const currX = prev.x + currVec.x;
          const currY = prev.y + currVec.y;

          if (currX >= 0 && currX < GRID_WIDTH && currY >= 0 && currY < GRID_HEIGHT &&
              maze[currY][currX] !== 0) {
            return { ...prev, x: currX, y: currY };
          }
        }
        return prev;
      });

      // Check if Pac-Man ate a dot or power pellet
      setMaze(prevMaze => {
        const newMaze = prevMaze.map(row => [...row]);
        const cell = newMaze[pacman.y][pacman.x];

        if (cell === 1) {
          setScore(s => s + 10);
          newMaze[pacman.y][pacman.x] = 3;
        } else if (cell === 2) {
          setScore(s => s + 50);
          newMaze[pacman.y][pacman.x] = 3;
          setPowerMode(true);
          setGhosts(ghosts => ghosts.map(g => ({ ...g, scared: true })));
          setTimeout(() => {
            setPowerMode(false);
            setGhosts(ghosts => ghosts.map(g => ({ ...g, scared: false })));
          }, 10000);
        }

        return newMaze;
      });

      // Move ghosts
      setGhosts(prevGhosts => {
        return prevGhosts.map(ghost => {
          const vec = directionVectors[ghost.direction];
          let newX = ghost.x + vec.x;
          let newY = ghost.y + vec.y;
          let newDir = ghost.direction;

          // Simple AI: random direction when hitting wall
          if (newX < 1 || newX >= GRID_WIDTH - 1 || newY < 1 || newY >= GRID_HEIGHT - 1 ||
              maze[newY][newX] === 0) {
            newDir = Math.floor(Math.random() * 4);
            const newVec = directionVectors[newDir];
            newX = ghost.x + newVec.x;
            newY = ghost.y + newVec.y;
          }

          return { ...ghost, x: newX, y: newY, direction: newDir };
        });
      });

      // Check collision with ghosts
      ghosts.forEach(ghost => {
        if (Math.abs(ghost.x - pacman.x) < 1 && Math.abs(ghost.y - pacman.y) < 1) {
          if (powerMode && ghost.scared) {
            setScore(s => s + 200);
            // Respawn ghost
            setGhosts(prevGhosts => prevGhosts.map(g =>
              g === ghost ? { ...g, x: 14, y: 14 } : g
            ));
          } else if (!ghost.scared) {
            setLives(l => {
              const newLives = l - 1;
              if (newLives <= 0) {
                setGameOver(true);
              } else {
                // Respawn Pac-Man
                setPacman({ x: 14, y: 23, direction: 0, nextDirection: 0 });
              }
              return newLives;
            });
          }
        }
      });
    }, 200);

    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver, pacman, ghosts, maze, powerMode, directionVectors]);

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw maze
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const cell = maze[y][x];

        if (cell === 0) {
          // Wall
          ctx.fillStyle = '#0000FF';
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        } else if (cell === 1) {
          // Dot
          ctx.fillStyle = '#FFB897';
          ctx.beginPath();
          ctx.arc(x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2, 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (cell === 2) {
          // Power pellet
          ctx.fillStyle = '#FFB897';
          ctx.beginPath();
          ctx.arc(x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Draw Pac-Man
    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    const mouthAngle = 0.2 * Math.PI;
    const startAngle = pacman.direction * 0.5 * Math.PI + mouthAngle;
    const endAngle = startAngle + 2 * Math.PI - 2 * mouthAngle;
    ctx.arc(
      pacman.x * CELL_SIZE + CELL_SIZE / 2,
      pacman.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      startAngle,
      endAngle
    );
    ctx.lineTo(pacman.x * CELL_SIZE + CELL_SIZE / 2, pacman.y * CELL_SIZE + CELL_SIZE / 2);
    ctx.fill();

    // Draw ghosts
    ghosts.forEach((ghost, i) => {
      ctx.fillStyle = ghost.scared ? '#0000FF' : GHOST_COLORS[i];
      ctx.beginPath();
      ctx.arc(
        ghost.x * CELL_SIZE + CELL_SIZE / 2,
        ghost.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2 - 2,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Eyes
      if (!ghost.scared) {
        ctx.fillStyle = '#FFF';
        ctx.fillRect(ghost.x * CELL_SIZE + 5, ghost.y * CELL_SIZE + 5, 4, 6);
        ctx.fillRect(ghost.x * CELL_SIZE + 11, ghost.y * CELL_SIZE + 5, 4, 6);
      }
    });
  }, [maze, pacman, ghosts]);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setLives(3);
    setMaze(createMaze());
    setPacman({ x: 14, y: 23, direction: 0, nextDirection: 0 });
    setGhosts([
      { x: 13, y: 14, direction: 0, scared: false },
      { x: 14, y: 14, direction: 1, scared: false },
      { x: 13, y: 15, direction: 2, scared: false },
      { x: 14, y: 15, direction: 3, scared: false },
    ]);
    setPowerMode(false);
  };

  return (
    <GameLayout gameId="pacman">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4 gap-8">
            <div className="text-lg font-semibold">
              {t.score}: <span className="text-blue-600">{score}</span>
            </div>
            <div className="text-lg font-semibold">
              {t.lives || 'Lives'}: <span className="text-red-600">{'❤️'.repeat(lives)}</span>
            </div>
          </div>

          <canvas
            ref={canvasRef}
            width={GRID_WIDTH * CELL_SIZE}
            height={GRID_HEIGHT * CELL_SIZE}
            className="border-4 border-gray-800 rounded"
          />

          {!gameStarted && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded">
              <button
                onClick={startGame}
                className="px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-xl font-bold"
              >
                {t.start}
              </button>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 rounded">
              <div className="text-white text-3xl font-bold mb-4">{t.gameOver}</div>
              <div className="text-white text-xl mb-6">{t.score}: {score}</div>
              <button
                onClick={startGame}
                className="px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-xl font-bold"
              >
                {t.restart}
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
          <h3 className="font-bold text-lg mb-2">{t.controls}</h3>
          <p className="text-gray-700">{t.games.pacman.controls}</p>
          <div className="mt-4 text-sm text-gray-600">
            <p>🟡 {t.games.pacman.description}</p>
            <p className="mt-2">• Small dots = 10 points</p>
            <p>• Power pellets = 50 points</p>
            <p>• Eating scared ghost = 200 points</p>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
