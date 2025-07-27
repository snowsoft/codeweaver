// src/App.tsx güncellemesi
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import FileExplorer from './components/FileExplorer';
import Dashboard from './views/Dashboard';
import Editor from './views/Editor';
import Settings from './views/Settings';
import './App.css';

function App() {
    const [leftPanelWidth, setLeftPanelWidth] = useState(250);
    const [isLeftPanelVisible, setIsLeftPanelVisible] = useState(true);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);

    const handleFileSelect = (path: string) => {
        setSelectedFile(path);
        // Editor'e dosya yolu gönder
        console.log('Selected file:', path);
    };

    const toggleLeftPanel = () => {
        setIsLeftPanelVisible(!isLeftPanelVisible);
    };

    return (
        <div className="app" data-theme={localStorage.getItem('theme') || 'light'}>
            <Header onToggleExplorer={toggleLeftPanel} />
            <div className="app-body">
                <Sidebar />

                {isLeftPanelVisible && (
                    <>
                        <div
                            className="left-panel"
                            style={{ width: `${leftPanelWidth}px` }}
                        >
                            <FileExplorer onFileSelect={handleFileSelect} />
                        </div>

                        <div
                            className="panel-resizer"
                            style={{ left: `${leftPanelWidth + 60}px` }}
                            onMouseDown={(e) => {
                                const startX = e.clientX;
                                const startWidth = leftPanelWidth;

                                const handleMouseMove = (e: MouseEvent) => {
                                    const newWidth = startWidth + (e.clientX - startX);
                                    setLeftPanelWidth(Math.max(150, Math.min(500, newWidth)));
                                };

                                const handleMouseUp = () => {
                                    document.removeEventListener('mousemove', handleMouseMove);
                                    document.removeEventListener('mouseup', handleMouseUp);
                                };

                                document.addEventListener('mousemove', handleMouseMove);
                                document.addEventListener('mouseup', handleMouseUp);
                            }}
                        />
                    </>
                )}

                <main className="main-content" style={{
                    left: isLeftPanelVisible ? `${leftPanelWidth + 60}px` : '60px'
                }}>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/editor" element={<Editor selectedFile={selectedFile} />} />
                        <Route path="/settings" element={<Settings />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
}

export default App;