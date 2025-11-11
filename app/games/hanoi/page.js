'use client';

import { useState } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const DISKS = 5;
const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

export default function HanoiGame() {
  const { t } = useLanguage();
  const [towers, setTowers] = useState([
    Array.from({ length: DISKS }, (_, i) => DISKS - i),
    [],
    []
  ]);
  const [selected, setSelected] = useState(null);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  const selectTower = (towerIndex) => {
    if (won) return;

    if (selected === null) {
      if (towers[towerIndex].length > 0) {
        setSelected(towerIndex);
      }
    } else {
      if (selected === towerIndex) {
        setSelected(null);
      } else {
        const fromTower = towers[selected];
        const toTower = towers[towerIndex];
        const disk = fromTower[fromTower.length - 1];

        if (toTower.length === 0 || disk < toTower[toTower.length - 1]) {
          const newTowers = towers.map((tower, i) => {
            if (i === selected) return tower.slice(0, -1);
            if (i === towerIndex) return [...tower, disk];
            return tower;
          });

          setTowers(newTowers);
          setMoves(moves + 1);
          setSelected(null);

          if (newTowers[2].length === DISKS) {
            setWon(true);
          }
        } else {
          setSelected(null);
        }
      }
    }
  };

  const resetGame = () => {
    setTowers([
      Array.from({ length: DISKS }, (_, i) => DISKS - i),
      [],
      []
    ]);
    setSelected(null);
    setMoves(0);
    setWon(false);
  };

  return (
    <GameLayout gameId="hanoi">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-3xl">
          <div className="flex justify-between items-center mb-6">
            <div className="text-lg font-semibold text-gray-700">
              {t.language === 'en' ? 'Moves' : '移动次数'}: <span className="text-blue-600">{moves}</span>
            </div>
            {won && (
              <div className="text-xl font-bold text-green-600">
                {t.youWin}
              </div>
            )}
          </div>

          <div className="flex justify-around items-end mb-8" style={{ height: '250px' }}>
            {towers.map((tower, towerIndex) => (
              <button
                key={towerIndex}
                onClick={() => selectTower(towerIndex)}
                className={`flex flex-col items-center justify-end w-32 h-full relative ${
                  selected === towerIndex ? 'bg-blue-100' : ''
                } rounded-lg transition-colors`}
              >
                <div className="absolute bottom-0 w-2 bg-gray-600" style={{ height: '200px' }} />
                <div className="absolute bottom-0 w-32 h-2 bg-gray-600" />
                {tower.map((disk, diskIndex) => (
                  <div
                    key={diskIndex}
                    className="relative rounded"
                    style={{
                      width: `${disk * 20}px`,
                      height: '20px',
                      backgroundColor: COLORS[disk - 1],
                      marginBottom: diskIndex === 0 ? '8px' : '0'
                    }}
                  />
                ))}
              </button>
            ))}
          </div>

          <div className="flex justify-center">
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              {t.restart}
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">{t.controls}</h3>
            <p className="text-gray-600">{t.games.hanoi.controls}</p>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
