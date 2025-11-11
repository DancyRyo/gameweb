'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 40;
const ENEMY_WIDTH = 30;
const ENEMY_HEIGHT = 30;
const BULLET_WIDTH = 4;
const BULLET_HEIGHT = 15;

export default function SpaceShooterGame() {
  const { t } = useLanguage();
  const canvasRef = useRef(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [player, setPlayer] = useState({ x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2, y: CANVAS_HEIGHT - 80 });
  const [bullets, setBullets] = useState([]);
  const [enemies, setEnemies] = useState([]);
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

  // Spawn enemies
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const spawnInterval = Math.max(500, 2000 - level * 100);

    const spawn = setInterval(() => {
      const newEnemy = {
        id: Date.now() + Math.random(),
        x: Math.random() * (CANVAS_WIDTH - ENEMY_WIDTH),
        y: -ENEMY_HEIGHT,
        speed: 2 + level * 0.3,
      };

      setEnemies(prev => [...prev, newEnemy]);
    }, spawnInterval);

    return () => clearInterval(spawn);
  }, [gameStarted, gameOver, level]);

  // Game loop
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

      // Shoot bullets
      if (keys[' ']) {
        const now = Date.now();
        if (now - lastShot.current > 200) {
          lastShot.current = now;
          setBullets(prev => [...prev, {
            id: now,
            x: player.x + PLAYER_WIDTH / 2 - BULLET_WIDTH / 2,
            y: player.y,
          }]);
        }
      }

      // Move bullets
      setBullets(prev => prev
        .map(bullet => ({ ...bullet, y: bullet.y - 10 }))
        .filter(bullet => bullet.y > -BULLET_HEIGHT)
      );

      // Move enemies
      setEnemies(prev => prev.map(enemy => ({
        ...enemy,
        y: enemy.y + enemy.speed,
      })));

      // Check bullet-enemy collisions
      setBullets(prevBullets => {
        const remainingBullets = [...prevBullets];

        setEnemies(prevEnemies => {
          const remainingEnemies = prevEnemies.filter(enemy => {
            const hitBulletIndex = remainingBullets.findIndex(bullet =>
              bullet.x < enemy.x + ENEMY_WIDTH &&
              bullet.x + BULLET_WIDTH > enemy.x &&
              bullet.y < enemy.y + ENEMY_HEIGHT &&
              bullet.y + BULLET_HEIGHT > enemy.y
            );

            if (hitBulletIndex !== -1) {
              remainingBullets.splice(hitBulletIndex, 1);
              setScore(s => {
                const newScore = s + 10;
                if (newScore % 100 === 0) {
                  setLevel(l => l + 1);
                }
                return newScore;
              });
              return false;
            }
            return true;
          });

          return remainingEnemies;
        });

        return remainingBullets;
      });

      // Check player-enemy collisions
      setEnemies(prev => {
        const hitEnemy = prev.some(enemy =>
          player.x < enemy.x + ENEMY_WIDTH &&
          player.x + PLAYER_WIDTH > enemy.x &&
          player.y < enemy.y + ENEMY_HEIGHT &&
          player.y + PLAYER_HEIGHT > enemy.y
        );

        if (hitEnemy) {
          setGameOver(true);
        }

        // Remove enemies that passed the screen
        return prev.filter(enemy => {
          if (enemy.y > CANVAS_HEIGHT) {
            return false;
          }
          return true;
        });
      });
    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver, keys, player]);

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Clear canvas with space background
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#000033');
    gradient.addColorStop(1, '#000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw stars
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 50; i++) {
      const x = (i * 73) % CANVAS_WIDTH;
      const y = (i * 97 + Date.now() * 0.05) % CANVAS_HEIGHT;
      ctx.fillRect(x, y, 1, 1);
    }

    // Draw player
    ctx.fillStyle = '#00FF00';
    ctx.beginPath();
    ctx.moveTo(player.x + PLAYER_WIDTH / 2, player.y);
    ctx.lineTo(player.x, player.y + PLAYER_HEIGHT);
    ctx.lineTo(player.x + PLAYER_WIDTH, player.y + PLAYER_HEIGHT);
    ctx.closePath();
    ctx.fill();

    // Draw cockpit
    ctx.fillStyle = '#00FFFF';
    ctx.beginPath();
    ctx.arc(player.x + PLAYER_WIDTH / 2, player.y + PLAYER_HEIGHT / 3, 5, 0, Math.PI * 2);
    ctx.fill();

    // Draw bullets
    ctx.fillStyle = '#FFFF00';
    bullets.forEach(bullet => {
      ctx.fillRect(bullet.x, bullet.y, BULLET_WIDTH, BULLET_HEIGHT);
    });

    // Draw enemies
    ctx.fillStyle = '#FF0000';
    enemies.forEach(enemy => {
      ctx.beginPath();
      ctx.moveTo(enemy.x + ENEMY_WIDTH / 2, enemy.y + ENEMY_HEIGHT);
      ctx.lineTo(enemy.x, enemy.y);
      ctx.lineTo(enemy.x + ENEMY_WIDTH, enemy.y);
      ctx.closePath();
      ctx.fill();

      // Enemy eyes
      ctx.fillStyle = '#FFFF00';
      ctx.beginPath();
      ctx.arc(enemy.x + ENEMY_WIDTH / 3, enemy.y + ENEMY_HEIGHT / 3, 2, 0, Math.PI * 2);
      ctx.arc(enemy.x + 2 * ENEMY_WIDTH / 3, enemy.y + ENEMY_HEIGHT / 3, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FF0000';
    });
  }, [player, bullets, enemies]);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setLevel(1);
    setPlayer({ x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2, y: CANVAS_HEIGHT - 80 });
    setBullets([]);
    setEnemies([]);
    setKeys({});
  };

  return (
    <GameLayout gameId="spaceshooter">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6 relative">
          <div className="flex justify-between items-center mb-4 gap-8">
            <div className="text-lg font-semibold">
              {t.score}: <span className="text-blue-600">{score}</span>
            </div>
            <div className="text-lg font-semibold">
              {t.level}: <span className="text-green-600">{level}</span>
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
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xl font-bold"
              >
                {t.start}
              </button>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 rounded">
              <div className="text-white text-3xl font-bold mb-4">{t.gameOver}</div>
              <div className="text-white text-xl mb-2">{t.score}: {score}</div>
              <div className="text-white text-xl mb-6">{t.level}: {level}</div>
              <button
                onClick={startGame}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xl font-bold"
              >
                {t.restart}
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
          <h3 className="font-bold text-lg mb-2">{t.controls}</h3>
          <p className="text-gray-700 mb-4">{t.games.spaceshooter.controls}</p>
          <div className="text-sm text-gray-600">
            <p>• {t.games.spaceshooter.description}</p>
            <p className="mt-2">• Each enemy destroyed = 10 points</p>
            <p>• Every 100 points increases the level</p>
            <p>• Higher levels spawn enemies faster</p>
            <p>• Avoid colliding with enemies!</p>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
