import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from './locales/en/translation.json';
import mrTranslation from './locales/mr/translation.json';
import guTranslation from './locales/gu/translation.json';
import mlTranslation from './locales/ml/translation.json';
import taTranslation from './locales/ta/translation.json';
import teTranslation from './locales/te/translation.json';
import paTranslation from './locales/pa/translation.json';
import hiTranslation from './locales/hi/translation.json';

// Add more languages as needed

const resources = {
  en: { translation: enTranslation },
  hi: { translation: hiTranslation },
  mr: { translation: mrTranslation },
  gu: { translation: guTranslation },
  ml: { translation: mlTranslation },
  ta: { translation: taTranslation },
  te: { translation: teTranslation },
  pa: { translation: paTranslation },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
