'use client';

import { useState, useEffect, useRef } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const DIFFICULTY_SETTINGS = {
  easy: { enemySpeed: 0.5, bulletSpeed: 2, playerSpeed: 2.5, enemyShootChance: 0.005 },
  medium: { enemySpeed: 1, bulletSpeed: 3, playerSpeed: 2, enemyShootChance: 0.01 },
  hard: { enemySpeed: 1.5, bulletSpeed: 4, playerSpeed: 1.5, enemyShootChance: 0.015 }
};

export default function TankWarGame() {
  const { t } = useLanguage();
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerPos, setPlayerPos] = useState({ x: 50, y: 85 });
  const [playerDirection, setPlayerDirection] = useState('up');
  const [enemies, setEnemies] = useState([]);
  const [bullets, setBullets] = useState([]);
  const [enemyBullets, setEnemyBullets] = useState([]);
  const [playerHealth, setPlayerHealth] = useState(3);
  const [difficulty, setDifficulty] = useState('medium');
  const keysPressed = useRef({});
  const difficultyRef = useRef('medium');

  useEffect(() => {
    const saved = localStorage.getItem('tankwarHighScore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const startGame = () => {
    setScore(0);
    setIsPlaying(true);
    setPlayerPos({ x: 50, y: 85 });
    setPlayerHealth(3);
    setEnemies([]);
    setBullets([]);
    setEnemyBullets([]);
    difficultyRef.current = difficulty;
    spawnEnemy();
  };

  const spawnEnemy = () => {
    const newEnemy = {
      id: Date.now(),
      x: Math.random() * 80 + 10,
      y: Math.random() * 30 + 10,
      direction: ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)]
    };
    setEnemies(prev => [...prev, newEnemy]);
  };

  const endGame = () => {
    setIsPlaying(false);
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('tankwarHighScore', score.toString());
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isPlaying) return;
      keysPressed.current[e.key] = true;

      if (e.key === ' ') {
        e.preventDefault();
        shootBullet();
      }
    };

    const handleKeyUp = (e) => {
      keysPressed.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying, playerPos, playerDirection]);

  const shootBullet = () => {
    setBullets(prev => [...prev, {
      id: Date.now() + Math.random(),
      x: playerPos.x,
      y: playerPos.y,
      direction: playerDirection
    }]);
  };

  useEffect(() => {
    if (!isPlaying) return;

    const gameLoop = setInterval(() => {
      const settings = DIFFICULTY_SETTINGS[difficultyRef.current];

      // Move player
      setPlayerPos(prev => {
        let newPos = { ...prev };
        let newDir = playerDirection;

        if (keysPressed.current['ArrowUp']) {
          newPos.y = Math.max(5, prev.y - settings.playerSpeed);
          newDir = 'up';
        }
        if (keysPressed.current['ArrowDown']) {
          newPos.y = Math.min(95, prev.y + settings.playerSpeed);
          newDir = 'down';
        }
        if (keysPressed.current['ArrowLeft']) {
          newPos.x = Math.max(5, prev.x - settings.playerSpeed);
          newDir = 'left';
        }
        if (keysPressed.current['ArrowRight']) {
          newPos.x = Math.min(95, prev.x + settings.playerSpeed);
          newDir = 'right';
        }

        if (newDir !== playerDirection) setPlayerDirection(newDir);
        return newPos;
      });

      // Move bullets
      setBullets(prev => prev.map(bullet => {
        const newBullet = { ...bullet };
        const speed = settings.bulletSpeed;
        if (bullet.direction === 'up') newBullet.y -= speed;
        if (bullet.direction === 'down') newBullet.y += speed;
        if (bullet.direction === 'left') newBullet.x -= speed;
        if (bullet.direction === 'right') newBullet.x += speed;
        return newBullet;
      }).filter(b => b.x > 0 && b.x < 100 && b.y > 0 && b.y < 100));

      // Move enemies randomly
      setEnemies(prev => prev.map(enemy => {
        if (Math.random() < 0.05) {
          const directions = ['up', 'down', 'left', 'right'];
          enemy.direction = directions[Math.floor(Math.random() * directions.length)];
        }

        let newX = enemy.x;
        let newY = enemy.y;

        if (enemy.direction === 'up') newY = Math.max(5, enemy.y - settings.enemySpeed);
        if (enemy.direction === 'down') newY = Math.min(60, enemy.y + settings.enemySpeed);
        if (enemy.direction === 'left') newX = Math.max(5, enemy.x - settings.enemySpeed);
        if (enemy.direction === 'right') newX = Math.min(95, enemy.x + settings.enemySpeed);

        // Enemy shoots randomly
        if (Math.random() < settings.enemyShootChance) {
          setEnemyBullets(prevBullets => [...prevBullets, {
            id: Date.now() + Math.random(),
            x: enemy.x,
            y: enemy.y,
            direction: 'down'
          }]);
        }

        return { ...enemy, x: newX, y: newY };
      }));

      // Move enemy bullets
      setEnemyBullets(prev => prev.map(bullet => ({
        ...bullet,
        y: bullet.y + settings.bulletSpeed
      })).filter(b => b.y < 100));

      // Check bullet collisions with enemies
      setBullets(prevBullets => {
        const remainingBullets = [...prevBullets];
        const bulletsToRemove = new Set();

        setEnemies(prevEnemies => {
          const remainingEnemies = prevEnemies.filter(enemy => {
            const hit = remainingBullets.some((bullet, idx) => {
              const dx = enemy.x - bullet.x;
              const dy = enemy.y - bullet.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              if (distance < 5) {
                bulletsToRemove.add(idx);
                return true;
              }
              return false;
            });

            if (hit) {
              setScore(s => s + 10);
              if (Math.random() < 0.3) setTimeout(spawnEnemy, 1000);
              return false;
            }
            return true;
          });

          if (remainingEnemies.length === 0) {
            setTimeout(spawnEnemy, 500);
          }

          return remainingEnemies;
        });

        return remainingBullets.filter((_, idx) => !bulletsToRemove.has(idx));
      });

      // Check enemy bullet collisions with player
      setEnemyBullets(prevBullets => {
        const hit = prevBullets.some(bullet => {
          const dx = playerPos.x - bullet.x;
          const dy = playerPos.y - bullet.y;
          return Math.sqrt(dx * dx + dy * dy) < 5;
        });

        if (hit) {
          setPlayerHealth(prev => {
            const newHealth = prev - 1;
            if (newHealth <= 0) endGame();
            return newHealth;
          });
          return prevBullets.filter(bullet => {
            const dx = playerPos.x - bullet.x;
            const dy = playerPos.y - bullet.y;
            return Math.sqrt(dx * dx + dy * dy) >= 5;
          });
        }

        return prevBullets;
      });
    }, 50);

    return () => clearInterval(gameLoop);
  }, [isPlaying, playerPos, playerDirection]);

  const getTankRotation = (direction) => {
    const rotations = { up: 0, right: 90, down: 180, left: 270 };
    return rotations[direction] || 0;
  };

  return (
    <GameLayout gameId="tankwar">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <div className="text-lg font-semibold text-gray-700">
              {t.score}: <span className="text-blue-600">{score}</span>
            </div>
            <div className="text-lg font-semibold text-gray-700">
              {t.difficulty}:
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                disabled={isPlaying}
                className="ml-2 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="easy">{t.easy}</option>
                <option value="medium">{t.medium}</option>
                <option value="hard">{t.hard}</option>
              </select>
            </div>
            <div className="text-lg font-semibold text-gray-700">
              Health: <span className="text-red-600">{'❤️'.repeat(playerHealth)}</span>
            </div>
            <div className="text-lg font-semibold text-gray-700">
              {t.highScore}: <span className="text-purple-600">{highScore}</span>
            </div>
          </div>

          <div className="relative h-96 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg overflow-hidden mb-6 border-4 border-gray-400">
            {/* Player tank */}
            {isPlaying && (
              <div
                className="absolute text-4xl transition-all"
                style={{
                  left: `${playerPos.x}%`,
                  top: `${playerPos.y}%`,
                  transform: `translate(-50%, -50%) rotate(${getTankRotation(playerDirection)}deg)`
                }}
              >
                🟢
              </div>
            )}

            {/* Enemy tanks */}
            {enemies.map(enemy => (
              <div
                key={enemy.id}
                className="absolute text-4xl transition-all"
                style={{
                  left: `${enemy.x}%`,
                  top: `${enemy.y}%`,
                  transform: `translate(-50%, -50%) rotate(${getTankRotation(enemy.direction)}deg)`
                }}
              >
                🔴
              </div>
            ))}

            {/* Player bullets */}
            {bullets.map(bullet => (
              <div
                key={bullet.id}
                className="absolute w-2 h-2 bg-green-500 rounded-full"
                style={{
                  left: `${bullet.x}%`,
                  top: `${bullet.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              />
            ))}

            {/* Enemy bullets */}
            {enemyBullets.map(bullet => (
              <div
                key={bullet.id}
                className="absolute w-2 h-2 bg-red-500 rounded-full"
                style={{
                  left: `${bullet.x}%`,
                  top: `${bullet.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              />
            ))}

            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-2xl font-bold">
                Click Start to Play!
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
              <div className="text-xl font-bold text-blue-600">
                Destroy all enemy tanks!
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">{t.controls}</h3>
            <p className="text-gray-600">{t.games.tankwar.controls}</p>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
