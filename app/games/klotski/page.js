'use client';

import { useState, useCallback } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const CELL_SIZE = 60;

// Classic Klotski layout
const initialBlocks = [
  { id: 'cao', x: 1, y: 0, width: 2, height: 2, color: 'bg-red-500', isTarget: true }, // Cao Cao
  { id: 'zhangfei', x: 0, y: 0, width: 1, height: 2, color: 'bg-blue-500' },
  { id: 'zhaoyun', x: 3, y: 0, width: 1, height: 2, color: 'bg-blue-500' },
  { id: 'machao', x: 0, y: 2, width: 1, height: 2, color: 'bg-blue-500' },
  { id: 'huangzhong', x: 3, y: 2, width: 1, height: 2, color: 'bg-blue-500' },
  { id: 'guanyu', x: 1, y: 2, width: 2, height: 1, color: 'bg-green-500' },
  { id: 'soldier1', x: 1, y: 3, width: 1, height: 1, color: 'bg-yellow-500' },
  { id: 'soldier2', x: 2, y: 3, width: 1, height: 1, color: 'bg-yellow-500' },
  { id: 'soldier3', x: 0, y: 4, width: 1, height: 1, color: 'bg-yellow-500' },
  { id: 'soldier4', x: 3, y: 4, width: 1, height: 1, color: 'bg-yellow-500' },
];

const BOARD_WIDTH = 4;
const BOARD_HEIGHT = 5;

