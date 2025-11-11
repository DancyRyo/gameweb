'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const ROWS = 20;
const COLS = 10;
const CELL_SIZE = 25;

const SHAPES = [
  [[1, 1, 1, 1]], // I
  [[1, 1], [1, 1]], // O
  [[0, 1, 0], [1, 1, 1]], // T
  [[1, 0, 0], [1, 1, 1]], // L
  [[0, 0, 1], [1, 1, 1]], // J
  [[0, 1, 1], [1, 1, 0]], // S
  [[1, 1, 0], [0, 1, 1]]  // Z
];

const COLORS = ['#00f0f0', '#f0f000', '#a000f0', '#f0a000', '#0000f0', '#00f000', '#f00000'];

export default function TetrisGame() {
  const { t } = useLanguage();
  const [board, setBoard] = useState(Array(ROWS).fill().map(() => Array(COLS).fill(0)));
  const [currentPiece, setCurrentPiece] = useState(null);
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [lines, setLines] = useState(0);
  const gameLoopRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('tetrisHighScore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const createPiece = useCallback(() => {
    const shapeIndex = Math.floor(Math.random() * SHAPES.length);
    return {
      shape: SHAPES[shapeIndex],
      color: COLORS[shapeIndex]
    };
  }, []);

  const canMove = useCallback((piece, pos, newBoard = board) => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = pos.x + x;
          const newY = pos.y + y;
          if (
            newX < 0 ||
            newX >= COLS ||
            newY >= ROWS ||
            (newY >= 0 && newBoard[newY][newX])
          ) {
            return false;
          }
        }
      }
    }
    return true;
  }, [board]);

  const rotatePiece = useCallback((piece) => {
    const rotated = piece.shape[0].map((_, i) =>
      piece.shape.map(row => row[i]).reverse()
    );
    return { ...piece, shape: rotated };
  }, []);

  const mergePiece = useCallback(() => {
    const newBoard = board.map(row => [...row]);
    currentPiece.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          const boardY = currentPos.y + y;
          const boardX = currentPos.x + x;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = currentPiece.color;
          }
        }
      });
    });

    // Check for complete lines
    let linesCleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
      if (newBoard[y].every(cell => cell !== 0)) {
        newBoard.splice(y, 1);
        newBoard.unshift(Array(COLS).fill(0));
        linesCleared++;
        y++;
      }
    }

    if (linesCleared > 0) {
      const points = [0, 100, 300, 500, 800][linesCleared];
      setScore(prev => {
        const newScore = prev + points;
        if (newScore > highScore) {
          setHighScore(newScore);
          localStorage.setItem('tetrisHighScore', newScore.toString());
        }
        return newScore;
      });
      setLines(prev => prev + linesCleared);
    }

    setBoard(newBoard);

    // Create new piece
    const newPiece = createPiece();
    const newPos = { x: Math.floor(COLS / 2) - 1, y: 0 };

    if (!canMove(newPiece, newPos, newBoard)) {
      setGameOver(true);
      setIsPlaying(false);
    } else {
      setCurrentPiece(newPiece);
      setCurrentPos(newPos);
    }
  }, [board, currentPiece, currentPos, canMove, createPiece, highScore]);

  const moveDown = useCallback(() => {
    if (!currentPiece) return;

    const newPos = { ...currentPos, y: currentPos.y + 1 };
    if (canMove(currentPiece, newPos)) {
      setCurrentPos(newPos);
    } else {
      mergePiece();
    }
  }, [currentPiece, currentPos, canMove, mergePiece]);

  const moveHorizontal = useCallback((direction) => {
    if (!currentPiece) return;
    const newPos = { ...currentPos, x: currentPos.x + direction };
    if (canMove(currentPiece, newPos)) {
      setCurrentPos(newPos);
    }
  }, [currentPiece, currentPos, canMove]);

  const rotate = useCallback(() => {
    if (!currentPiece) return;
    const rotated = rotatePiece(currentPiece);
    if (canMove(rotated, currentPos)) {
      setCurrentPiece(rotated);
    }
  }, [currentPiece, currentPos, canMove, rotatePiece]);

  const startGame = () => {
    const newBoard = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    const newPiece = createPiece();
    const newPos = { x: Math.floor(COLS / 2) - 1, y: 0 };

    setBoard(newBoard);
    setCurrentPiece(newPiece);
    setCurrentPos(newPos);
    setScore(0);
    setLines(0);
    setGameOver(false);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  useEffect(() => {
    if (isPlaying && !isPaused && !gameOver) {
      gameLoopRef.current = setInterval(moveDown, 800);
      return () => clearInterval(gameLoopRef.current);
    }
  }, [isPlaying, isPaused, gameOver, moveDown]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isPlaying || gameOver) return;

      if (e.key === ' ') {
        e.preventDefault();
        togglePause();
        return;
      }

      if (isPaused) return;

      const keyMap = {
        ArrowLeft: () => moveHorizontal(-1),
        ArrowRight: () => moveHorizontal(1),
        ArrowDown: moveDown,
        ArrowUp: rotate
      };

      if (keyMap[e.key]) {
        e.preventDefault();
        keyMap[e.key]();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, gameOver, isPaused, moveHorizontal, moveDown, rotate]);

  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);

    if (currentPiece) {
      currentPiece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell) {
            const boardY = currentPos.y + y;
            const boardX = currentPos.x + x;
            if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
              displayBoard[boardY][boardX] = currentPiece.color;
            }
          }
        });
      });
    }

    return displayBoard;
  };

  return (
    <GameLayout gameId="tetris">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl">
          <div className="flex justify-between items-center mb-4">
            <div className="text-lg font-semibold text-gray-700">
              {t.score}: <span className="text-blue-600">{score}</span>
            </div>
            <div className="text-lg font-semibold text-gray-700">
              {t.language === 'en' ? 'Lines' : '行数'}: <span className="text-green-600">{lines}</span>
            </div>
            <div className="text-lg font-semibold text-gray-700">
              {t.highScore}: <span className="text-purple-600">{highScore}</span>
            </div>
          </div>

          <div className="flex justify-center mb-4">
            <div
              className="border-4 border-gray-800 bg-gray-900"
              style={{
                width: COLS * CELL_SIZE,
                height: ROWS * CELL_SIZE,
                position: 'relative',
                display: 'grid',
                gridTemplateRows: `repeat(${ROWS}, ${CELL_SIZE}px)`,
                gridTemplateColumns: `repeat(${COLS}, ${CELL_SIZE}px)`
              }}
            >
              {renderBoard().map((row, y) =>
                row.map((cell, x) => (
                  <div
                    key={`${y}-${x}`}
                    style={{
                      backgroundColor: cell || '#1f2937',
                      border: '1px solid #374151'
                    }}
                  />
                ))
              )}

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

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">{t.controls}</h3>
            <p className="text-gray-600">{t.games.tetris.controls}</p>
            <p className="text-gray-600 mt-2">
              {t.language === 'en' ? 'Press Space to pause/resume' : '按空格键暂停/继续'}
            </p>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
