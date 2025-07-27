// src/components/layout/Sidebar/index.tsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const menuItems = [
    { path: '/', label: t('navigation.dashboard'), icon: '📊' },
    { path: '/generate', label: t('navigation.generate'), icon: '✨' },
    { path: '/refactor', label: t('navigation.refactor'), icon: '🔧' },
    { path: '/document', label: t('navigation.document'), icon: '📝' },
    { path: '/test', label: t('navigation.test'), icon: '🧪' },
    { path: '/review', label: t('navigation.review'), icon: '🔍' },
    { path: '/history', label: t('navigation.history'), icon: '📜' },
    { path: '/settings', label: t('navigation.settings'), icon: '⚙️' },
  ];

  return (
      <aside className="w-64 bg-gray-800 border-r border-gray-700">
        <div className="p-4">
          <h3 className="text-xs uppercase text-gray-400 mb-4">{t('navigation.title')}</h3>

          <nav className="space-y-2">
            {menuItems.map((item) => (
                <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors flex items-center gap-2 ${
                        location.pathname === item.path
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:bg-gray-700'
                    }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
            ))}
          </nav>
        </div>
      </aside>
  );
};

export default Sidebar;