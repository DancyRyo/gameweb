'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { gameList } from '@/lib/i18n';
import GameCard from '@/components/GameCard';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Home() {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', label: 'All Games', icon: '🎮' },
    { id: 'puzzle', label: t.puzzle, icon: '🧩' },
    { id: 'arcade', label: t.arcade, icon: '👾' },
    { id: 'strategy', label: t.strategy, icon: '♟️' },
    { id: 'action', label: t.action, icon: '⚡' },
  ];

  const filteredGames = useMemo(() => {
    return gameList.filter(game => {
      const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
      const matchesSearch = !searchTerm ||
        t.games[game.id]?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.games[game.id]?.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchTerm, t]);

  const stats = [
    { label: 'Total Games', value: gameList.length, icon: '🎮', color: 'from-blue-500 to-blue-600' },
    { label: 'Categories', value: 4, icon: '📁', color: 'from-purple-500 to-purple-600' },
    { label: 'Hours of Fun', value: '∞', icon: '⏰', color: 'from-pink-500 to-pink-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-5xl animate-bounce">🎮</div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {t.title}
                </h1>
                <p className="text-gray-600 text-sm md:text-base mt-1">
                  {t.description}
                </p>
              </div>
            </div>
            <LanguageSwitcher />
          </div>

          {/* Search Bar */}
          <div className="mt-6">
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="🔍 Search games..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 rounded-full border-2 border-gray-200 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                🔍
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="relative max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 border border-gray-200/50"
            >
              <div className={`inline-block px-4 py-2 rounded-xl bg-gradient-to-r ${stat.color} text-white text-2xl mb-3`}>
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</div>
              <div className="text-gray-600 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Category Filter */}
      <section className="relative max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-3 justify-center">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`
                px-6 py-3 rounded-full font-semibold transition-all transform hover:scale-105
                ${selectedCategory === category.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white border border-gray-200'
                }
              `}
            >
              <span className="mr-2">{category.icon}</span>
              {category.label}
            </button>
          ))}
        </div>
      </section>

      {/* Games Grid */}
      <main className="relative max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {filteredGames.length > 0 ? (
          <>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedCategory === 'all' ? 'All Games' : `${categories.find(c => c.id === selectedCategory)?.label}`}
                <span className="ml-2 text-purple-600">({filteredGames.length})</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredGames.map((game, index) => (
                <div
                  key={game.id}
                  className="animate-fadeIn"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <GameCard game={game} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">😢</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No games found</h3>
            <p className="text-gray-600">Try adjusting your search or filter</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative bg-gradient-to-r from-purple-900 to-pink-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">🎮 {t.title}</h3>
              <p className="text-purple-200">{t.description}</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">📊 Statistics</h3>
              <ul className="space-y-2 text-purple-200">
                <li>✨ {gameList.length} Amazing Games</li>
                <li>🎯 4 Categories</li>
                <li>🌍 Multi-language Support</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">🎨 Categories</h3>
              <div className="flex flex-wrap gap-2">
                {categories.slice(1).map(cat => (
                  <span key={cat.id} className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    {cat.icon} {cat.label}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">📄 Information</h3>
              <ul className="space-y-2 text-purple-200">
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    {t.aboutUs}
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    {t.privacyPolicy}
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    {t.termsOfService}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 pt-8 text-center">
            <p className="text-purple-200">
              {t.title} © 2025 - Made with ❤️ for gamers
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -20px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(20px, 20px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
