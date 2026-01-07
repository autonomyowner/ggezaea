'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language, Translations } from '../lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem('matcha-language') as Language;
    if (saved && (saved === 'en' || saved === 'fr' || saved === 'ar')) {
      setLanguageState(saved);
      // Set RTL for Arabic
      document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr';
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('matcha-language', lang);
    // Update html lang attribute
    document.documentElement.lang = lang;
    // Set RTL for Arabic
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
