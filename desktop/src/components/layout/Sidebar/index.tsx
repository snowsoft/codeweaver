// src/components/Sidebar/index.tsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  FileCode,
  Terminal,
  GitBranch,
  Package,
  Settings
} from 'lucide-react';
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
      icon: <Home size={20} />,
      label: t('sidebar.dashboard', 'Dashboard'),
      path: '/'
    },
    {
      id: 'editor',
      icon: <FileCode size={20} />,
      label: t('sidebar.editor', 'Editor'),
      path: '/editor'
    },
    {
      id: 'terminal',
      icon: <Terminal size={20} />,
      label: t('sidebar.terminal', 'Terminal'),
      path: '/terminal'
    },
    {
      id: 'git',
      icon: <GitBranch size={20} />,
      label: t('sidebar.git', 'Git'),
      path: '/git'
    },
    {
      id: 'extensions',
      icon: <Package size={20} />,
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
          >
            <Settings size={20} />
          </button>
        </div>
      </aside>
  );
};

export default Sidebar;