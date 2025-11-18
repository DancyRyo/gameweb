'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

const categoryColors = {
  puzzle: { bg: 'from-blue-500 to-cyan-500', badge: 'bg-blue-100 text-blue-700', border: 'border-blue-300' },
  arcade: { bg: 'from-purple-500 to-pink-500', badge: 'bg-purple-100 text-purple-700', border: 'border-purple-300' },
  strategy: { bg: 'from-green-500 to-emerald-500', badge: 'bg-green-100 text-green-700', border: 'border-green-300' },
  action: { bg: 'from-red-500 to-orange-500', badge: 'bg-red-100 text-red-700', border: 'border-red-300' },
};

export default function GameCard({ game }) {
  const { t } = useLanguage();
  const gameInfo = t.games[game.id];
  const colors = categoryColors[game.category] || categoryColors.puzzle;

  return (
    <Link href={`/games/${game.id}`}>
      <div className="group relative h-full">
        {/* Glow effect on hover */}
        <div className={`absolute -inset-0.5 bg-gradient-to-r ${colors.bg} rounded-2xl opacity-0 group-hover:opacity-75 blur transition-all duration-300`}></div>

        {/* Card content */}
        <div className={`relative h-full bg-white rounded-2xl p-6 shadow-md border-2 ${colors.border} border-opacity-0 group-hover:border-opacity-100 transition-all duration-300 cursor-pointer overflow-hidden`}>
          {/* Animated background gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

          {/* Content */}
          <div className="relative z-10">
            {/* Icon with animation */}
            <div className="mb-4 relative">
              <div className="text-6xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                {game.icon}
              </div>
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -skew-x-12 group-hover:translate-x-full transition-all duration-700"></div>
            </div>

            {/* Game name */}
            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 transition-all duration-300">
              {gameInfo.name}
            </h3>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[40px]">
              {gameInfo.description}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between">
              {/* Category badge */}
              <span className={`inline-block px-3 py-1 ${colors.badge} text-xs font-semibold rounded-full`}>
                {t[game.category]}
              </span>

              {/* Play button */}
              <div className="flex items-center text-purple-600 font-semibold text-sm opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                Play
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </div>

          {/* Decorative corner element */}
          <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${colors.bg} opacity-10 rounded-bl-full transform translate-x-8 -translate-y-8 group-hover:translate-x-6 group-hover:-translate-y-6 transition-all duration-300`}></div>
        </div>
      </div>
    </Link>
  );
}
