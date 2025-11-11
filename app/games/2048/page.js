'use client';

import { useState, useEffect, useCallback } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const SIZE = 4;

const TILE_COLORS = {
  0: 'bg-gray-300',
  2: 'bg-amber-100',
  4: 'bg-amber-200',
  8: 'bg-orange-300',
  16: 'bg-orange-400',
  32: 'bg-orange-500',
  64: 'bg-red-400',
  128: 'bg-yellow-300',
  256: 'bg-yellow-400',
  512: 'bg-yellow-500',
  1024: 'bg-yellow-600',
  2048: 'bg-yellow-700'
};

export default function Game2048() {
  const { t } = useLanguage();
  const [board, setBoard] = useState([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('2048HighScore');
    if (saved) setHighScore(parseInt(saved));
    initGame();
  }, []);

  const initGame = () => {
    const newBoard = Array(SIZE).fill().map(() => Array(SIZE).fill(0));
    addRandomTile(newBoard);
    addRandomTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
    setWon(false);
  };

  const addRandomTile = (grid) => {
    const emptyCells = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (grid[r][c] === 0) {
          emptyCells.push({ r, c });
        }
      }
    }
    if (emptyCells.length > 0) {
      const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      grid[r][c] = Math.random() < 0.9 ? 2 : 4;
    }
  };

  const move = useCallback((direction) => {
    if (gameOver) return;

    let newBoard = board.map(row => [...row]);
    let moved = false;
    let points = 0;

    const moveLeft = (grid) => {
      let hasChanged = false;
      for (let r = 0; r < SIZE; r++) {
        const row = grid[r].filter(val => val !== 0);
        for (let i = 0; i < row.length - 1; i++) {
          if (row[i] === row[i + 1]) {
            row[i] *= 2;
            points += row[i];
            if (row[i] === 2048 && !won) setWon(true);
            row.splice(i + 1, 1);
          }
        }
        while (row.length < SIZE) row.push(0);
        if (JSON.stringify(grid[r]) !== JSON.stringify(row)) {
          hasChanged = true;
        }
        grid[r] = row;
      }
      return hasChanged;
    };

    const rotateBoard = (grid) => {
      return grid[0].map((_, i) => grid.map(row => row[i]).reverse());
    };

    const rotateBackBoard = (grid, times) => {
      let result = grid;
      for (let i = 0; i < times; i++) {
        result = rotateBoard(rotateBoard(rotateBoard(result)));
      }
      return result;
    };

    if (direction === 'left') {
      moved = moveLeft(newBoard);
    } else if (direction === 'right') {
      newBoard = rotateBoard(rotateBoard(newBoard));
      moved = moveLeft(newBoard);
      newBoard = rotateBoard(rotateBoard(newBoard));
    } else if (direction === 'up') {
      newBoard = rotateBoard(rotateBoard(rotateBoard(newBoard)));
      moved = moveLeft(newBoard);
      newBoard = rotateBoard(newBoard);
    } else if (direction === 'down') {
      newBoard = rotateBoard(newBoard);
      moved = moveLeft(newBoard);
      newBoard = rotateBackBoard(newBoard, 1);
    }

    if (moved) {
      addRandomTile(newBoard);
      setBoard(newBoard);
      setScore(prev => {
        const newScore = prev + points;
        if (newScore > highScore) {
          setHighScore(newScore);
          localStorage.setItem('2048HighScore', newScore.toString());
        }
        return newScore;
      });

      // Check if game over
      if (!canMove(newBoard)) {
        setGameOver(true);
      }
    }
  }, [board, gameOver, won, highScore]);

  const canMove = (grid) => {
    // Check for empty cells
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (grid[r][c] === 0) return true;
      }
    }
    // Check for possible merges
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (
          (r < SIZE - 1 && grid[r][c] === grid[r + 1][c]) ||
          (c < SIZE - 1 && grid[r][c] === grid[r][c + 1])
        ) {
          return true;
        }
      }
    }
    return false;
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      const keyMap = {
        ArrowLeft: 'left',
        ArrowRight: 'right',
        ArrowUp: 'up',
        ArrowDown: 'down'
      };

      if (keyMap[e.key]) {
        e.preventDefault();
        move(keyMap[e.key]);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [move]);

  return (
    <GameLayout gameId="2048">
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
            <div className="bg-gray-400 p-2 rounded-lg inline-block">
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${SIZE}, 80px)` }}>
                {board.map((row, r) =>
                  row.map((cell, c) => (
                    <div
                      key={`${r}-${c}`}
                      className={`w-20 h-20 ${TILE_COLORS[cell] || 'bg-purple-600'} rounded-lg flex items-center justify-center text-2xl font-bold ${cell > 4 ? 'text-white' : 'text-gray-700'} transition-all`}
                    >
                      {cell !== 0 && cell}
                    </div>
                  ))
                )}
              </div>

              {(gameOver || won) && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                  <div className="text-center">
                    <div className="text-white text-3xl font-bold mb-4">
                      {won ? t.youWin : t.gameOver}
                    </div>
                    <div className="text-white text-xl">
                      {t.score}: {score}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={initGame}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              {t.restart}
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">{t.controls}</h3>
            <p className="text-gray-600">{t.games['2048'].controls}</p>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
