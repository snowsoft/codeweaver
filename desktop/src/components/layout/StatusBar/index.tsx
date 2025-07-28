// src/components/layout/StatusBar/index.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const StatusBar = () => {
    const { t } = useTranslation();

    return (
        <div className="bg-gray-800 text-white px-6 py-2 flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
        <span className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            {t('app.connected')}
        </span>
                <span>{t('app.model')}: codellama:13b-instruct</span>
            </div>
            <div className="flex items-center gap-4">
                <span>{t('app.ready')}</span>
            </div>
        </div>
    );
};

export default StatusBar;