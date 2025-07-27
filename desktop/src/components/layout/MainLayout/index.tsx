// src/components/layout/MainLayout/index.tsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar';
import StatusBar from '../StatusBar';
import FileExplorer from '../../FileExplorer';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

const MainLayout = () => {
    const [showExplorer, setShowExplorer] = useState(true);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);

    const handleFileSelect = (path: string) => {
        setSelectedFile(path);
        // TODO: Open file in editor
        console.log('Selected file:', path);
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            <Sidebar />

            {/* File Explorer */}
            <div className={`transition-all duration-200 ${showExplorer ? 'w-64' : 'w-0'} overflow-hidden`}>
                {showExplorer && (
                    <FileExplorer onFileSelect={handleFileSelect} />
                )}
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Explorer Toggle Button */}
                <div className="h-10 bg-gray-800 border-b border-gray-700 flex items-center px-2">
                    <button
                        onClick={() => setShowExplorer(!showExplorer)}
                        className="p-1 hover:bg-gray-700 rounded"
                        title={showExplorer ? 'Hide Explorer' : 'Show Explorer'}
                    >
                        {showExplorer ? (
                            <PanelLeftClose className="w-4 h-4 text-gray-400" />
                        ) : (
                            <PanelLeftOpen className="w-4 h-4 text-gray-400" />
                        )}
                    </button>
                    {selectedFile && (
                        <span className="ml-2 text-sm text-gray-400">
              {selectedFile.split('/').pop()}
            </span>
                    )}
                </div>

                <main className="flex-1 overflow-auto">
                    <Outlet context={{ selectedFile }} />
                </main>
                <StatusBar />
            </div>
        </div>
    );
};

export default MainLayout;