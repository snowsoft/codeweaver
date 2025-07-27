// src/views/Dashboard/index.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const Dashboard: React.FC = () => {
    const { t } = useTranslation();

    const stats = [
        { label: t('dashboard.stats.totalFiles'), value: '24', color: 'bg-blue-500', icon: '📄' },
        { label: t('dashboard.stats.codeGenerated'), value: '156', color: 'bg-green-500', icon: '✨' },
        { label: t('dashboard.stats.testsCreated'), value: '89', color: 'bg-purple-500', icon: '🧪' },
        { label: t('dashboard.stats.reviewsDone'), value: '45', color: 'bg-orange-500', icon: '🔍' }
    ];

    const recentActivities = [
        { action: t('dashboard.activities.generated'), file: 'user_service.py', time: '2 minutes ago' },
        { action: t('dashboard.activities.refactored'), file: 'api_handler.js', time: '15 minutes ago' },
        { action: t('dashboard.activities.documented'), file: 'database.go', time: '1 hour ago' },
        { action: t('dashboard.activities.tested'), file: 'auth_module.ts', time: '2 hours ago' }
    ];

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                {t('dashboard.title')}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-lg text-white ${stat.color}`}>
                                <span className="text-2xl">{stat.icon}</span>
                            </div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {stat.value}
                            </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    {t('dashboard.recentActivities')}
                </h2>
                <ul className="space-y-3">
                    {recentActivities.map((activity, index) => (
                        <li key={index} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                            <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {activity.action}
                </span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {activity.file}
                </span>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-500">
                {activity.time}
              </span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                    {t('dashboard.quickActions.generate')}
                </button>
                <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
                    {t('dashboard.quickActions.refactor')}
                </button>
                <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
                    {t('dashboard.quickActions.createTests')}
                </button>
                <button className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors">
                    {t('dashboard.quickActions.review')}
                </button>
            </div>
        </div>
    );
};

export default Dashboard;