'use client';

import { useLanguage } from '@/context/LanguageContext';
import { Languages } from 'lucide-react';

export default function LanguageToggle({ className = '', variant = 'pill' }) {
  const { lang, setLang } = useLanguage();

  if (variant === 'sidebar') {
    return (
      <div className={`flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 ${className}`}>
        <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
          <Languages className="w-4 h-4 text-[#F1AD1A]" />
          <span>{lang === 'bn' ? 'ভাষা' : 'Language'}</span>
        </div>
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setLang('bn')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
              lang === 'bn'
                ? 'bg-[#B62A35] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            বাংলা
          </button>
          <button
            type="button"
            onClick={() => setLang('en')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
              lang === 'en'
                ? 'bg-[#B62A35] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            EN
          </button>
        </div>
      </div>
    );
  }

  // Default sleek pill variant for Navbar and headers
  return (
    <div
      className={`inline-flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-2xs ${className}`}
      title={lang === 'bn' ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
    >
      <button
        type="button"
        onClick={() => setLang('bn')}
        className={`px-2.5 py-1 rounded-full text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
          lang === 'bn'
            ? 'bg-[#B62A35] text-white shadow-xs scale-102'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <span>বাংলা</span>
      </button>

      <button
        type="button"
        onClick={() => setLang('en')}
        className={`px-2.5 py-1 rounded-full text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
          lang === 'en'
            ? 'bg-[#1D3557] text-white shadow-xs scale-102'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <span>EN</span>
      </button>
    </div>
  );
}
