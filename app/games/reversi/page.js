'use client';

import { useState, useCallback } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const BOARD_SIZE = 8;
const EMPTY = 0;
const BLACK = 1;
const WHITE = 2;

const createBoard = () => {
  const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(EMPTY));
  // Initial position
  board[3][3] = WHITE;
  board[3][4] = BLACK;
  board[4][3] = BLACK;
  board[4][4] = WHITE;
  return board;
};

export default function ReversiGame() {
  const { t } = useLanguage();
  const [board, setBoard] = useState(createBoard());
  const [currentPlayer, setCurrentPlayer] = useState(BLACK);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [scores, setScores] = useState({ black: 2, white: 2 });
  const [validMoves, setValidMoves] = useState([]);

  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];

  const isValidMove = useCallback((board, row, col, player) => {
    if (board[row][col] !== EMPTY) return false;

    const opponent = player === BLACK ? WHITE : BLACK;
    let hasFlip = false;

    for (const [dr, dc] of directions) {
      let r = row + dr;
      let c = col + dc;
      let foundOpponent = false;

      while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
        if (board[r][c] === EMPTY) break;
        if (board[r][c] === opponent) {
          foundOpponent = true;
        } else if (board[r][c] === player && foundOpponent) {
          hasFlip = true;
          break;
        } else {
          break;
        }
        r += dr;
        c += dc;
      }
    }

    return hasFlip;
  }, []);

  const getValidMoves = useCallback((board, player) => {
    const moves = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (isValidMove(board, row, col, player)) {
          moves.push([row, col]);
        }
      }
    }
    return moves;
  }, [isValidMove]);

  const flipPieces = useCallback((board, row, col, player) => {
    const newBoard = board.map(row => [...row]);
    newBoard[row][col] = player;

    const opponent = player === BLACK ? WHITE : BLACK;

    for (const [dr, dc] of directions) {
      let r = row + dr;
      let c = col + dc;
      const toFlip = [];

      while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
        if (newBoard[r][c] === EMPTY) break;
        if (newBoard[r][c] === opponent) {
          toFlip.push([r, c]);
        } else if (newBoard[r][c] === player && toFlip.length > 0) {
          toFlip.forEach(([fr, fc]) => {
            newBoard[fr][fc] = player;
          });
          break;
        } else {
          break;
        }
        r += dr;
        c += dc;
      }
    }

    return newBoard;
  }, []);

  const calculateScores = useCallback((board) => {
    let black = 0, white = 0;
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col] === BLACK) black++;
        if (board[row][col] === WHITE) white++;
      }
    }
    return { black, white };
  }, []);

  const handleCellClick = (row, col) => {
    if (!gameStarted || gameOver) return;
    if (!isValidMove(board, row, col, currentPlayer)) return;

    const newBoard = flipPieces(board, row, col, currentPlayer);
    setBoard(newBoard);

    const newScores = calculateScores(newBoard);
    setScores(newScores);

    // Switch player
    const nextPlayer = currentPlayer === BLACK ? WHITE : BLACK;
    const nextMoves = getValidMoves(newBoard, nextPlayer);

    if (nextMoves.length === 0) {
      // Next player has no moves, check current player
      const currentMoves = getValidMoves(newBoard, currentPlayer);
      if (currentMoves.length === 0) {
        // Game over
        setGameOver(true);
      } else {
        // Skip next player's turn
        setValidMoves(currentMoves);
      }
    } else {
      setCurrentPlayer(nextPlayer);
      setValidMoves(nextMoves);
    }
  };

  const startGame = () => {
    const initialBoard = createBoard();
    setBoard(initialBoard);
    setCurrentPlayer(BLACK);
    setGameStarted(true);
    setGameOver(false);
    setScores({ black: 2, white: 2 });
    setValidMoves(getValidMoves(initialBoard, BLACK));
  };

  const isValidMoveCell = (row, col) => {
    return validMoves.some(([r, c]) => r === row && c === col);
  };

  return (
    <GameLayout gameId="reversi">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4 gap-12">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">{t.games.reversi.name.split('/')[0]} (Black)</div>
              <div className="text-2xl font-bold">⚫ {scores.black}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">White</div>
              <div className="text-2xl font-bold">⚪ {scores.white}</div>
            </div>
          </div>

          {gameStarted && !gameOver && (
            <div className="text-center mb-4 text-lg font-semibold">
              {currentPlayer === BLACK ? '⚫ Black' : '⚪ White'}'s Turn
            </div>
          )}

          <div className="bg-green-700 p-2 rounded inline-block">
            <div className="grid grid-cols-8 gap-0">
              {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    className={`w-12 h-12 border border-green-900 flex items-center justify-center
                      ${isValidMoveCell(rowIndex, colIndex) ? 'bg-green-400 hover:bg-green-300' : 'bg-green-600'}
                      ${cell !== EMPTY ? '' : 'hover:bg-green-500'}
                      transition-colors`}
                    disabled={!gameStarted || gameOver}
                  >
                    {cell === BLACK && (
                      <div className="w-10 h-10 bg-black rounded-full border-2 border-gray-800" />
                    )}
                    {cell === WHITE && (
                      <div className="w-10 h-10 bg-white rounded-full border-2 border-gray-300" />
                    )}
                    {isValidMoveCell(rowIndex, colIndex) && cell === EMPTY && (
                      <div className="w-3 h-3 bg-yellow-400 rounded-full opacity-70" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {!gameStarted && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded">
              <button
                onClick={startGame}
                className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xl font-bold"
              >
                {t.start}
              </button>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 rounded">
              <div className="text-white text-3xl font-bold mb-4">{t.gameOver}</div>
              <div className="text-white text-xl mb-2">
                ⚫ Black: {scores.black}
              </div>
              <div className="text-white text-xl mb-6">
                ⚪ White: {scores.white}
              </div>
              <div className="text-yellow-400 text-2xl font-bold mb-6">
                {scores.black > scores.white ? '⚫ Black Wins!' :
                 scores.white > scores.black ? '⚪ White Wins!' :
                 'Draw!'}
              </div>
              <button
                onClick={startGame}
                className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xl font-bold"
              >
                {t.restart}
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
          <h3 className="font-bold text-lg mb-2">{t.controls}</h3>
          <p className="text-gray-700 mb-4">{t.games.reversi.controls}</p>
          <div className="text-sm text-gray-600">
            <p>• {t.games.reversi.description}</p>
            <p className="mt-2">• Valid moves are highlighted in light green</p>
            <p>• You must place a disc to flip at least one opponent disc</p>
            <p>• The game ends when neither player can make a move</p>
            <p>• The player with the most discs wins</p>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
