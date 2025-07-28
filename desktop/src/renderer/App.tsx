// src/renderer/App.tsx
import React, { useState, useEffect } from 'react';
import Dashboard from '../views/Dashboard';
import Editor from './components/Editor';
import Terminal from './components/Terminal';
import Sidebar from './components/Sidebar';

const App: React.FC = () => {
    const [activeView, setActiveView] = useState<'dashboard' | 'editor'>('dashboard');
    const [isTerminalOpen, setIsTerminalOpen] = useState(false);

    useEffect(() => {
        // Listen for menu events
        window.api.on('menu:newFile', () => {
            setActiveView('editor');
        });

        window.api.on('weaver:generate', () => {
            setIsTerminalOpen(true);
        });

        return () => {
            window.api.removeAllListeners('menu:newFile');
            window.api.removeAllListeners('weaver:generate');
        };
    }, []);

    return (
        <div className="flex flex-col h-screen bg-gray-900">
            {/* Custom Titlebar */}
            <div className="h-8 bg-gray-800 flex items-center justify-center drag-region border-b border-gray-700">
                <span className="text-sm text-gray-400">CodeWeaver</span>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                <Sidebar onNavigate={setActiveView} activeView={activeView} />

                <main className="flex-1 flex flex-col">
                    {activeView === 'dashboard' ? <Dashboard /> : <Editor />}

                    {isTerminalOpen && (
                        <Terminal onClose={() => setIsTerminalOpen(false)} />
                    )}
                </main>
            </div>

            {/* Status Bar */}
            <div className="h-6 bg-blue-600 text-white flex items-center px-4 text-xs">
                <span>Ready</span>
            </div>
        </div>
    );
};

export default App;