// src/components/Sidebar/index.tsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Sidebar.css';

interface SidebarItem {
    id: string;
    icon: React.ReactNode;
    label: string;
    path: string;
}

const Sidebar: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const sidebarItems: SidebarItem[] = [
        {
            id: 'dashboard',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
            ),
            label: t('sidebar.dashboard', 'Dashboard'),
            path: '/'
        },
        {
            id: 'editor',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
            ),
            label: t('sidebar.editor', 'Editor'),
            path: '/editor'
        },
        {
            id: 'terminal',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="4 17 10 11 4 5"></polyline>
                    <line x1="12" y1="19" x2="20" y2="19"></line>
                </svg>
            ),
            label: t('sidebar.terminal', 'Terminal'),
            path: '/terminal'
        },
        {
            id: 'git',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="6" y1="3" x2="6" y2="15"></line>
                    <circle cx="18" cy="6" r="3"></circle>
                    <circle cx="6" cy="18" r="3"></circle>
                    <path d="M18 9a9 9 0 0 1-9 9"></path>
                </svg>
            ),
            label: t('sidebar.git', 'Git'),
            path: '/git'
        },
        {
            id: 'extensions',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
            ),
            label: t('sidebar.extensions', 'Extensions'),
            path: '/extensions'
        }
    ];

    return (
        <aside className="sidebar">
            <nav className="sidebar-nav">
                {sidebarItems.map((item) => (
                    <button
                        key={item.id}
                        className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
                        onClick={() => navigate(item.path)}
                        title={item.label}
                        type="button"
                    >
                        {item.icon}
                    </button>
                ))}
            </nav>

            <div className="sidebar-bottom">
                <button
                    className={`sidebar-item ${location.pathname === '/settings' ? 'active' : ''}`}
                    onClick={() => navigate('/settings')}
                    title={t('sidebar.settings', 'Settings')}
                    type="button"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3m16.24-6.36l-4.24 4.24m-6.36 6.36l-4.24 4.24m0-14.48l4.24 4.24m6.36 6.36l4.24 4.24"></path>
                    </svg>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;