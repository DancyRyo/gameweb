'use client';

import { useState, useEffect, useRef } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const COLORS = [
  'bg-red-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-orange-500'
];

export default function StackTowerGame() {
  const { t } = useLanguage();
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [blocks, setBlocks] = useState([]);
  const [currentBlock, setCurrentBlock] = useState(null);
  const [direction, setDirection] = useState(1);
  const [gameSpeed, setGameSpeed] = useState(20);
  const animationRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('stacktowerHighScore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const startGame = () => {
    setScore(0);
    setIsPlaying(true);
    setGameSpeed(20);
    setDirection(1);
    setBlocks([
      { x: 30, width: 40, color: COLORS[0] }
    ]);
    setCurrentBlock({
      x: 0,
      width: 40,
      color: COLORS[1]
    });
  };

  const endGame = () => {
    setIsPlaying(false);
    setCurrentBlock(null);
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('stacktowerHighScore', score.toString());
    }
  };

  const dropBlock = () => {
    if (!currentBlock || !isPlaying) return;

    const lastBlock = blocks[blocks.length - 1];
    const overlap = calculateOverlap(lastBlock, currentBlock);

    if (overlap <= 0) {
      // No overlap, game over
      endGame();
      return;
    }

    // Calculate new block dimensions
    const newX = Math.max(lastBlock.x, currentBlock.x);
    const newWidth = overlap;

    const newBlock = {
      x: newX,
      width: newWidth,
      color: COLORS[blocks.length % COLORS.length]
    };

    setBlocks(prev => [...prev, newBlock]);
    setScore(blocks.length);

    if (newWidth < 5) {
      // Block too small, game over
      endGame();
      return;
    }

    // Speed up the game
    if (blocks.length % 5 === 0) {
      setGameSpeed(prev => prev + 5);
    }

    // Create next block
    setCurrentBlock({
      x: direction > 0 ? 0 : 100 - newWidth,
      width: newWidth,
      color: COLORS[(blocks.length + 1) % COLORS.length]
    });

    setDirection(prev => -prev);
  };

  const calculateOverlap = (block1, block2) => {
    const left1 = block1.x;
    const right1 = block1.x + block1.width;
    const left2 = block2.x;
    const right2 = block2.x + block2.width;

    const overlapLeft = Math.max(left1, left2);
    const overlapRight = Math.min(right1, right2);

    return Math.max(0, overlapRight - overlapLeft);
  };

  useEffect(() => {
    if (!isPlaying || !currentBlock) return;

    const gameLoop = () => {
      setCurrentBlock(prev => {
        if (!prev) return null;

        let newX = prev.x + direction * 0.5;

        // Bounce back if out of bounds
        if (newX <= 0 || newX + prev.width >= 100) {
          setDirection(d => -d);
          newX = Math.max(0, Math.min(100 - prev.width, newX));
        }

        return { ...prev, x: newX };
      });

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, direction, currentBlock?.width]);

  const handleKeyPress = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      dropBlock();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentBlock, blocks, isPlaying]);

  return (
    <GameLayout gameId="stacktower">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <div className="text-lg font-semibold text-gray-700">
              {t.score}: <span className="text-blue-600">{score}</span>
            </div>
            <div className="text-lg font-semibold text-gray-700">
              {t.highScore}: <span className="text-purple-600">{highScore}</span>
            </div>
          </div>

          <div className="relative h-96 bg-gradient-to-b from-sky-300 to-sky-100 rounded-lg overflow-hidden mb-6 border-4 border-gray-300">
            {/* Ground */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-green-600"></div>

            {/* Stacked blocks */}
            {blocks.map((block, index) => (
              <div
                key={index}
                className={`absolute ${block.color} transition-all`}
                style={{
                  left: `${block.x}%`,
                  width: `${block.width}%`,
                  height: '20px',
                  bottom: `${(index + 1) * 20 + 32}px`
                }}
              ></div>
            ))}

            {/* Current moving block */}
            {currentBlock && isPlaying && (
              <div
                className={`absolute ${currentBlock.color}`}
                style={{
                  left: `${currentBlock.x}%`,
                  width: `${currentBlock.width}%`,
                  height: '20px',
                  bottom: `${(blocks.length + 1) * 20 + 32}px`
                }}
              ></div>
            )}

            {!isPlaying && blocks.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-700 text-2xl font-bold">
                Click Start to Play!
              </div>
            )}

            {!isPlaying && blocks.length > 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white bg-opacity-90 p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold text-gray-800 mb-2">
                    Game Over!
                  </div>
                  <div className="text-xl text-gray-600">
                    Final Score: {score}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-center">
            {!isPlaying ? (
              <button
                onClick={startGame}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                {score > 0 ? t.restart : t.start}
              </button>
            ) : (
              <button
                onClick={dropBlock}
                className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-xl rounded-lg transition-colors shadow-lg"
              >
                DROP (Space/Click)
              </button>
            )}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">{t.controls}</h3>
            <p className="text-gray-600">{t.games.stacktower.controls}</p>
            <p className="text-gray-600 mt-2">Tip: Perfect alignment = higher score!</p>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
