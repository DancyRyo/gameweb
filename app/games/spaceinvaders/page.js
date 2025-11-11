'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 500;
const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 30;
const ALIEN_WIDTH = 30;
const ALIEN_HEIGHT = 25;
const ALIEN_ROWS = 4;
const ALIEN_COLS = 10;

export default function SpaceInvadersGame() {
  const { t } = useLanguage();
  const canvasRef = useRef(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [player, setPlayer] = useState({ x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2, y: CANVAS_HEIGHT - 60 });
  const [playerBullets, setPlayerBullets] = useState([]);
  const [aliens, setAliens] = useState([]);
  const [alienBullets, setAlienBullets] = useState([]);
  const [alienDirection, setAlienDirection] = useState(1);
  const [keys, setKeys] = useState({});
  const lastShot = useRef(0);

  const handleKeyDown = useCallback((e) => {
    if (!gameStarted || gameOver) return;
    setKeys(prev => ({ ...prev, [e.key]: true }));
  }, [gameStarted, gameOver]);

  const handleKeyUp = useCallback((e) => {
    setKeys(prev => ({ ...prev, [e.key]: false }));
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const initAliens = useCallback(() => {
    const newAliens = [];
    for (let row = 0; row < ALIEN_ROWS; row++) {
      for (let col = 0; col < ALIEN_COLS; col++) {
        newAliens.push({
          id: row * ALIEN_COLS + col,
          x: col * (ALIEN_WIDTH + 15) + 50,
          y: row * (ALIEN_HEIGHT + 15) + 50,
          alive: true,
        });
      }
    }
    return newAliens;
  }, []);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameLoop = setInterval(() => {
      // Move player
      setPlayer(prev => {
        let newX = prev.x;
        if (keys.ArrowLeft) newX -= 5;
        if (keys.ArrowRight) newX += 5;
        newX = Math.max(0, Math.min(newX, CANVAS_WIDTH - PLAYER_WIDTH));
        return { ...prev, x: newX };
      });

      // Shoot player bullets
      if (keys[' ']) {
        const now = Date.now();
        if (now - lastShot.current > 300) {
          lastShot.current = now;
          setPlayerBullets(prev => [...prev, {
            id: now,
            x: player.x + PLAYER_WIDTH / 2 - 2,
            y: player.y - 10,
          }]);
        }
      }

      // Move player bullets
      setPlayerBullets(prev => prev
        .map(bullet => ({ ...bullet, y: bullet.y - 8 }))
        .filter(bullet => bullet.y > -10)
      );

      // Move alien bullets
      setAlienBullets(prev => prev
        .map(bullet => ({ ...bullet, y: bullet.y + 5 }))
        .filter(bullet => bullet.y < CANVAS_HEIGHT)
      );

      // Move aliens
      setAliens(prevAliens => {
        const aliveAliens = prevAliens.filter(a => a.alive);
        if (aliveAliens.length === 0) return prevAliens;

        const leftMost = Math.min(...aliveAliens.map(a => a.x));
        const rightMost = Math.max(...aliveAliens.map(a => a.x + ALIEN_WIDTH));

        let newDirection = alienDirection;
        let moveDown = false;

        if (rightMost >= CANVAS_WIDTH && alienDirection > 0) {
          newDirection = -1;
          moveDown = true;
          setAlienDirection(-1);
        } else if (leftMost <= 0 && alienDirection < 0) {
          newDirection = 1;
          moveDown = true;
          setAlienDirection(1);
        }

        return prevAliens.map(alien => {
          if (!alien.alive) return alien;
          return {
            ...alien,
            x: alien.x + newDirection * 10,
            y: moveDown ? alien.y + 20 : alien.y,
          };
        });
      });

      // Aliens shoot randomly
      if (Math.random() < 0.02) {
        const aliveAliens = aliens.filter(a => a.alive);
        if (aliveAliens.length > 0) {
          const shooter = aliveAliens[Math.floor(Math.random() * aliveAliens.length)];
          setAlienBullets(prev => [...prev, {
            id: Date.now() + Math.random(),
            x: shooter.x + ALIEN_WIDTH / 2,
            y: shooter.y + ALIEN_HEIGHT,
          }]);
        }
      }

      // Check player bullet hits on aliens
      setPlayerBullets(prevBullets => {
        const remainingBullets = [...prevBullets];

        setAliens(prevAliens => {
          return prevAliens.map(alien => {
            if (!alien.alive) return alien;

            const hitBulletIndex = remainingBullets.findIndex(bullet =>
              bullet.x >= alien.x &&
              bullet.x <= alien.x + ALIEN_WIDTH &&
              bullet.y >= alien.y &&
              bullet.y <= alien.y + ALIEN_HEIGHT
            );

            if (hitBulletIndex !== -1) {
              remainingBullets.splice(hitBulletIndex, 1);
              setScore(s => s + 10);
              return { ...alien, alive: false };
            }
            return alien;
          });
        });

        return remainingBullets;
      });

      // Check alien bullet hits on player
      const playerHit = alienBullets.some(bullet =>
        bullet.x >= player.x &&
        bullet.x <= player.x + PLAYER_WIDTH &&
        bullet.y >= player.y &&
        bullet.y <= player.y + PLAYER_HEIGHT
      );

      if (playerHit) {
        setLives(l => {
          const newLives = l - 1;
          if (newLives <= 0) {
            setGameOver(true);
          } else {
            setPlayer({ x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2, y: CANVAS_HEIGHT - 60 });
            setAlienBullets([]);
          }
          return newLives;
        });
      }

      // Check if aliens reached bottom
      const aliensReachedBottom = aliens.some(alien =>
        alien.alive && alien.y + ALIEN_HEIGHT >= player.y
      );

      if (aliensReachedBottom) {
        setGameOver(true);
      }

      // Check win condition
      const allDead = aliens.length > 0 && aliens.every(alien => !alien.alive);
      if (allDead) {
        setTimeout(() => {
          setAliens(initAliens());
          setAlienDirection(1);
          setAlienBullets([]);
        }, 1000);
      }
    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver, keys, player, aliens, alienDirection, alienBullets, initAliens]);

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw player
    ctx.fillStyle = '#0F0';
    ctx.fillRect(player.x, player.y, PLAYER_WIDTH, PLAYER_HEIGHT);
    ctx.fillStyle = '#0FF';
    ctx.fillRect(player.x + 15, player.y - 10, 10, 10);

    // Draw player bullets
    ctx.fillStyle = '#FF0';
    playerBullets.forEach(bullet => {
      ctx.fillRect(bullet.x, bullet.y, 4, 10);
    });

    // Draw aliens
    aliens.forEach(alien => {
      if (!alien.alive) return;

      ctx.fillStyle = '#F0F';
      ctx.fillRect(alien.x, alien.y, ALIEN_WIDTH, ALIEN_HEIGHT);

      // Alien eyes
      ctx.fillStyle = '#0F0';
      ctx.fillRect(alien.x + 5, alien.y + 5, 6, 6);
      ctx.fillRect(alien.x + 19, alien.y + 5, 6, 6);
    });

    // Draw alien bullets
    ctx.fillStyle = '#F00';
    alienBullets.forEach(bullet => {
      ctx.fillRect(bullet.x, bullet.y, 3, 8);
    });
  }, [player, playerBullets, aliens, alienBullets]);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setLives(3);
    setPlayer({ x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2, y: CANVAS_HEIGHT - 60 });
    setPlayerBullets([]);
    setAliens(initAliens());
    setAlienBullets([]);
    setAlienDirection(1);
    setKeys({});
  };

  return (
    <GameLayout gameId="spaceinvaders">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6 relative">
          <div className="flex justify-between items-center mb-4 gap-12">
            <div className="text-lg font-semibold">
              {t.score}: <span className="text-blue-600">{score}</span>
            </div>
            <div className="text-lg font-semibold">
              {t.lives || 'Lives'}: <span className="text-red-600">{'❤️'.repeat(lives)}</span>
            </div>
          </div>

          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="border-4 border-gray-800 rounded"
          />

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
              <div className="text-white text-xl mb-6">{t.score}: {score}</div>
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
          <p className="text-gray-700 mb-4">{t.games.spaceinvaders.controls}</p>
          <div className="text-sm text-gray-600">
            <p>• {t.games.spaceinvaders.description}</p>
            <p className="mt-2">• Destroy all aliens to advance</p>
            <p>• Each alien = 10 points</p>
            <p>• Avoid alien bullets</p>
            <p>• Don't let aliens reach the bottom!</p>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
