'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Language } from '@/types';
import { bnDictionary } from './bn';
import { enDictionary } from './en';
import type { Dictionary } from './types';

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: Dictionary;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const STORAGE_KEY = 'roktobondhu_lang';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('en');

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === 'bn' || saved === 'en') {
        setLangState(saved);
      }
    } catch {
      // Ignore storage errors in restricted environments
    }
  }, []);

  const setLang = (next: Language) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore
    }
  };

  const toggleLang = () => setLang(lang === 'en' ? 'bn' : 'en');

  const value: LanguageContextValue = {
    lang,
    setLang,
    toggleLang,
    t: lang === 'bn' ? bnDictionary : enDictionary,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return ctx;
}
