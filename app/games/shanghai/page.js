'use client';

import { useState, useCallback } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const GRID_ROWS = 8;
const GRID_COLS = 12;
const TILE_SIZE = 50;

const TILE_TYPES = ['🀄', '🀅', '🀆', '🀇', '🀈', '🀉', '🀊', '🀋', '🀌', '🀍', '🀎', '🀏'];

const createGrid = () => {
  const totalTiles = GRID_ROWS * GRID_COLS;
  const tilesPerType = Math.floor(totalTiles / TILE_TYPES.length);
  const tiles = [];

  // Create pairs of tiles
  for (let i = 0; i < TILE_TYPES.length; i++) {
    for (let j = 0; j < tilesPerType / 2; j++) {
      tiles.push(TILE_TYPES[i]);
      tiles.push(TILE_TYPES[i]);
    }
  }

  // Shuffle tiles
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }

  // Create grid
  const grid = [];
  let index = 0;
  for (let row = 0; row < GRID_ROWS; row++) {
    const rowArray = [];
    for (let col = 0; col < GRID_COLS; col++) {
      rowArray.push({
        id: `${row}-${col}`,
        type: tiles[index],
        visible: true,
        row,
        col,
      });
      index++;
    }
    grid.push(rowArray);
  }

  return grid;
};

