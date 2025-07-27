// src/components/Header/index.tsx
import React from 'react';
import { Menu, FolderOpen, Terminal, GitBranch, Search, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './Header.css';

interface HeaderProps {
    onToggleExplorer?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleExplorer }) => {
    const { t } = useTranslation();

    return (
        <header className="app-header">
            <div className="header-left">
                <button className="header-menu-btn" onClick={onToggleExplorer} title="Toggle Explorer">
                    <Menu size={20} />
                </button>
                <h1 className="header-title">{t('header.title', 'CodeWeaver Desktop')}</h1>
            </div>

            <div className="header-center">
                <div className="search-box">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder={t('header.search', 'Search files...')}
                        className="search-input"
                    />
                </div>
            </div>

            <div className="header-right">
                <button className="header-action-btn" title={t('header.openFolder', 'Open Folder')}>
                    <FolderOpen size={18} />
                </button>
                <button className="header-action-btn" title={t('header.terminal', 'Terminal')}>
                    <Terminal size={18} />
                </button>
                <button className="header-action-btn" title={t('header.git', 'Git')}>
                    <GitBranch size={18} />
                </button>
                <button className="header-action-btn" title={t('header.settings', 'Settings')}>
                    <Settings size={18} />
                </button>
            </div>
        </header>
    );
};

export default Header;