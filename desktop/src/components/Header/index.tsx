// src/components/Header/index.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import './Header.css';

interface HeaderProps {
    onToggleExplorer?: () => void;
    onToggleTerminal?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleExplorer, onToggleTerminal }) => {
    const { t } = useTranslation();

    return (
        <header className="app-header">
            <div className="header-left">
                <button
                    className="header-menu-btn"
                    onClick={onToggleExplorer}
                    title="Toggle Explorer"
                    type="button"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>
                <h1 className="header-title">{t('header.title', 'CodeWeaver Desktop')}</h1>
            </div>

            <div className="header-center">
                <div className="search-box">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <input
                        type="text"
                        placeholder={t('header.search', 'Search files...')}
                        className="search-input"
                    />
                </div>
            </div>

            <div className="header-right">
                <button
                    className="header-action-btn"
                    title={t('header.openFolder', 'Open Folder')}
                    type="button"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                    </svg>
                </button>

                <button
                    className="header-action-btn"
                    onClick={onToggleTerminal}
                    title={t('header.terminal', 'Terminal')}
                    type="button"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="4 17 10 11 4 5"></polyline>
                        <line x1="12" y1="19" x2="20" y2="19"></line>
                    </svg>
                </button>

                <button
                    className="header-action-btn"
                    title={t('header.git', 'Git')}
                    type="button"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="6" y1="3" x2="6" y2="15"></line>
                        <circle cx="18" cy="6" r="3"></circle>
                        <circle cx="6" cy="18" r="3"></circle>
                        <path d="M18 9a9 9 0 0 1-9 9"></path>
                    </svg>
                </button>

                <button
                    className="header-action-btn"
                    title={t('header.settings', 'Settings')}
                    type="button"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3m16.24-6.36l-4.24 4.24m-6.36 6.36l-4.24 4.24m0-14.48l4.24 4.24m6.36 6.36l4.24 4.24"></path>
                    </svg>
                </button>
            </div>
        </header>
    );
};

export default Header;