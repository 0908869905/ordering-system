import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TRANSLATIONS } from './constants';

type Language = 'zh-Hant' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('zh-Hant');

  const t = (path: string): string => {
    const keys = path.split('.');
    let current: any = TRANSLATIONS[language];
    for (const key of keys) {
      if (current[key] === undefined) {
        // Fallback to Chinese if missing
        let fallback: any = TRANSLATIONS['zh-Hant'];
        for (const k of keys) {
             fallback = fallback?.[k];
        }
        return fallback || path;
      }
      current = current[key];
    }
    return current;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};