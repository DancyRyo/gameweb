'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function TermsPage() {
  const { t } = useLanguage();
  const content = t.termsContent;

  return (
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
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
            {t.termsTitle}
          </h1>

          {/* Last Updated */}
          <p className="text-center text-gray-500 mb-12">{content.lastUpdated}</p>

          {/* Introduction */}
          <div className="mb-12 p-6 bg-blue-50 rounded-xl border-l-4 border-blue-500">
            <p className="text-gray-700 leading-relaxed text-lg">
              {content.intro}
            </p>
          </div>

          {/* Acceptance of Terms */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">✅</span>
              <h2 className="text-2xl font-bold text-gray-900">{content.acceptance}</h2>
            </div>
            <p className="text-gray-700 pl-12">{content.acceptanceText}</p>
          </section>

          {/* License to Use */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">📜</span>
              <h2 className="text-2xl font-bold text-gray-900">{content.license}</h2>
            </div>
            <p className="text-gray-700 mb-4 pl-12">{content.licenseText}</p>
            <ul className="space-y-2 pl-12">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-gray-700">{content.license1}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-gray-700">{content.license2}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-gray-700">{content.license3}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-gray-700">{content.license4}</span>
              </li>
            </ul>
          </section>

          {/* User Conduct */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">👤</span>
              <h2 className="text-2xl font-bold text-gray-900">{content.userConduct}</h2>
            </div>
            <p className="text-gray-700 pl-12">{content.userConductText}</p>
          </section>

          {/* Intellectual Property */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">©️</span>
              <h2 className="text-2xl font-bold text-gray-900">{content.intellectualProperty}</h2>
            </div>
            <p className="text-gray-700 pl-12">{content.intellectualPropertyText}</p>
          </section>

          {/* Disclaimer */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">⚠️</span>
              <h2 className="text-2xl font-bold text-gray-900">{content.disclaimer}</h2>
            </div>
            <p className="text-gray-700 pl-12">{content.disclaimerText}</p>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">⚖️</span>
              <h2 className="text-2xl font-bold text-gray-900">{content.limitation}</h2>
            </div>
            <p className="text-gray-700 pl-12">{content.limitationText}</p>
          </section>

          {/* Modifications to Service */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🔧</span>
              <h2 className="text-2xl font-bold text-gray-900">{content.modifications}</h2>
            </div>
            <p className="text-gray-700 pl-12">{content.modificationsText}</p>
          </section>

          {/* Termination */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🚫</span>
              <h2 className="text-2xl font-bold text-gray-900">{content.termination}</h2>
            </div>
            <p className="text-gray-700 pl-12">{content.terminationText}</p>
          </section>

          {/* Governing Law */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">⚖️</span>
              <h2 className="text-2xl font-bold text-gray-900">{content.governingLaw}</h2>
            </div>
            <p className="text-gray-700 pl-12">{content.governingLawText}</p>
          </section>

          {/* Contact Information */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">📧</span>
              <h2 className="text-2xl font-bold text-gray-900">{content.contact}</h2>
            </div>
            <p className="text-gray-700 pl-12">{content.contactText}</p>
          </section>

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
  );
}
