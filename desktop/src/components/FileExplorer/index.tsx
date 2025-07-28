// src/components/FileExplorer/index.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './FileExplorer.css';

interface FileNode {
    name: string;
    path: string;
    type: 'file' | 'directory';
    children?: FileNode[];
    extension?: string;
}

interface FileExplorerProps {
    onFileSelect?: (path: string) => void;
    rootPath?: string;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ onFileSelect, rootPath = '.' }) => {
    const { t } = useTranslation();
    const [fileTree, setFileTree] = useState<FileNode[]>([]);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
    const [selectedFile, setSelectedFile] = useState<string>('');
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; path: string } | null>(null);

    // Dosya uzantısına göre ikon seçimi
    const getFileIcon = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase();

        const codeIcon = (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
        );

        const textIcon = (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
        );

        const imageIcon = (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
        );

        const archiveIcon = (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="21 8 21 21 3 21 3 8"></polyline>
                <rect x="1" y="3" width="22" height="5"></rect>
                <line x1="10" y1="12" x2="14" y2="12"></line>
            </svg>
        );

        const defaultIcon = (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                <polyline points="13 2 13 9 20 9"></polyline>
            </svg>
        );

        switch (ext) {
            case 'js':
            case 'jsx':
            case 'ts':
            case 'tsx':
            case 'py':
            case 'go':
            case 'java':
            case 'cpp':
            case 'c':
            case 'php':
                return codeIcon;
            case 'md':
            case 'txt':
            case 'doc':
            case 'docx':
                return textIcon;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'svg':
                return imageIcon;
            case 'zip':
            case 'tar':
            case 'gz':
            case 'rar':
                return archiveIcon;
            default:
                return defaultIcon;
        }
    };

    // Klasör aç/kapa
    const toggleFolder = (path: string) => {
        setExpandedFolders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(path)) {
                newSet.delete(path);
            } else {
                newSet.add(path);
            }
            return newSet;
        });
    };

    // Dosya seçimi
    const handleFileClick = (node: FileNode) => {
        if (node.type === 'file') {
            setSelectedFile(node.path);
            onFileSelect?.(node.path);
        } else {
            toggleFolder(node.path);
        }
    };

    // Sağ tık menüsü
    const handleContextMenu = (e: React.MouseEvent, path: string) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, path });
    };

    // Dosya ağacı render
    const renderTree = (nodes: FileNode[], level = 0) => {
        return nodes.map((node) => {
            const isExpanded = expandedFolders.has(node.path);
            const isSelected = selectedFile === node.path;

            return (
                <div key={node.path}>
                    <div
                        className={`file-item ${isSelected ? 'selected' : ''}`}
                        style={{ paddingLeft: `${level * 20 + 10}px` }}
                        onClick={() => handleFileClick(node)}
                        onContextMenu={(e) => handleContextMenu(e, node.path)}
                    >
                        {node.type === 'directory' ? (
                            <>
                <span className="file-icon">
                  {isExpanded ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                  ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                  )}
                </span>
                                <span className="file-icon">
                  {isExpanded ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                          <line x1="10" y1="13" x2="10" y2="17"></line>
                          <line x1="14" y1="13" x2="14" y2="17"></line>
                      </svg>
                  ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                      </svg>
                  )}
                </span>
                            </>
                        ) : (
                            <>
                                <span className="file-icon" style={{ width: '16px' }}></span>
                                <span className="file-icon">{getFileIcon(node.name)}</span>
                            </>
                        )}
                        <span className="file-name">{node.name}</span>
                    </div>
                    {node.type === 'directory' && isExpanded && node.children && (
                        <div>{renderTree(node.children, level + 1)}</div>
                    )}
                </div>
            );
        });
    };

    // Electron IPC ile dosya sistemi okuma
    useEffect(() => {
        const loadFileTree = async () => {
            if (window.electron) {
                try {
                    const tree = await window.electron.readDirectory(rootPath);
                    setFileTree(tree);
                } catch (error) {
                    console.error('Dosya ağacı yüklenemedi:', error);
                }
            } else {
                // Demo veri
                setFileTree([
                    {
                        name: 'src',
                        path: '/src',
                        type: 'directory',
                        children: [
                            {
                                name: 'components',
                                path: '/src/components',
                                type: 'directory',
                                children: [
                                    { name: 'Button.tsx', path: '/src/components/Button.tsx', type: 'file' },
                                    { name: 'Input.tsx', path: '/src/components/Input.tsx', type: 'file' }
                                ]
                            },
                            { name: 'App.tsx', path: '/src/App.tsx', type: 'file' },
                            { name: 'main.tsx', path: '/src/main.tsx', type: 'file' }
                        ]
                    },
                    { name: 'package.json', path: '/package.json', type: 'file' },
                    { name: 'README.md', path: '/README.md', type: 'file' }
                ]);
            }
        };

        loadFileTree();
    }, [rootPath]);

    // Context menüyü kapat
    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    return (
        <div className="file-explorer">
            <div className="file-explorer-header">
                <h3>{t('fileExplorer.title', 'EXPLORER')}</h3>
                <div className="file-explorer-actions">
                    <button title={t('fileExplorer.newFile', 'New File')} type="button">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>
                    <button title={t('fileExplorer.refresh', 'Refresh')} type="button">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="23 4 23 10 17 10"></polyline>
                            <polyline points="1 20 1 14 7 14"></polyline>
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                        </svg>
                    </button>
                </div>
            </div>
            <div className="file-tree">
                {renderTree(fileTree)}
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <div
                    className="context-menu"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                >
                    <div className="context-menu-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        <span>{t('fileExplorer.rename', 'Rename')}</span>
                    </div>
                    <div className="context-menu-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        <span>{t('fileExplorer.delete', 'Delete')}</span>
                    </div>
                    <div className="context-menu-divider"></div>
                    <div className="context-menu-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                            <polyline points="13 2 13 9 20 9"></polyline>
                            <line x1="12" y1="18" x2="12" y2="12"></line>
                            <line x1="9" y1="15" x2="15" y2="15"></line>
                        </svg>
                        <span>{t('fileExplorer.newFile', 'New File')}</span>
                    </div>
                    <div className="context-menu-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                            <line x1="12" y1="11" x2="12" y2="17"></line>
                            <line x1="9" y1="14" x2="15" y2="14"></line>
                        </svg>
                        <span>{t('fileExplorer.newFolder', 'New Folder')}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileExplorer;