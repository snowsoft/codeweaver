// src/views/Settings/index.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './Settings.css';

const Settings: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const [language, setLanguage] = useState(localStorage.getItem('language') || 'tr');
    const [fontSize, setFontSize] = useState(localStorage.getItem('editorFontSize') || '14');
    const [tabSize, setTabSize] = useState(localStorage.getItem('editorTabSize') || '2');
    const [wordWrap, setWordWrap] = useState(localStorage.getItem('editorWordWrap') || 'on');
    const [minimap, setMinimap] = useState(localStorage.getItem('editorMinimap') || 'true');
    const [autoSave, setAutoSave] = useState(localStorage.getItem('autoSave') || 'off');
    const [showLineNumbers, setShowLineNumbers] = useState(localStorage.getItem('showLineNumbers') || 'true');

    // Tema değişikliği
    const handleThemeChange = (newTheme: string) => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);

        // Tema değişikliğini diğer componentlere bildir
        window.dispatchEvent(new Event('storage'));
    };

    // Dil değişikliği
    const handleLanguageChange = (newLang: string) => {
        setLanguage(newLang);
        localStorage.setItem('language', newLang);
        i18n.changeLanguage(newLang);
    };

    // Editor ayarlarını kaydet
    const saveEditorSettings = () => {
        localStorage.setItem('editorFontSize', fontSize);
        localStorage.setItem('editorTabSize', tabSize);
        localStorage.setItem('editorWordWrap', wordWrap);
        localStorage.setItem('editorMinimap', minimap);
        localStorage.setItem('showLineNumbers', showLineNumbers);

        // Editor ayarları değişikliğini bildir
        window.dispatchEvent(new CustomEvent('editorSettingsChanged', {
            detail: { fontSize, tabSize, wordWrap, minimap, showLineNumbers }
        }));
    };

    // Genel ayarları kaydet
    const saveGeneralSettings = () => {
        localStorage.setItem('autoSave', autoSave);
        window.dispatchEvent(new Event('storage'));
    };

    return (
        <div className="settings-container">
            <div className="settings-header">
                <h1>{t('settings.title', 'Ayarlar')}</h1>
            </div>

            <div className="settings-content">
                {/* Görünüm Ayarları */}
                <section className="settings-section">
                    <h2 className="section-title">{t('settings.appearance', 'Görünüm')}</h2>

                    <div className="setting-item">
                        <div className="setting-label">
                            <span className="label-text">{t('settings.theme', 'Tema')}</span>
                            <span className="label-description">
                {t('settings.themeDescription', 'Uygulama temasını seçin')}
              </span>
                        </div>
                        <div className="setting-control">
                            <div className="theme-selector">
                                <button
                                    className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                                    onClick={() => handleThemeChange('light')}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="5"></circle>
                                        <line x1="12" y1="1" x2="12" y2="3"></line>
                                        <line x1="12" y1="21" x2="12" y2="23"></line>
                                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                                        <line x1="1" y1="12" x2="3" y2="12"></line>
                                        <line x1="21" y1="12" x2="23" y2="12"></line>
                                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                                    </svg>
                                    {t('settings.lightMode', 'Açık')}
                                </button>
                                <button
                                    className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                                    onClick={() => handleThemeChange('dark')}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                                    </svg>
                                    {t('settings.darkMode', 'Koyu')}
                                </button>
                                <button
                                    className={`theme-option ${theme === 'system' ? 'active' : ''}`}
                                    onClick={() => handleThemeChange('system')}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                        <line x1="9" y1="3" x2="9" y2="21"></line>
                                    </svg>
                                    {t('settings.systemTheme', 'Sistem')}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="setting-item">
                        <div className="setting-label">
                            <span className="label-text">{t('settings.language', 'Dil')}</span>
                            <span className="label-description">
                {t('settings.languageDescription', 'Arayüz dilini seçin')}
              </span>
                        </div>
                        <div className="setting-control">
                            <select
                                value={language}
                                onChange={(e) => handleLanguageChange(e.target.value)}
                                className="select-input"
                            >
                                <option value="tr">Türkçe</option>
                                <option value="en">English</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Editor Ayarları */}
                <section className="settings-section">
                    <h2 className="section-title">{t('settings.editor', 'Editör')}</h2>

                    <div className="setting-item">
                        <div className="setting-label">
                            <span className="label-text">{t('settings.fontSize', 'Font Boyutu')}</span>
                            <span className="label-description">
                {t('settings.fontSizeDescription', 'Editör font boyutunu ayarlayın')}
              </span>
                        </div>
                        <div className="setting-control">
                            <select
                                value={fontSize}
                                onChange={(e) => setFontSize(e.target.value)}
                                onBlur={saveEditorSettings}
                                className="select-input"
                            >
                                <option value="12">12px</option>
                                <option value="13">13px</option>
                                <option value="14">14px</option>
                                <option value="15">15px</option>
                                <option value="16">16px</option>
                                <option value="18">18px</option>
                                <option value="20">20px</option>
                            </select>
                        </div>
                    </div>

                    <div className="setting-item">
                        <div className="setting-label">
                            <span className="label-text">{t('settings.tabSize', 'Tab Boyutu')}</span>
                            <span className="label-description">
                {t('settings.tabSizeDescription', 'Bir tab karakterinin boşluk sayısı')}
              </span>
                        </div>
                        <div className="setting-control">
                            <select
                                value={tabSize}
                                onChange={(e) => setTabSize(e.target.value)}
                                onBlur={saveEditorSettings}
                                className="select-input"
                            >
                                <option value="2">2</option>
                                <option value="4">4</option>
                                <option value="8">8</option>
                            </select>
                        </div>
                    </div>

                    <div className="setting-item">
                        <div className="setting-label">
                            <span className="label-text">{t('settings.wordWrap', 'Sözcük Kaydırma')}</span>
                            <span className="label-description">
                {t('settings.wordWrapDescription', 'Uzun satırları otomatik kaydır')}
              </span>
                        </div>
                        <div className="setting-control">
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={wordWrap === 'on'}
                                    onChange={(e) => {
                                        setWordWrap(e.target.checked ? 'on' : 'off');
                                        saveEditorSettings();
                                    }}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                    </div>

                    <div className="setting-item">
                        <div className="setting-label">
                            <span className="label-text">{t('settings.minimap', 'Mini Harita')}</span>
                            <span className="label-description">
                {t('settings.minimapDescription', 'Kod önizleme haritasını göster')}
              </span>
                        </div>
                        <div className="setting-control">
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={minimap === 'true'}
                                    onChange={(e) => {
                                        setMinimap(e.target.checked ? 'true' : 'false');
                                        saveEditorSettings();
                                    }}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                    </div>

                    <div className="setting-item">
                        <div className="setting-label">
                            <span className="label-text">{t('settings.lineNumbers', 'Satır Numaraları')}</span>
                            <span className="label-description">
                {t('settings.lineNumbersDescription', 'Satır numaralarını göster')}
              </span>
                        </div>
                        <div className="setting-control">
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={showLineNumbers === 'true'}
                                    onChange={(e) => {
                                        setShowLineNumbers(e.target.checked ? 'true' : 'false');
                                        saveEditorSettings();
                                    }}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </section>

                {/* Genel Ayarlar */}
                <section className="settings-section">
                    <h2 className="section-title">{t('settings.general', 'Genel')}</h2>

                    <div className="setting-item">
                        <div className="setting-label">
                            <span className="label-text">{t('settings.autoSave', 'Otomatik Kayıt')}</span>
                            <span className="label-description">
                {t('settings.autoSaveDescription', 'Dosyaları otomatik olarak kaydet')}
              </span>
                        </div>
                        <div className="setting-control">
                            <select
                                value={autoSave}
                                onChange={(e) => {
                                    setAutoSave(e.target.value);
                                    saveGeneralSettings();
                                }}
                                className="select-input"
                            >
                                <option value="off">{t('settings.off', 'Kapalı')}</option>
                                <option value="afterDelay">{t('settings.afterDelay', 'Gecikmeli')}</option>
                                <option value="onFocusChange">{t('settings.onFocusChange', 'Odak Değişiminde')}</option>
                                <option value="onWindowChange">{t('settings.onWindowChange', 'Pencere Değişiminde')}</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Hakkında */}
                <section className="settings-section">
                    <h2 className="section-title">{t('settings.about', 'Hakkında')}</h2>

                    <div className="about-content">
                        <div className="about-logo">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="16 18 22 12 16 6"></polyline>
                                <polyline points="8 6 2 12 8 18"></polyline>
                            </svg>
                        </div>
                        <div className="about-info">
                            <h3>CodeWeaver Desktop</h3>
                            <p>{t('settings.version', 'Sürüm')}: 1.0.0</p>
                            <p>{t('settings.description', 'AI destekli kod üretim ve dönüşüm aracı')}</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Settings;