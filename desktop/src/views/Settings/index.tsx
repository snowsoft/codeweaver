// src/views/Settings/index.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const Settings: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [currentLang, setCurrentLang] = useState(i18n.language);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const [fontSize, setFontSize] = useState(localStorage.getItem('fontSize') || '14');
    const [tabSize, setTabSize] = useState(localStorage.getItem('tabSize') || '2');
    const [wordWrap, setWordWrap] = useState(localStorage.getItem('wordWrap') || 'on');

    const languages = [
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    ];

    const handleLanguageChange = (lang: string) => {
        setCurrentLang(lang);
        i18n.changeLanguage(lang);
        localStorage.setItem('language', lang);
    };

    const handleThemeChange = (newTheme: string) => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        // Apply theme to document
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const handleFontSizeChange = (size: string) => {
        setFontSize(size);
        localStorage.setItem('fontSize', size);
    };

    const handleTabSizeChange = (size: string) => {
        setTabSize(size);
        localStorage.setItem('tabSize', size);
    };

    const handleWordWrapChange = (wrap: string) => {
        setWordWrap(wrap);
        localStorage.setItem('wordWrap', wrap);
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                {t('settings.title')}
            </h1>

            <div className="space-y-6">
                {/* Language Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        {t('settings.language')}
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                className={`p-4 rounded-lg border-2 transition-all ${
                                    currentLang === lang.code
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                }`}
                            >
                                <div className="text-2xl mb-2">{lang.flag}</div>
                                <div className="font-medium text-gray-900 dark:text-white">{lang.name}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Theme Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        {t('settings.theme')}
                    </h2>
                    <div className="grid grid-cols-3 gap-4">
                        {['light', 'dark', 'system'].map((themeOption) => (
                            <button
                                key={themeOption}
                                onClick={() => handleThemeChange(themeOption)}
                                className={`p-4 rounded-lg border-2 transition-all ${
                                    theme === themeOption
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                }`}
                            >
                                <div className="text-2xl mb-2">
                                    {themeOption === 'light' ? '☀️' : themeOption === 'dark' ? '🌙' : '💻'}
                                </div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                    {t(`settings.themes.${themeOption}`)}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Editor Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        {t('settings.editor')}
                    </h2>

                    <div className="space-y-4">
                        {/* Font Size */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('settings.fontSize')}
                            </label>
                            <select
                                value={fontSize}
                                onChange={(e) => handleFontSizeChange(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         focus:outline-none dark:bg-gray-700 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {['12', '14', '16', '18', '20'].map((size) => (
                                    <option key={size} value={size}>{size}px</option>
                                ))}
                            </select>
                        </div>

                        {/* Tab Size */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('settings.tabSize')}
                            </label>
                            <select
                                value={tabSize}
                                onChange={(e) => handleTabSizeChange(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         focus:outline-none dark:bg-gray-700 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {['2', '4', '8'].map((size) => (
                                    <option key={size} value={size}>{size}</option>
                                ))}
                            </select>
                        </div>

                        {/* Word Wrap */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('settings.wordWrap')}
                            </label>
                            <div className="flex gap-4">
                                {['on', 'off'].map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => handleWordWrapChange(option)}
                                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
                                            wordWrap === option
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                        }`}
                                    >
                    <span className="font-medium text-gray-900 dark:text-white">
                      {t(`settings.${option}`)}
                    </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;