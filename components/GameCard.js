'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function GameCard({ game }) {
  const { t } = useLanguage();
  const gameInfo = t.games[game.id];

  return (
    <Link href={`/games/${game.id}`}>
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer group">
        <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
          {game.icon}
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {gameInfo.name}
        </h3>
        <p className="text-gray-600 text-sm mb-3">
          {gameInfo.description}
        </p>
        <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
          {t[game.category]}
        </div>
      </div>
    </Link>
  );
}
