'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Head from 'next/head';

export default function PrivacyPage() {
  const { t } = useLanguage();
  const content = t.privacyPolicyContent;

  return (
    <>
      <Head>
        <title>Privacy Policy - Classic Games Collection | Data Protection & Privacy</title>
        <meta name="description" content="Read our Privacy Policy to understand how Classic Games Collection protects your privacy. We don't collect personal data - all games are stored locally on your device." />
        <meta name="keywords" content="privacy policy, data protection, online games privacy, browser games security, no personal data collection" />
        <link rel="canonical" href="https://yourdomain.com/privacy" />
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
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
            {t.privacyPolicyTitle}
          </h1>

          {/* Last Updated */}
          <p className="text-center text-gray-500 mb-12">{content.lastUpdated}</p>

          {/* Introduction */}
          <div className="mb-12 p-6 bg-blue-50 rounded-xl border-l-4 border-blue-500">
            <p className="text-gray-700 leading-relaxed text-lg">
              {content.intro}
            </p>
          </div>

          {/* Information We Collect */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">📊</span>
              <h2 className="text-2xl font-bold text-gray-900">{content.infoWeCollect}</h2>
            </div>
            <p className="text-gray-700 mb-4 pl-12">{content.infoWeCollectText}</p>

            <div className="space-y-4 pl-12">
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <span>💾</span> {content.localStorage}
                </h3>
                <p className="text-gray-700">{content.localStorageText}</p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <span>📈</span> {content.analytics}
                </h3>
                <p className="text-gray-700">{content.analyticsText}</p>
              </div>
            </div>
          </section>

          {/* Cookies */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🍪</span>
              <h2 className="text-2xl font-bold text-gray-900">{content.cookies}</h2>
            </div>
            <p className="text-gray-700 pl-12">{content.cookiesText}</p>
          </section>

          {/* Third-Party Services */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🔗</span>
              <h2 className="text-2xl font-bold text-gray-900">{content.thirdParty}</h2>
            </div>
            <p className="text-gray-700 pl-12">{content.thirdPartyText}</p>
          </section>

          {/* Data Security */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🔒</span>
              <h2 className="text-2xl font-bold text-gray-900">{content.dataSecurity}</h2>
            </div>
            <p className="text-gray-700 pl-12">{content.dataSecurityText}</p>
          </section>

          {/* Children's Privacy */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">👶</span>
              <h2 className="text-2xl font-bold text-gray-900">{content.childrenPrivacy}</h2>
            </div>
            <p className="text-gray-700 pl-12">{content.childrenPrivacyText}</p>
          </section>

          {/* Changes to Policy */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">📝</span>
              <h2 className="text-2xl font-bold text-gray-900">{content.changes}</h2>
            </div>
            <p className="text-gray-700 pl-12">{content.changesText}</p>
          </section>

          {/* Contact */}
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
    </>
  );
}
