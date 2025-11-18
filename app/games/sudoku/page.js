'use client';

import { useState, useEffect } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

// Sudoku generator and solver
const generateSudoku = (difficulty) => {
  // Create a solved sudoku board
  const board = Array(9).fill(null).map(() => Array(9).fill(0));

  // Fill the board with a valid solution
  fillBoard(board);

  // Remove numbers based on difficulty
  const cellsToRemove = {
    easy: 30,
    medium: 45,
    hard: 55
  }[difficulty];

  const puzzle = board.map(row => [...row]);
  const solution = board.map(row => [...row]);

  let removed = 0;
  while (removed < cellsToRemove) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);

    if (puzzle[row][col] !== 0) {
      puzzle[row][col] = 0;
      removed++;
    }
  }

  return { puzzle, solution };
};

const fillBoard = (board) => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j] === 0) {
        const shuffled = numbers.sort(() => Math.random() - 0.5);

        for (let num of shuffled) {
          if (isValid(board, i, j, num)) {
            board[i][j] = num;

            if (fillBoard(board)) {
              return true;
            }

            board[i][j] = 0;
          }
        }

        return false;
      }
    }
  }

  return true;
};

const isValid = (board, row, col, num) => {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) return false;
  }

  // Check column
  for (let x = 0; x < 9; x++) {
    if (board[x][col] === num) return false;
  }

  // Check 3x3 box
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[startRow + i][startCol + j] === num) return false;
    }
  }

  return true;
};

