// src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Çeviri dosyaları
import trTranslations from './locales/tr.json';
import enTranslations from './locales/en.json';

const resources = {
    en: {
        translation: enTranslations
    },
    tr: {
        translation: trTranslations
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'tr', // Varsayılan dil Türkçe
        lng: localStorage.getItem('language') || 'tr',

        interpolation: {
            escapeValue: false // React zaten XSS koruması sağlıyor
        },

        detection: {
            order: ['localStorage', 'navigator', 'htmlTag'],
            caches: ['localStorage']
        }
    });

export default i18n;