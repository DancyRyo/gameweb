'use client';

import { useState, useCallback, useEffect } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const GRID_SIZE = 8;
const GEMS = ['💎', '💚', '❤️', '💙', '⭐', '🟡', '🟣'];
const CELL_SIZE = 60;

const createGrid = () => {
  const grid = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    const rowArray = [];
    for (let col = 0; col < GRID_SIZE; col++) {
      rowArray.push({
        id: `${row}-${col}`,
        type: GEMS[Math.floor(Math.random() * GEMS.length)],
        row,
        col,
      });
    }
    grid.push(rowArray);
  }
  return grid;
};

export default function BejeweledGame() {
  const { t } = useLanguage();
  const [grid, setGrid] = useState(createGrid());
  const [selected, setSelected] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [animating, setAnimating] = useState(false);

  const findMatches = useCallback((currentGrid) => {
    const matches = new Set();

    // Check horizontal matches
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE - 2; col++) {
        const gem1 = currentGrid[row][col];
        const gem2 = currentGrid[row][col + 1];
        const gem3 = currentGrid[row][col + 2];

        if (gem1.type === gem2.type && gem2.type === gem3.type) {
          matches.add(gem1.id);
          matches.add(gem2.id);
          matches.add(gem3.id);

          // Check for longer matches
          if (col + 3 < GRID_SIZE && currentGrid[row][col + 3].type === gem1.type) {
            matches.add(currentGrid[row][col + 3].id);
          }
          if (col + 4 < GRID_SIZE && currentGrid[row][col + 4].type === gem1.type) {
            matches.add(currentGrid[row][col + 4].id);
          }
        }
      }
    }

    // Check vertical matches
    for (let col = 0; col < GRID_SIZE; col++) {
      for (let row = 0; row < GRID_SIZE - 2; row++) {
        const gem1 = currentGrid[row][col];
        const gem2 = currentGrid[row + 1][col];
        const gem3 = currentGrid[row + 2][col];

        if (gem1.type === gem2.type && gem2.type === gem3.type) {
          matches.add(gem1.id);
          matches.add(gem2.id);
          matches.add(gem3.id);

          // Check for longer matches
          if (row + 3 < GRID_SIZE && currentGrid[row + 3][col].type === gem1.type) {
            matches.add(currentGrid[row + 3][col].id);
          }
          if (row + 4 < GRID_SIZE && currentGrid[row + 4][col].type === gem1.type) {
            matches.add(currentGrid[row + 4][col].id);
          }
        }
      }
    }

    return matches;
  }, []);

  const removeMatches = useCallback((currentGrid, matches) => {
    if (matches.size === 0) return currentGrid;

    const newGrid = currentGrid.map(row =>
      row.map(gem => (matches.has(gem.id) ? null : gem))
    );

    return newGrid;
  }, []);

  const dropGems = useCallback((currentGrid) => {
    const newGrid = currentGrid.map(row => [...row]);

    for (let col = 0; col < GRID_SIZE; col++) {
      let emptySpaces = 0;

      for (let row = GRID_SIZE - 1; row >= 0; row--) {
        if (newGrid[row][col] === null) {
          emptySpaces++;
        } else if (emptySpaces > 0) {
          newGrid[row + emptySpaces][col] = newGrid[row][col];
          newGrid[row][col] = null;
        }
      }

      // Fill top with new gems
      for (let row = 0; row < emptySpaces; row++) {
        newGrid[row][col] = {
          id: `new-${Date.now()}-${row}-${col}`,
          type: GEMS[Math.floor(Math.random() * GEMS.length)],
          row,
          col,
        };
      }
    }

    return newGrid;
  }, []);

  const processMatches = useCallback(() => {
    setAnimating(true);

    const processStep = () => {
      setGrid(currentGrid => {
        const matches = findMatches(currentGrid);

        if (matches.size > 0) {
          setScore(s => s + matches.size * 10);
          const withoutMatches = removeMatches(currentGrid, matches);
          const dropped = dropGems(withoutMatches);

          setTimeout(processStep, 300);
          return dropped;
        } else {
          setAnimating(false);
          return currentGrid;
        }
      });
    };

    setTimeout(processStep, 300);
  }, [findMatches, removeMatches, dropGems]);

  const isAdjacent = (gem1, gem2) => {
    return (
      (Math.abs(gem1.row - gem2.row) === 1 && gem1.col === gem2.col) ||
      (Math.abs(gem1.col - gem2.col) === 1 && gem1.row === gem2.row)
    );
  };

  const swapGems = useCallback((gem1, gem2) => {
    const newGrid = grid.map(row => [...row]);

    const temp = newGrid[gem1.row][gem1.col];
    newGrid[gem1.row][gem1.col] = newGrid[gem2.row][gem2.col];
    newGrid[gem2.row][gem2.col] = temp;

    // Update positions
    newGrid[gem1.row][gem1.col].row = gem1.row;
    newGrid[gem1.row][gem1.col].col = gem1.col;
    newGrid[gem2.row][gem2.col].row = gem2.row;
    newGrid[gem2.row][gem2.col].col = gem2.col;

    return newGrid;
  }, [grid]);

  const handleGemClick = (gem) => {
    if (!gameStarted || gameOver || animating) return;

    if (!selected) {
      setSelected(gem);
    } else {
      if (selected.id === gem.id) {
        setSelected(null);
        return;
      }

      if (isAdjacent(selected, gem)) {
        const swapped = swapGems(selected, gem);

        // Check if swap creates matches
        const matches = findMatches(swapped);

        if (matches.size > 0) {
          setGrid(swapped);
          setMoves(m => m - 1);
          setSelected(null);
          processMatches();
        } else {
          // Invalid move, swap back
          setSelected(null);
        }
      } else {
        setSelected(gem);
      }
    }
  };

  useEffect(() => {
    if (moves === 0 && !animating) {
      setGameOver(true);
    }
  }, [moves, animating]);

  const startGame = () => {
    const newGrid = createGrid();
    setGrid(newGrid);
    setSelected(null);
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setMoves(30);
    setAnimating(false);
  };

  return (
    <GameLayout gameId="bejeweled">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6 relative">
          <div className="flex justify-between items-center mb-4 gap-8">
            <div className="text-lg font-semibold">
              {t.score}: <span className="text-blue-600">{score}</span>
            </div>
            <div className="text-lg font-semibold">
              {t.moves || 'Moves'}: <span className="text-green-600">{moves}</span>
            </div>
          </div>

          <div
            className="bg-gradient-to-br from-purple-900 to-purple-700 p-4 rounded-lg inline-block"
            style={{
              width: GRID_SIZE * CELL_SIZE + 32,
            }}
          >
            <div className="grid gap-1" style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
            }}>
              {grid.map(row =>
                row.map(gem => gem && (
                  <button
                    key={gem.id}
                    onClick={() => handleGemClick(gem)}
                    disabled={!gameStarted || gameOver || animating}
                    className={`
                      w-[${CELL_SIZE}px] h-[${CELL_SIZE}px]
                      flex items-center justify-center text-4xl
                      rounded-lg transition-all
                      ${selected?.id === gem.id
                        ? 'bg-yellow-300 ring-4 ring-yellow-400 scale-110'
                        : 'bg-gradient-to-br from-purple-400 to-purple-600 hover:scale-105'
                      }
                      shadow-lg cursor-pointer
                    `}
                    style={{
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                    }}
                  >
                    {gem.type}
                  </button>
                ))
              )}
            </div>
          </div>

          {!gameStarted && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded">
              <button
                onClick={startGame}
                className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xl font-bold"
              >
                {t.start}
              </button>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 rounded">
              <div className="text-white text-3xl font-bold mb-4">{t.gameOver}</div>
              <div className="text-white text-xl mb-6">Final {t.score}: {score}</div>
              <button
                onClick={startGame}
                className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xl font-bold"
              >
                {t.restart}
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
          <h3 className="font-bold text-lg mb-2">{t.controls}</h3>
          <p className="text-gray-700 mb-4">{t.games.bejeweled.controls}</p>
          <div className="text-sm text-gray-600">
            <p>• {t.games.bejeweled.description}</p>
            <p className="mt-2">• Click two adjacent gems to swap them</p>
            <p>• Match 3+ of the same type to clear them</p>
            <p>• Each gem cleared = 10 points</p>
            <p>• Chain reactions give more points</p>
            <p>• Complete as many matches as possible in {moves} moves</p>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