export default function SudokuGame() {
  const { t } = useLanguage();
  const [difficulty, setDifficulty] = useState('medium');
  const [puzzle, setPuzzle] = useState(null);
  const [solution, setSolution] = useState(null);
  const [board, setBoard] = useState(null);
  const [initialBoard, setInitialBoard] = useState(null);
  const [selected, setSelected] = useState(null);
  const [mistakes, setMistakes] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [notes, setNotes] = useState({});
  const [notesMode, setNotesMode] = useState(false);

  useEffect(() => {
    if (isPlaying) {
      const timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isPlaying]);

  const startGame = () => {
    const { puzzle: newPuzzle, solution: newSolution } = generateSudoku(difficulty);
    setPuzzle(newPuzzle);
    setSolution(newSolution);
    setBoard(newPuzzle.map(row => [...row]));
    setInitialBoard(newPuzzle.map(row => [...row]));
    setMistakes(0);
    setIsComplete(false);
    setTimeElapsed(0);
    setIsPlaying(true);
    setSelected(null);
    setNotes({});
    setNotesMode(false);
  };

  const handleCellClick = (row, col) => {
    if (!isPlaying || isComplete) return;
    if (initialBoard[row][col] !== 0) return; // Can't modify initial numbers

    setSelected({ row, col });
  };

  const handleNumberClick = (num) => {
    if (!selected || !isPlaying || isComplete) return;
    const { row, col } = selected;

    if (initialBoard[row][col] !== 0) return;

    if (notesMode) {
      // Toggle note
      const key = `${row}-${col}`;
      setNotes(prev => {
        const cellNotes = prev[key] || [];
        const newNotes = cellNotes.includes(num)
          ? cellNotes.filter(n => n !== num)
          : [...cellNotes, num].sort();

        if (newNotes.length === 0) {
          const { [key]: _, ...rest } = prev;
          return rest;
        }

        return { ...prev, [key]: newNotes };
      });
    } else {
      // Place number
      const newBoard = board.map(row => [...row]);
      newBoard[row][col] = num;
      setBoard(newBoard);

      // Clear notes for this cell
      const key = `${row}-${col}`;
      if (notes[key]) {
        setNotes(prev => {
          const { [key]: _, ...rest } = prev;
          return rest;
        });
      }

      // Check if the number is correct
      if (num !== solution[row][col]) {
        setMistakes(prev => prev + 1);
      }

      // Check if puzzle is complete
      checkCompletion(newBoard);
    }
  };

  const handleClear = () => {
    if (!selected || !isPlaying || isComplete) return;
    const { row, col } = selected;

    if (initialBoard[row][col] !== 0) return;

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = 0;
    setBoard(newBoard);

    // Clear notes for this cell
    const key = `${row}-${col}`;
    if (notes[key]) {
      setNotes(prev => {
        const { [key]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const checkCompletion = (currentBoard) => {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (currentBoard[i][j] !== solution[i][j]) {
          return;
        }
      }
    }

    setIsComplete(true);
    setIsPlaying(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCellClassName = (row, col) => {
    const isInitial = initialBoard && initialBoard[row][col] !== 0;
    const isSelected = selected && selected.row === row && selected.col === col;
    const isHighlighted = selected && (selected.row === row || selected.col === col);
    const isSameNumber = selected && board[row][col] !== 0 && board[row][col] === board[selected.row][selected.col];
    const isWrong = board && solution && board[row][col] !== 0 && board[row][col] !== solution[row][col];

    let classes = 'w-12 h-12 flex items-center justify-center border border-gray-300 cursor-pointer transition-colors relative';

    if (isInitial) classes += ' bg-gray-100 font-bold text-gray-900';
    else classes += ' bg-white text-blue-600';

    if (isSelected) classes += ' bg-blue-200 ring-2 ring-blue-500';
    else if (isSameNumber) classes += ' bg-blue-100';
    else if (isHighlighted) classes += ' bg-gray-50';

    if (isWrong) classes += ' text-red-600';

    // Add thicker borders for 3x3 boxes
    if (row % 3 === 0) classes += ' border-t-2 border-t-gray-800';
    if (col % 3 === 0) classes += ' border-l-2 border-l-gray-800';
    if (row === 8) classes += ' border-b-2 border-b-gray-800';
    if (col === 8) classes += ' border-r-2 border-r-gray-800';

    return classes;
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!selected || !isPlaying || isComplete) return;

      const { row, col } = selected;

      // Number keys
      if (e.key >= '1' && e.key <= '9') {
        handleNumberClick(parseInt(e.key));
      }

      // Backspace or Delete to clear
      if (e.key === 'Backspace' || e.key === 'Delete') {
        handleClear();
      }

      // Arrow keys for navigation
      if (e.key === 'ArrowUp' && row > 0) {
        setSelected({ row: row - 1, col });
      }
      if (e.key === 'ArrowDown' && row < 8) {
        setSelected({ row: row + 1, col });
      }
      if (e.key === 'ArrowLeft' && col > 0) {
        setSelected({ row, col: col - 1 });
      }
      if (e.key === 'ArrowRight' && col < 8) {
        setSelected({ row, col: col + 1 });
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selected, isPlaying, isComplete, board, initialBoard, notesMode]);

  return (
    <GameLayout gameId="sudoku">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-4xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-lg font-semibold text-gray-700">
              {t.difficulty}:
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                disabled={isPlaying}
                className="ml-2 px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="easy">{t.easy}</option>
                <option value="medium">{t.medium}</option>
                <option value="hard">{t.hard}</option>
              </select>
            </div>
            <div className="text-lg font-semibold text-gray-700">
              Time: <span className="text-blue-600">{formatTime(timeElapsed)}</span>
            </div>
            <div className="text-lg font-semibold text-gray-700">
              Mistakes: <span className="text-red-600">{mistakes}</span>
            </div>
          </div>

          {/* Sudoku Board */}
          {board && (
            <div className="flex justify-center mb-6">
              <div className="inline-block bg-gray-800 p-1 rounded-lg">
                {board.map((row, i) => (
                  <div key={i} className="flex">
                    {row.map((cell, j) => {
                      const cellNotes = notes[`${i}-${j}`] || [];
                      return (
                        <div
                          key={j}
                          onClick={() => handleCellClick(i, j)}
                          className={getCellClassName(i, j)}
                        >
                          {cell !== 0 ? (
                            <span className="text-xl">{cell}</span>
                          ) : cellNotes.length > 0 ? (
                            <div className="grid grid-cols-3 gap-0 text-xs text-gray-400 absolute inset-0 p-0.5">
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                <div key={num} className="flex items-center justify-center">
                                  {cellNotes.includes(num) ? num : ''}
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Number Pad */}
          {isPlaying && !isComplete && (
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <button
                    key={num}
                    onClick={() => handleNumberClick(num)}
                    className="w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xl rounded-lg transition-colors shadow-md"
                  >
                    {num}
                  </button>
                ))}
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={handleClear}
                  className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={() => setNotesMode(!notesMode)}
                  className={`px-6 py-2 font-semibold rounded-lg transition-colors ${
                    notesMode
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                  }`}
                >
                  Notes {notesMode ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          )}

          {/* Game Complete Message */}
          {isComplete && (
            <div className="mb-6 p-6 bg-green-100 border-2 border-green-500 rounded-lg text-center">
              <div className="text-3xl font-bold text-green-700 mb-2">
                🎉 {t.youWin}
              </div>
              <div className="text-xl text-gray-700">
                Time: {formatTime(timeElapsed)} | Mistakes: {mistakes}
              </div>
            </div>
          )}

          {/* Start/Restart Button */}
          <div className="flex justify-center">
            <button
              onClick={startGame}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-lg transition-colors shadow-lg"
            >
              {isPlaying ? t.restart : t.start}
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">{t.controls}</h3>
            <p className="text-gray-600">{t.games.sudoku.controls}</p>
            <div className="mt-3 text-sm text-gray-600">
              <p>• Click a cell and press 1-9 to fill it</p>
              <p>• Use arrow keys to navigate</p>
              <p>• Press Backspace/Delete to clear</p>
              <p>• Toggle Notes mode to add pencil marks</p>
            </div>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
