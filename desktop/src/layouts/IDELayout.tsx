// src/layouts/IDELayout.tsx
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import FileExplorer from '../components/FileExplorer';
import Terminal from '../views/Terminal';
import './IDELayout.css';

const IDELayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Panel states
    const [leftPanelWidth, setLeftPanelWidth] = useState(250);
    const [isLeftPanelVisible, setIsLeftPanelVisible] = useState(true);
    const [bottomPanelHeight, setBottomPanelHeight] = useState(200);
    const [isBottomPanelVisible, setIsBottomPanelVisible] = useState(false);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);

    // Toggle panels
    const toggleLeftPanel = () => setIsLeftPanelVisible(!isLeftPanelVisible);
    const toggleBottomPanel = () => setIsBottomPanelVisible(!isBottomPanelVisible);

    // File selection handler
    const handleFileSelect = (path: string) => {
        setSelectedFile(path);
        // Editor'e git
        if (location.pathname !== '/editor') {
            navigate('/editor');
        }
    };

    // Terminal açıldığında bottom panel'i göster
    useEffect(() => {
        if (location.pathname === '/terminal') {
            setIsBottomPanelVisible(true);
        }
    }, [location.pathname]);

    return (
        <div className="ide-layout">
            {/* Header */}
            <Header onToggleExplorer={toggleLeftPanel} onToggleTerminal={toggleBottomPanel} />

            <div className="ide-body">
                {/* Activity Bar (Sidebar) */}
                <Sidebar />

                {/* Side Panel (File Explorer) */}
                {isLeftPanelVisible && (
                    <>
                        <div
                            className="ide-side-panel"
                            style={{ width: `${leftPanelWidth}px` }}
                        >
                            <FileExplorer onFileSelect={handleFileSelect} />
                        </div>

                        {/* Vertical Resizer */}
                        <div
                            className="ide-resizer-vertical"
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
                                    document.body.style.cursor = '';
                                };

                                document.body.style.cursor = 'ew-resize';
                                document.addEventListener('mousemove', handleMouseMove);
                                document.addEventListener('mouseup', handleMouseUp);
                            }}
                        />
                    </>
                )}

                {/* Main Content Area */}
                <div
                    className="ide-main-content"
                    style={{
                        left: isLeftPanelVisible ? `${leftPanelWidth + 60}px` : '60px',
                        bottom: isBottomPanelVisible ? `${bottomPanelHeight}px` : '0'
                    }}
                >
                    <Outlet context={{ selectedFile }} />
                </div>

                {/* Bottom Panel (Terminal) */}
                {isBottomPanelVisible && (
                    <>
                        {/* Horizontal Resizer */}
                        <div
                            className="ide-resizer-horizontal"
                            style={{
                                bottom: `${bottomPanelHeight}px`,
                                left: '60px'
                            }}
                            onMouseDown={(e) => {
                                const startY = e.clientY;
                                const startHeight = bottomPanelHeight;

                                const handleMouseMove = (e: MouseEvent) => {
                                    const newHeight = startHeight - (e.clientY - startY);
                                    setBottomPanelHeight(Math.max(100, Math.min(600, newHeight)));
                                };

                                const handleMouseUp = () => {
                                    document.removeEventListener('mousemove', handleMouseMove);
                                    document.removeEventListener('mouseup', handleMouseUp);
                                    document.body.style.cursor = '';
                                };

                                document.body.style.cursor = 'ns-resize';
                                document.addEventListener('mousemove', handleMouseMove);
                                document.addEventListener('mouseup', handleMouseUp);
                            }}
                        />

                        <div
                            className="ide-bottom-panel"
                            style={{ height: `${bottomPanelHeight}px` }}
                        >
                            <Terminal />
                        </div>
                    </>
                )}
            </div>

            {/* Status Bar */}
            <div className="ide-status-bar">
                <div className="status-left">
                    <span className="status-item">UTF-8</span>
                    <span className="status-item">LF</span>
                    <span className="status-item">TypeScript React</span>
                </div>
                <div className="status-right">
                    <span className="status-item">Ln 1, Col 1</span>
                    <span className="status-item">Spaces: 2</span>
                </div>
            </div>
        </div>
    );
};

export default IDELayout;