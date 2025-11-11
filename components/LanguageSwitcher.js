'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export default function LanguageSwitcher() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700 shadow-sm"
      aria-label="Toggle language"
    >
      {language === 'en' ? '中文' : 'English'}
    </button>
  );
}
