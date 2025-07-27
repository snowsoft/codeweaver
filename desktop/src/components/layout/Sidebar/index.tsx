import { Link, useLocation } from 'react-router-dom';
import {
    IconHome,
    IconCode,
    IconRefresh,
    IconFileText,
    IconTestPipe,
    IconEye,
    IconSettings,
    IconHistory
} from '@tabler/icons-react';

interface MenuItem {
    path: string;
    icon: React.ElementType;
    label: string;
}

const menuItems: MenuItem[] = [
    { path: '/', icon: IconHome, label: 'Dashboard' },
    { path: '/generate', icon: IconCode, label: 'Generate Code' },
    { path: '/refactor', icon: IconRefresh, label: 'Refactor' },
    { path: '/document', icon: IconFileText, label: 'Document' },
    { path: '/test', icon: IconTestPipe, label: 'Test' },
    { path: '/review', icon: IconEye, label: 'Review' },
    { path: '/history', icon: IconHistory, label: 'History' },
    { path: '/settings', icon: IconSettings, label: 'Settings' },
];

export function Sidebar() {
    const location = useLocation();

    return (
        <div className="w-64 bg-gray-900 text-white flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-gray-800">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <IconCode size={28} />
                    CodeWeaver
                </h1>
                <p className="text-sm text-gray-400 mt-1">AI-Powered Coding Assistant</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`
                flex items-center gap-3 px-6 py-3 transition-colors
                hover:bg-gray-800 hover:text-white
                ${isActive ? 'bg-gray-800 text-white border-l-4 border-blue-500' : 'text-gray-300'}
              `}
                        >
                            <Icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-800">
                <div className="text-xs text-gray-500">
                    <p>Version 2.0.0</p>
                    <p className="mt-1">© 2024 Snowsoft</p>
                </div>
            </div>
        </div>
    );
}