'use client';

import { useState, useEffect } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const BOARD_SIZE = 8;
const CANDIES = ['🍬', '🍭', '🍫', '🍩', '🧁', '🍪'];

export default function CandyCrushGame() {
  const { t } = useLanguage();
  const [board, setBoard] = useState([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [selectedCell, setSelectedCell] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('candycrushHighScore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const createBoard = () => {
    const newBoard = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      const row = [];
      for (let j = 0; j < BOARD_SIZE; j++) {
        row.push({
          candy: CANDIES[Math.floor(Math.random() * CANDIES.length)],
          matched: false
        });
      }
      newBoard.push(row);
    }
    return newBoard;
  };

  const startGame = () => {
    setBoard(createBoard());
    setScore(0);
    setSelectedCell(null);
    setIsPlaying(true);
  };

  const checkMatches = (currentBoard) => {
    let newBoard = JSON.parse(JSON.stringify(currentBoard));
    let foundMatch = false;

    // Check horizontal matches
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE - 2; j++) {
        const candy = newBoard[i][j].candy;
        if (
          candy === newBoard[i][j + 1].candy &&
          candy === newBoard[i][j + 2].candy
        ) {
          newBoard[i][j].matched = true;
          newBoard[i][j + 1].matched = true;
          newBoard[i][j + 2].matched = true;
          foundMatch = true;
        }
      }
    }

    // Check vertical matches
    for (let i = 0; i < BOARD_SIZE - 2; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        const candy = newBoard[i][j].candy;
        if (
          candy === newBoard[i + 1][j].candy &&
          candy === newBoard[i + 2][j].candy
        ) {
          newBoard[i][j].matched = true;
          newBoard[i + 1][j].matched = true;
          newBoard[i + 2][j].matched = true;
          foundMatch = true;
        }
      }
    }

    return { newBoard, foundMatch };
  };

  const removeMatches = (currentBoard) => {
    let matchCount = 0;
    const newBoard = currentBoard.map((row, i) =>
      row.map((cell, j) => {
        if (cell.matched) {
          matchCount++;
          return { candy: null, matched: false };
        }
        return cell;
      })
    );

    if (matchCount > 0) {
      setScore(prev => prev + matchCount * 10);
    }

    return newBoard;
  };

  const dropCandies = (currentBoard) => {
    const newBoard = JSON.parse(JSON.stringify(currentBoard));

    for (let j = 0; j < BOARD_SIZE; j++) {
      let emptySpaces = 0;
      for (let i = BOARD_SIZE - 1; i >= 0; i--) {
        if (newBoard[i][j].candy === null) {
          emptySpaces++;
        } else if (emptySpaces > 0) {
          newBoard[i + emptySpaces][j] = newBoard[i][j];
          newBoard[i][j] = { candy: null, matched: false };
        }
      }

      for (let i = 0; i < emptySpaces; i++) {
        newBoard[i][j] = {
          candy: CANDIES[Math.floor(Math.random() * CANDIES.length)],
          matched: false
        };
      }
    }

    return newBoard;
  };

  const processMatches = (currentBoard) => {
    const { newBoard, foundMatch } = checkMatches(currentBoard);
    if (foundMatch) {
      setTimeout(() => {
        const boardAfterRemoval = removeMatches(newBoard);
        setTimeout(() => {
          const boardAfterDrop = dropCandies(boardAfterRemoval);
          setBoard(boardAfterDrop);
          // Check for cascading matches
          setTimeout(() => processMatches(boardAfterDrop), 300);
        }, 300);
      }, 300);
      setBoard(newBoard);
    }
  };

  const handleCellClick = (row, col) => {
    if (!isPlaying) return;

    if (selectedCell === null) {
      setSelectedCell({ row, col });
    } else {
      const { row: prevRow, col: prevCol } = selectedCell;
      const isAdjacent =
        (Math.abs(row - prevRow) === 1 && col === prevCol) ||
        (Math.abs(col - prevCol) === 1 && row === prevRow);

      if (isAdjacent) {
        const newBoard = JSON.parse(JSON.stringify(board));
        const temp = newBoard[row][col];
        newBoard[row][col] = newBoard[prevRow][prevCol];
        newBoard[prevRow][prevCol] = temp;
        setBoard(newBoard);
        setSelectedCell(null);

        setTimeout(() => processMatches(newBoard), 100);
      } else {
        setSelectedCell({ row, col });
      }
    }
  };

  useEffect(() => {
    if (isPlaying && score > highScore) {
      setHighScore(score);
      localStorage.setItem('candycrushHighScore', score.toString());
    }
  }, [score, highScore, isPlaying]);

  return (
    <GameLayout gameId="candycrush">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl">
          <div className="flex justify-between items-center mb-6">
            <div className="text-lg font-semibold text-gray-700">
              {t.score}: <span className="text-blue-600">{score}</span>
            </div>
            <div className="text-lg font-semibold text-gray-700">
              {t.highScore}: <span className="text-purple-600">{highScore}</span>
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <div className="inline-block bg-gradient-to-br from-pink-200 to-purple-200 p-4 rounded-xl">
              {board.map((row, i) => (
                <div key={i} className="flex">
                  {row.map((cell, j) => (
                    <button
                      key={`${i}-${j}`}
                      onClick={() => handleCellClick(i, j)}
                      className={`
                        w-14 h-14 m-1 rounded-lg text-4xl transition-all
                        ${cell.matched ? 'bg-yellow-300 scale-110' : 'bg-white hover:bg-gray-100'}
                        ${selectedCell?.row === i && selectedCell?.col === j ? 'ring-4 ring-blue-500' : ''}
                      `}
                    >
                      {cell.candy}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            {!isPlaying ? (
              <button
                onClick={startGame}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                {t.start}
              </button>
            ) : (
              <button
                onClick={() => setIsPlaying(false)}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
              >
                End Game
              </button>
            )}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">{t.controls}</h3>
            <p className="text-gray-600">{t.games.candycrush.controls}</p>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
