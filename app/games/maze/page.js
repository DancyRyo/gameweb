'use client';

import { useState, useEffect, useCallback } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const SIZE = 15;
const CELL_SIZE = 30;

export default function MazeGame() {
  const { t } = useLanguage();
  const [maze, setMaze] = useState([]);
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [won, setWon] = useState(false);
  const [moves, setMoves] = useState(0);

  const generateMaze = () => {
    // Simple maze generation using recursive backtracking
    const grid = Array(SIZE).fill().map(() => Array(SIZE).fill(1));

    const carve = (x, y) => {
      grid[y][x] = 0;
      const directions = [
        [0, -2], [2, 0], [0, 2], [-2, 0]
      ].sort(() => Math.random() - 0.5);

      for (let [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx > 0 && nx < SIZE && ny > 0 && ny < SIZE && grid[ny][nx] === 1) {
          grid[y + dy / 2][x + dx / 2] = 0;
          carve(nx, ny);
        }
      }
    };

    carve(1, 1);
    grid[1][1] = 0; // start
    grid[SIZE - 2][SIZE - 2] = 0; // end

    return grid;
  };

  const initGame = () => {
    const newMaze = generateMaze();
    setMaze(newMaze);
    setPlayerPos({ x: 1, y: 1 });
    setWon(false);
    setMoves(0);
  };

  useEffect(() => {
    initGame();
  }, []);

  const movePlayer = useCallback((dx, dy) => {
    if (won) return;

    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;

    if (
      newX >= 0 &&
      newX < SIZE &&
      newY >= 0 &&
      newY < SIZE &&
      maze[newY] &&
      maze[newY][newX] === 0
    ) {
      setPlayerPos({ x: newX, y: newY });
      setMoves(moves + 1);

      if (newX === SIZE - 2 && newY === SIZE - 2) {
        setWon(true);
      }
    }
  }, [playerPos, maze, won, moves]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      const keyMap = {
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0]
      };

      if (keyMap[e.key]) {
        e.preventDefault();
        const [dx, dy] = keyMap[e.key];
        movePlayer(dx, dy);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [movePlayer]);

  return (
    <GameLayout gameId="maze">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl">
          <div className="flex justify-between items-center mb-4">
            <div className="text-lg font-semibold text-gray-700">
              {t.language === 'en' ? 'Moves' : '移动次数'}: <span className="text-blue-600">{moves}</span>
            </div>
            {won && (
              <div className="text-xl font-bold text-green-600">
                {t.youWin}
              </div>
            )}
          </div>

          <div className="flex justify-center mb-4">
            <div
              className="inline-grid gap-0 border-4 border-gray-800"
              style={{
                gridTemplateColumns: `repeat(${SIZE}, ${CELL_SIZE}px)`,
                width: SIZE * CELL_SIZE,
                height: SIZE * CELL_SIZE
              }}
            >
              {maze.map((row, y) =>
                row.map((cell, x) => (
                  <div
                    key={`${y}-${x}`}
                    className={`${
                      x === playerPos.x && y === playerPos.y
                        ? 'bg-blue-500'
                        : x === SIZE - 2 && y === SIZE - 2
                        ? 'bg-green-500'
                        : cell === 1
                        ? 'bg-gray-800'
                        : 'bg-white'
                    }`}
                    style={{
                      width: CELL_SIZE,
                      height: CELL_SIZE
                    }}
                  >
                    {x === playerPos.x && y === playerPos.y && (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold">
                        😊
                      </div>
                    )}
                    {x === SIZE - 2 && y === SIZE - 2 && (
                      <div className="w-full h-full flex items-center justify-center">
                        🎯
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={initGame}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              {t.restart}
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">{t.controls}</h3>
            <p className="text-gray-600">{t.games.maze.controls}</p>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
