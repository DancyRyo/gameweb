'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Head from 'next/head';

export default function AboutPage() {
  const { t } = useLanguage();
  const content = t.aboutUsContent;

  return (
    <>
      <Head>
        <title>About Us - Classic Games Collection | Free Online Browser Games</title>
        <meta name="description" content="Learn about Classic Games Collection - your ultimate destination for free online browser games. We offer 50+ classic games including Snake, Tetris, Pac-Man, and more!" />
        <meta name="keywords" content="about classic games, free online games, browser games history, classic arcade games, retro gaming platform" />
        <link rel="canonical" href="https://yourdomain.com/about" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <span className="text-3xl">🎮</span>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {t.title}
              </h1>
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 text-center">
            {t.aboutUsTitle}
          </h1>

          {/* Introduction */}
          <div className="mb-12 text-center">
            <p className="text-xl text-gray-700 leading-relaxed">
              {content.intro}
            </p>
          </div>

          {/* Mission */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🎯</span>
              <h2 className="text-2xl font-bold text-gray-900">{content.mission}</h2>
            </div>
            <p className="text-gray-700 leading-relaxed text-lg pl-12">
              {content.missionText}
            </p>
          </section>

          {/* What We Offer */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🎁</span>
              <h2 className="text-2xl font-bold text-gray-900">{content.whatWeOffer}</h2>
            </div>
            <p className="text-gray-700 leading-relaxed text-lg pl-12">
              {content.whatWeOfferText}
            </p>
          </section>

          {/* Features */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">✨</span>
              <h2 className="text-2xl font-bold text-gray-900">{content.features}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-12">
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <span className="text-2xl">💯</span>
                <p className="text-gray-700">{content.feature1}</p>
              </div>
              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                <span className="text-2xl">🚀</span>
                <p className="text-gray-700">{content.feature2}</p>
              </div>
              <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                <span className="text-2xl">📱</span>
                <p className="text-gray-700">{content.feature3}</p>
              </div>
              <div className="flex items-start gap-3 p-4 bg-pink-50 rounded-lg">
                <span className="text-2xl">🌍</span>
                <p className="text-gray-700">{content.feature4}</p>
              </div>
              <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg md:col-span-2">
                <span className="text-2xl">🔒</span>
                <p className="text-gray-700">{content.feature5}</p>
              </div>
            </div>
          </section>

          {/* Team */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">👥</span>
              <h2 className="text-2xl font-bold text-gray-900">{content.team}</h2>
            </div>
            <p className="text-gray-700 leading-relaxed text-lg pl-12">
              {content.teamText}
            </p>
          </section>

          {/* Thank You */}
          <div className="text-center py-8 px-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              {content.thankYou}
            </p>
          </div>

          {/* Back Button */}
          <div className="mt-12 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t.backToHome}
            </Link>
          </div>
        </div>
      </main>
    </div>
    </>
  );
}
