// src/views/Dashboard/index.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    FileCode,
    GitBranch,
    Clock,
    CheckCircle,
    Activity,
    FolderOpen,
    Terminal,
    Zap
} from 'lucide-react';
import WeaverCommands from '../../components/WeaverCommands';
import './Dashboard.css';

const Dashboard = () => {
    const { t } = useTranslation();

    const stats = [
        {
            title: t('dashboard.stats.totalFiles', 'Toplam Dosyalar'),
            value: '156',
            icon: <FileCode size={24} />,
            color: 'blue'
        },
        {
            title: t('dashboard.stats.codeGenerated', 'Üretilen Kod'),
            value: '89',
            icon: <Zap size={24} />,
            color: 'green'
        },
        {
            title: t('dashboard.stats.testsCreated', 'Oluşturulan Testler'),
            value: '45',
            icon: <CheckCircle size={24} />,
            color: 'purple'
        },
        {
            title: t('dashboard.stats.reviewsDone', 'Yapılan İncelemeler'),
            value: '24',
            icon: <Activity size={24} />,
            color: 'orange'
        }
    ];

    const recentActivities = [
        {
            action: 'generated',
            file: 'user_service.py',
            time: '2 dakika önce',
            icon: <FileCode size={16} />
        },
        {
            action: 'refactored',
            file: 'api_handler.js',
            time: '15 dakika önce',
            icon: <GitBranch size={16} />
        },
        {
            action: 'documented',
            file: 'database.go',
            time: '1 saat önce',
            icon: <FileCode size={16} />
        },
        {
            action: 'tested',
            file: 'auth_module.ts',
            time: '2 saat önce',
            icon: <CheckCircle size={16} />
        }
    ];

    const handleOpenProject = async () => {
        if (window.electron) {
            const projectPath = await window.electron.openProject();
            if (projectPath) {
                console.log('Opened project:', projectPath);
                window.location.reload();
            }
        }
    };

    return (
        <div className="dashboard">
            <div className="dashboard-content">
                <div className="dashboard-header">
                    <h1>{t('dashboard.welcome', 'CodeWeaver Desktop\'a Hoş Geldiniz')}</h1>
                    <p className="dashboard-subtitle">
                        {t('dashboard.subtitle', 'AI destekli kod üretim ve dönüşüm aracınız')}
                    </p>
                </div>

                <div className="stats-container">
                    {stats.map((stat, index) => (
                        <div key={index} className={`stat-card stat-${stat.color}`}>
                            <div className="stat-icon">{stat.icon}</div>
                            <div className="stat-content">
                                <h3 className="stat-value">{stat.value}</h3>
                                <p className="stat-title">{stat.title}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="dashboard-grid">
                    <div className="dashboard-card">
                        <h2 className="card-title">
                            <Clock size={20} />
                            {t('dashboard.recentActivities', 'Son Aktiviteler')}
                        </h2>
                        <ul className="activity-list">
                            {recentActivities.map((activity, index) => (
                                <li key={index} className="activity-item">
                                    <div className="activity-icon">{activity.icon}</div>
                                    <div className="activity-content">
                    <span className="activity-action">
                      {t(`dashboard.activities.${activity.action}`, activity.action)}
                    </span>
                                        <span className="activity-file">{activity.file}</span>
                                    </div>
                                    <span className="activity-time">{activity.time}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="dashboard-card">
                        <h2 className="card-title">
                            <Zap size={20} />
                            {t('dashboard.quickActions', 'Hızlı İşlemler')}
                        </h2>
                        <div className="quick-actions">
                            <button className="quick-action-btn" onClick={() => console.log('New file')}>
                                <FileCode size={20} />
                                <span>{t('dashboard.newFile', 'Yeni Dosya')}</span>
                            </button>
                            <button className="quick-action-btn" onClick={handleOpenProject}>
                                <FolderOpen size={20} />
                                <span>{t('dashboard.openProject', 'Proje Aç')}</span>
                            </button>
                            <button className="quick-action-btn" onClick={() => console.log('Clone repo')}>
                                <GitBranch size={20} />
                                <span>{t('dashboard.cloneRepository', 'Repository Klonla')}</span>
                            </button>
                            <button className="quick-action-btn" onClick={() => console.log('Open terminal')}>
                                <Terminal size={20} />
                                <span>{t('dashboard.openTerminal', 'Terminal Aç')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;