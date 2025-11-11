'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 600;
const BUBBLE_RADIUS = 20;
const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];

export default function BubbleShooterGame() {
  const { t } = useLanguage();
  const canvasRef = useRef(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [bubbles, setBubbles] = useState([]);
  const [currentBubble, setCurrentBubble] = useState(null);
  const [nextBubble, setNextBubble] = useState(null);
  const [angle, setAngle] = useState(0);
  const [shootingBubble, setShootingBubble] = useState(null);

  const handleMouseMove = useCallback((e) => {
    if (!gameStarted || gameOver || shootingBubble) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const shooterX = CANVAS_WIDTH / 2;
    const shooterY = CANVAS_HEIGHT - 50;

    const dx = mouseX - shooterX;
    const dy = mouseY - shooterY;
    const newAngle = Math.atan2(dy, dx);

    // Limit angle to prevent shooting downwards
    if (newAngle < -Math.PI * 0.9 || newAngle > -Math.PI * 0.1) {
      setAngle(Math.max(-Math.PI * 0.9, Math.min(-Math.PI * 0.1, newAngle)));
    }
  }, [gameStarted, gameOver, shootingBubble]);

  const handleClick = useCallback(() => {
    if (!gameStarted || gameOver || shootingBubble || !currentBubble) return;

    const shooterX = CANVAS_WIDTH / 2;
    const shooterY = CANVAS_HEIGHT - 50;

    setShootingBubble({
      x: shooterX,
      y: shooterY,
      color: currentBubble,
      velocityX: Math.cos(angle) * 10,
      velocityY: Math.sin(angle) * 10,
    });

    setCurrentBubble(nextBubble);
    setNextBubble(COLORS[Math.floor(Math.random() * COLORS.length)]);
  }, [gameStarted, gameOver, shootingBubble, currentBubble, nextBubble, angle]);

  const initBubbles = useCallback(() => {
    const newBubbles = [];
    const rows = 5;
    const cols = 11;

    for (let row = 0; row < rows; row++) {
      const offset = row % 2 === 0 ? 0 : BUBBLE_RADIUS;
      const bubblesInRow = row % 2 === 0 ? cols : cols - 1;

      for (let col = 0; col < bubblesInRow; col++) {
        newBubbles.push({
          id: `${row}-${col}`,
          x: col * (BUBBLE_RADIUS * 2) + BUBBLE_RADIUS + offset,
          y: row * (BUBBLE_RADIUS * 2) + BUBBLE_RADIUS,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          row,
          col,
        });
      }
    }

    return newBubbles;
  }, []);

  const findNeighbors = useCallback((bubble, allBubbles) => {
    const neighbors = [];
    const row = Math.floor(bubble.y / (BUBBLE_RADIUS * 2));
    const isEvenRow = row % 2 === 0;

    allBubbles.forEach(other => {
      if (other.id === bubble.id) return;

      const dx = bubble.x - other.x;
      const dy = bubble.y - other.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < BUBBLE_RADIUS * 2.5) {
        neighbors.push(other);
      }
    });

    return neighbors;
  }, []);

  const findConnectedBubbles = useCallback((bubble, allBubbles, visited = new Set()) => {
    if (visited.has(bubble.id)) return [];

    visited.add(bubble.id);
    const connected = [bubble];

    const neighbors = findNeighbors(bubble, allBubbles);
    neighbors.forEach(neighbor => {
      if (neighbor.color === bubble.color && !visited.has(neighbor.id)) {
        connected.push(...findConnectedBubbles(neighbor, allBubbles, visited));
      }
    });

    return connected;
  }, [findNeighbors]);

  useEffect(() => {
    if (!gameStarted || gameOver || !shootingBubble) return;

    const moveInterval = setInterval(() => {
      setShootingBubble(prev => {
        if (!prev) return null;

        let newX = prev.x + prev.velocityX;
        let newY = prev.y + prev.velocityY;
        let newVelocityX = prev.velocityX;

        // Bounce off walls
        if (newX - BUBBLE_RADIUS < 0 || newX + BUBBLE_RADIUS > CANVAS_WIDTH) {
          newVelocityX = -newVelocityX;
          newX = newX - BUBBLE_RADIUS < 0 ? BUBBLE_RADIUS : CANVAS_WIDTH - BUBBLE_RADIUS;
        }

        // Check collision with existing bubbles or top
        if (newY - BUBBLE_RADIUS <= 0) {
          // Hit top
          const row = 0;
          const col = Math.floor((newX - BUBBLE_RADIUS) / (BUBBLE_RADIUS * 2));
          const snapX = col * (BUBBLE_RADIUS * 2) + BUBBLE_RADIUS;

          setBubbles(prevBubbles => {
            const newBubbles = [...prevBubbles, {
              id: `${Date.now()}`,
              x: snapX,
              y: BUBBLE_RADIUS,
              color: prev.color,
              row: 0,
              col,
            }];

            // Check for matches
            const newBubble = newBubbles[newBubbles.length - 1];
            const connected = findConnectedBubbles(newBubble, newBubbles);

            if (connected.length >= 3) {
              const connectedIds = new Set(connected.map(b => b.id));
              const remaining = newBubbles.filter(b => !connectedIds.has(b.id));
              setScore(s => s + connected.length * 10);
              return remaining;
            }

            return newBubbles;
          });

          return null;
        }

        // Check collision with bubbles
        for (const bubble of bubbles) {
          const dx = newX - bubble.x;
          const dy = newY - bubble.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < BUBBLE_RADIUS * 2) {
            // Snap to grid
            const row = Math.floor(newY / (BUBBLE_RADIUS * 2));
            const offset = row % 2 === 0 ? 0 : BUBBLE_RADIUS;
            const col = Math.floor((newX - offset) / (BUBBLE_RADIUS * 2));
            const snapX = col * (BUBBLE_RADIUS * 2) + BUBBLE_RADIUS + offset;
            const snapY = row * (BUBBLE_RADIUS * 2) + BUBBLE_RADIUS;

            setBubbles(prevBubbles => {
              const newBubbles = [...prevBubbles, {
                id: `${Date.now()}`,
                x: snapX,
                y: snapY,
                color: prev.color,
                row,
                col,
              }];

              // Check for matches
              const newBubble = newBubbles[newBubbles.length - 1];
              const connected = findConnectedBubbles(newBubble, newBubbles);

              if (connected.length >= 3) {
                const connectedIds = new Set(connected.map(b => b.id));
                const remaining = newBubbles.filter(b => !connectedIds.has(b.id));
                setScore(s => s + connected.length * 10);
                return remaining;
              }

              return newBubbles;
            });

            return null;
          }
        }

        return {
          ...prev,
          x: newX,
          y: newY,
          velocityX: newVelocityX,
        };
      });
    }, 20);

    return () => clearInterval(moveInterval);
  }, [gameStarted, gameOver, shootingBubble, bubbles, findConnectedBubbles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.fillStyle = '#2C3E50';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw grid bubbles
    bubbles.forEach(bubble => {
      ctx.fillStyle = bubble.color;
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, BUBBLE_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFF';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw shooting bubble
    if (shootingBubble) {
      ctx.fillStyle = shootingBubble.color;
      ctx.beginPath();
      ctx.arc(shootingBubble.x, shootingBubble.y, BUBBLE_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFF';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw shooter
    const shooterX = CANVAS_WIDTH / 2;
    const shooterY = CANVAS_HEIGHT - 50;

    // Aim line
    if (!shootingBubble && currentBubble) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(shooterX, shooterY);
      ctx.lineTo(
        shooterX + Math.cos(angle) * 100,
        shooterY + Math.sin(angle) * 100
      );
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Current bubble
    if (currentBubble) {
      ctx.fillStyle = currentBubble;
      ctx.beginPath();
      ctx.arc(shooterX, shooterY, BUBBLE_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFF';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Next bubble
    if (nextBubble) {
      ctx.fillStyle = nextBubble;
      ctx.beginPath();
      ctx.arc(CANVAS_WIDTH - 50, CANVAS_HEIGHT - 50, BUBBLE_RADIUS * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFF';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }, [bubbles, shootingBubble, currentBubble, nextBubble, angle]);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setBubbles(initBubbles());
    setCurrentBubble(COLORS[Math.floor(Math.random() * COLORS.length)]);
    setNextBubble(COLORS[Math.floor(Math.random() * COLORS.length)]);
    setShootingBubble(null);
    setAngle(-Math.PI / 2);
  };

  return (
    <GameLayout gameId="bubbleshooter">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6 relative">
          <div className="flex justify-center items-center mb-4">
            <div className="text-2xl font-bold">
              {t.score}: <span className="text-blue-600">{score}</span>
            </div>
          </div>

          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            onMouseMove={handleMouseMove}
            onClick={handleClick}
            className="border-4 border-gray-800 rounded cursor-crosshair"
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
          <p className="text-gray-700 mb-4">{t.games.bubbleshooter.controls}</p>
          <div className="text-sm text-gray-600">
            <p>• {t.games.bubbleshooter.description}</p>
            <p className="mt-2">• Match 3 or more bubbles of same color</p>
            <p>• Each bubble popped = 10 points</p>
            <p>• Aim with mouse, click to shoot</p>
            <p>• Next bubble shown in bottom right</p>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