export default function KlotskiGame() {
  const { t } = useLanguage();
  const [blocks, setBlocks] = useState(initialBlocks);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [moves, setMoves] = useState(0);

  const isOccupied = useCallback((x, y, excludeId) => {
    return blocks.some(block => {
      if (block.id === excludeId) return false;
      return x >= block.x && x < block.x + block.width &&
             y >= block.y && y < block.y + block.height;
    });
  }, [blocks]);

  const canMove = useCallback((block, dx, dy) => {
    const newX = block.x + dx;
    const newY = block.y + dy;

    // Check board boundaries
    if (newX < 0 || newX + block.width > BOARD_WIDTH ||
        newY < 0 || newY + block.height > BOARD_HEIGHT) {
      return false;
    }

    // Check collisions
    for (let x = newX; x < newX + block.width; x++) {
      for (let y = newY; y < newY + block.height; y++) {
        if (isOccupied(x, y, block.id)) {
          return false;
        }
      }
    }

    return true;
  }, [isOccupied]);

  const moveBlock = useCallback((blockId, dx, dy) => {
    setBlocks(prevBlocks => {
      const newBlocks = prevBlocks.map(block => {
        if (block.id === blockId) {
          return { ...block, x: block.x + dx, y: block.y + dy };
        }
        return block;
      });

      // Check win condition (Cao Cao at exit position)
      const caoBlock = newBlocks.find(b => b.isTarget);
      if (caoBlock && caoBlock.x === 1 && caoBlock.y === 3) {
        setGameWon(true);
      }

      return newBlocks;
    });

    setMoves(m => m + 1);
  }, []);

  const handleBlockClick = (blockId) => {
    if (!gameStarted || gameWon) return;
    setSelectedBlock(blockId === selectedBlock ? null : blockId);
  };

  const handleCellClick = (x, y) => {
    if (!gameStarted || gameWon || !selectedBlock) return;

    const block = blocks.find(b => b.id === selectedBlock);
    if (!block) return;

    // Calculate direction
    const dx = x - block.x;
    const dy = y - block.y;

    // Only allow moves in one direction at a time
    if (Math.abs(dx) > 0 && Math.abs(dy) > 0) return;

    // Try to move step by step
    if (dx !== 0) {
      const direction = dx > 0 ? 1 : -1;
      for (let i = 0; i < Math.abs(dx); i++) {
        if (canMove(block, direction * (i + 1), 0)) {
          if (i === Math.abs(dx) - 1) {
            moveBlock(selectedBlock, dx, 0);
            setSelectedBlock(null);
          }
        } else {
          break;
        }
      }
    } else if (dy !== 0) {
      const direction = dy > 0 ? 1 : -1;
      for (let i = 0; i < Math.abs(dy); i++) {
        if (canMove(block, 0, direction * (i + 1))) {
          if (i === Math.abs(dy) - 1) {
            moveBlock(selectedBlock, 0, dy);
            setSelectedBlock(null);
          }
        } else {
          break;
        }
      }
    }
  };

  const handleKeyPress = useCallback((e) => {
    if (!gameStarted || gameWon || !selectedBlock) return;

    const block = blocks.find(b => b.id === selectedBlock);
    if (!block) return;

    let dx = 0, dy = 0;

    switch(e.key) {
      case 'ArrowLeft': dx = -1; break;
      case 'ArrowRight': dx = 1; break;
      case 'ArrowUp': dy = -1; break;
      case 'ArrowDown': dy = 1; break;
      default: return;
    }

    e.preventDefault();

    if (canMove(block, dx, dy)) {
      moveBlock(selectedBlock, dx, dy);
    }
  }, [gameStarted, gameWon, selectedBlock, blocks, canMove, moveBlock]);

  const startGame = () => {
    setBlocks(initialBlocks);
    setSelectedBlock(null);
    setGameStarted(true);
    setGameWon(false);
    setMoves(0);
  };

  return (
    <GameLayout gameId="klotski">
      <div className="flex flex-col items-center gap-6" onKeyDown={handleKeyPress} tabIndex={0}>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4 gap-8">
            <div className="text-lg font-semibold">
              {t.moves || 'Moves'}: <span className="text-blue-600">{moves}</span>
            </div>
          </div>

          <div
            className="relative bg-amber-800 border-4 border-amber-900 rounded-lg"
            style={{
              width: BOARD_WIDTH * CELL_SIZE + 20,
              height: BOARD_HEIGHT * CELL_SIZE + 20,
              padding: '10px',
            }}
          >
            {/* Exit marker */}
            <div
              className="absolute border-4 border-dashed border-yellow-300 bg-yellow-100 bg-opacity-30 rounded pointer-events-none z-0"
              style={{
                left: 1 * CELL_SIZE + 10,
                top: 3 * CELL_SIZE + 10,
                width: 2 * CELL_SIZE,
                height: 2 * CELL_SIZE,
              }}
            />

            {/* Grid cells for clicking */}
            <div className="absolute inset-0 grid grid-cols-4 grid-rows-5 p-2.5">
              {Array(BOARD_HEIGHT).fill(null).map((_, y) =>
                Array(BOARD_WIDTH).fill(null).map((_, x) => (
                  <div
                    key={`${x}-${y}`}
                    onClick={() => handleCellClick(x, y)}
                    className="border border-amber-700 border-opacity-30"
                  />
                ))
              )}
            </div>

            {/* Blocks */}
            {blocks.map(block => (
              <button
                key={block.id}
                onClick={() => handleBlockClick(block.id)}
                className={`absolute ${block.color} rounded-lg shadow-lg transition-all
                  ${selectedBlock === block.id ? 'ring-4 ring-white scale-105' : 'hover:brightness-110'}
                  flex items-center justify-center font-bold text-white z-10`}
                style={{
                  left: block.x * CELL_SIZE + 10,
                  top: block.y * CELL_SIZE + 10,
                  width: block.width * CELL_SIZE - 4,
                  height: block.height * CELL_SIZE - 4,
                  fontSize: block.width === 2 ? '20px' : '14px',
                }}
              >
                {block.isTarget && '曹操'}
                {block.width === 1 && block.height === 2 && !block.isTarget && '将'}
                {block.width === 2 && block.height === 1 && '关'}
                {block.width === 1 && block.height === 1 && '卒'}
              </button>
            ))}
          </div>

          {!gameStarted && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded">
              <button
                onClick={startGame}
                className="px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xl font-bold"
              >
                {t.start}
              </button>
            </div>
          )}

          {gameWon && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 rounded">
              <div className="text-white text-3xl font-bold mb-4">{t.youWin}</div>
              <div className="text-white text-xl mb-6">{t.moves || 'Moves'}: {moves}</div>
              <button
                onClick={startGame}
                className="px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xl font-bold"
              >
                {t.restart}
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
          <h3 className="font-bold text-lg mb-2">{t.controls}</h3>
          <p className="text-gray-700 mb-4">{t.games.klotski.controls}</p>
          <div className="text-sm text-gray-600">
            <p>• {t.games.klotski.description}</p>
            <p className="mt-2">• Click a block to select it (or use arrow keys)</p>
            <p>• Click on an empty space to move the selected block</p>
            <p>• Move the red block (曹操) to the exit position</p>
            <p>• Try to complete in minimum moves!</p>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