export default function ShanghaiGame() {
  const { t } = useLanguage();
  const [grid, setGrid] = useState(createGrid());
  const [selected, setSelected] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [score, setScore] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [path, setPath] = useState([]);

  const canConnect = useCallback((tile1, tile2, currentGrid) => {
    if (tile1.row === tile2.row && tile1.col === tile2.col) return false;
    if (tile1.type !== tile2.type) return false;

    // Check straight line connection
    if (tile1.row === tile2.row) {
      const minCol = Math.min(tile1.col, tile2.col);
      const maxCol = Math.max(tile1.col, tile2.col);
      let clear = true;
      for (let col = minCol + 1; col < maxCol; col++) {
        if (currentGrid[tile1.row][col].visible) {
          clear = false;
          break;
        }
      }
      if (clear) {
        setPath([
          { row: tile1.row, col: tile1.col },
          { row: tile2.row, col: tile2.col },
        ]);
        return true;
      }
    }

    if (tile1.col === tile2.col) {
      const minRow = Math.min(tile1.row, tile2.row);
      const maxRow = Math.max(tile1.row, tile2.row);
      let clear = true;
      for (let row = minRow + 1; row < maxRow; row++) {
        if (currentGrid[row][tile1.col].visible) {
          clear = false;
          break;
        }
      }
      if (clear) {
        setPath([
          { row: tile1.row, col: tile1.col },
          { row: tile2.row, col: tile2.col },
        ]);
        return true;
      }
    }

    // Check one-turn connection
    // Try corner at (tile1.row, tile2.col)
    if (currentGrid[tile1.row][tile2.col].visible === false ||
        (tile1.row === tile2.row || tile1.col === tile2.col)) {
      const corner1 = { row: tile1.row, col: tile2.col };
      if (!currentGrid[corner1.row][corner1.col].visible ||
          (corner1.row === tile1.row && corner1.col === tile1.col) ||
          (corner1.row === tile2.row && corner1.col === tile2.col)) {

        // Check path from tile1 to corner
        const minCol1 = Math.min(tile1.col, corner1.col);
        const maxCol1 = Math.max(tile1.col, corner1.col);
        let clear1 = true;
        for (let col = minCol1 + 1; col < maxCol1; col++) {
          if (currentGrid[tile1.row][col].visible) {
            clear1 = false;
            break;
          }
        }

        // Check path from corner to tile2
        const minRow2 = Math.min(corner1.row, tile2.row);
        const maxRow2 = Math.max(corner1.row, tile2.row);
        let clear2 = true;
        for (let row = minRow2 + 1; row < maxRow2; row++) {
          if (currentGrid[row][corner1.col].visible) {
            clear2 = false;
            break;
          }
        }

        if (clear1 && clear2) {
          setPath([
            { row: tile1.row, col: tile1.col },
            { row: corner1.row, col: corner1.col },
            { row: tile2.row, col: tile2.col },
          ]);
          return true;
        }
      }
    }

    // Try corner at (tile2.row, tile1.col)
    if (currentGrid[tile2.row][tile1.col].visible === false ||
        (tile1.row === tile2.row || tile1.col === tile2.col)) {
      const corner2 = { row: tile2.row, col: tile1.col };
      if (!currentGrid[corner2.row][corner2.col].visible ||
          (corner2.row === tile1.row && corner2.col === tile1.col) ||
          (corner2.row === tile2.row && corner2.col === tile2.col)) {

        // Check path from tile1 to corner
        const minRow1 = Math.min(tile1.row, corner2.row);
        const maxRow1 = Math.max(tile1.row, corner2.row);
        let clear1 = true;
        for (let row = minRow1 + 1; row < maxRow1; row++) {
          if (currentGrid[row][tile1.col].visible) {
            clear1 = false;
            break;
          }
        }

        // Check path from corner to tile2
        const minCol2 = Math.min(corner2.col, tile2.col);
        const maxCol2 = Math.max(corner2.col, tile2.col);
        let clear2 = true;
        for (let col = minCol2 + 1; col < maxCol2; col++) {
          if (currentGrid[corner2.row][col].visible) {
            clear2 = false;
            break;
          }
        }

        if (clear1 && clear2) {
          setPath([
            { row: tile1.row, col: tile1.col },
            { row: corner2.row, col: corner2.col },
            { row: tile2.row, col: tile2.col },
          ]);
          return true;
        }
      }
    }

    return false;
  }, []);

  const handleTileClick = (tile) => {
    if (!gameStarted || gameWon || !tile.visible) return;

    if (!selected) {
      setSelected(tile);
      setPath([]);
    } else {
      if (selected.id === tile.id) {
        setSelected(null);
        setPath([]);
        return;
      }

      if (canConnect(selected, tile, grid)) {
        // Match found
        setGrid(prevGrid => {
          const newGrid = prevGrid.map(row =>
            row.map(t => {
              if (t.id === selected.id || t.id === tile.id) {
                return { ...t, visible: false };
              }
              return t;
            })
          );

          // Check win condition
          const allHidden = newGrid.every(row => row.every(t => !t.visible));
          if (allHidden) {
            setGameWon(true);
          }

          return newGrid;
        });

        setScore(s => s + 100);
        setMatchedPairs(m => m + 1);

        setTimeout(() => {
          setPath([]);
          setSelected(null);
        }, 300);
      } else {
        setSelected(tile);
        setPath([]);
      }
    }
  };

  const startGame = () => {
    setGrid(createGrid());
    setSelected(null);
    setGameStarted(true);
    setGameWon(false);
    setScore(0);
    setMatchedPairs(0);
    setPath([]);
  };

  const isInPath = (row, col) => {
    return path.some(p => p.row === row && p.col === col);
  };

  return (
    <GameLayout gameId="shanghai">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6 relative">
          <div className="flex justify-between items-center mb-4 gap-8">
            <div className="text-lg font-semibold">
              {t.score}: <span className="text-blue-600">{score}</span>
            </div>
            <div className="text-lg font-semibold">
              Pairs: <span className="text-green-600">{matchedPairs}</span>
            </div>
          </div>

          <div
            className="bg-amber-100 p-4 rounded-lg inline-block"
            style={{
              width: GRID_COLS * (TILE_SIZE + 4) + 32,
            }}
          >
            <svg
              width={GRID_COLS * (TILE_SIZE + 4)}
              height={GRID_ROWS * (TILE_SIZE + 4)}
              className="absolute pointer-events-none"
              style={{ zIndex: 1 }}
            >
              {path.length > 1 && (
                <polyline
                  points={path.map(p =>
                    `${p.col * (TILE_SIZE + 4) + TILE_SIZE / 2 + 16},${p.row * (TILE_SIZE + 4) + TILE_SIZE / 2 + 16}`
                  ).join(' ')}
                  fill="none"
                  stroke="#FF6B6B"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>

            <div className="grid gap-1" style={{
              gridTemplateColumns: `repeat(${GRID_COLS}, ${TILE_SIZE}px)`,
              position: 'relative',
              zIndex: 2,
            }}>
              {grid.map(row =>
                row.map(tile => (
                  <button
                    key={tile.id}
                    onClick={() => handleTileClick(tile)}
                    disabled={!gameStarted || gameWon}
                    className={`
                      w-[${TILE_SIZE}px] h-[${TILE_SIZE}px]
                      flex items-center justify-center text-2xl
                      rounded transition-all
                      ${tile.visible ? 'bg-white shadow-md hover:shadow-lg' : 'bg-transparent'}
                      ${selected?.id === tile.id ? 'ring-4 ring-yellow-400 scale-105' : ''}
                      ${isInPath(tile.row, tile.col) ? 'bg-red-100' : ''}
                      ${!tile.visible ? 'cursor-default' : 'cursor-pointer'}
                    `}
                    style={{
                      width: TILE_SIZE,
                      height: TILE_SIZE,
                      visibility: tile.visible ? 'visible' : 'hidden',
                    }}
                  >
                    {tile.visible && tile.type}
                  </button>
                ))
              )}
            </div>
          </div>

          {!gameStarted && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded">
              <button
                onClick={startGame}
                className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xl font-bold"
              >
                {t.start}
              </button>
            </div>
          )}

          {gameWon && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 rounded">
              <div className="text-white text-3xl font-bold mb-4">{t.youWin}</div>
              <div className="text-white text-xl mb-2">{t.score}: {score}</div>
              <div className="text-white text-xl mb-6">Pairs: {matchedPairs}</div>
              <button
                onClick={startGame}
                className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xl font-bold"
              >
                {t.restart}
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
          <h3 className="font-bold text-lg mb-2">{t.controls}</h3>
          <p className="text-gray-700 mb-4">{t.games.shanghai.controls}</p>
          <div className="text-sm text-gray-600">
            <p>• {t.games.shanghai.description}</p>
            <p className="mt-2">• Click two matching tiles to remove them</p>
            <p>• Tiles can connect with straight lines or one turn</p>
            <p>• Connection path cannot cross other tiles</p>
            <p>• Each pair = 100 points</p>
            <p>• Clear all tiles to win!</p>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
