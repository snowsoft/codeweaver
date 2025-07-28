// src/components/FileExplorer/index.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './FileExplorer.css';

// Optional window api typing for non-electron environments
declare global {
    interface Window {
        api?: {
            file?: {
                list: (dirPath: string) => Promise<{ success: boolean; files?: any[] }>;
                create: (filePath: string, isDir?: boolean) => Promise<{ success: boolean }>;
                delete: (filePath: string) => Promise<{ success: boolean }>;
                rename: (oldPath: string, newPath: string) => Promise<{ success: boolean }>;
            };
        };
    }
}

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
    const [isCreating, setIsCreating] = useState<{ type: 'file' | 'folder'; path: string } | null>(null);
    const [newItemName, setNewItemName] = useState('');

    const fetchFileTree = async () => {
        try {
            if (!window.api?.file?.list) {
                console.warn('File API not available');
                return;
            }
            const result = await window.api.file.list(rootPath);
            if (result.success && Array.isArray(result.files)) {
                setFileTree(result.files);
            }
        } catch (err) {
            console.error('Error loading file tree:', err);
        }
    };

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
            </svg>
        );

        const imageIcon = (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
        );

        const defaultIcon = (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                <polyline points="13 2 13 9 20 9"></polyline>
            </svg>
        );

        const codeExtensions = ['js', 'jsx', 'ts', 'tsx', 'py', 'go', 'java', 'cpp', 'c', 'php'];
        const textExtensions = ['md', 'txt', 'doc', 'docx', 'json', 'xml', 'yaml'];
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'bmp'];

        if (codeExtensions.includes(ext || '')) return codeIcon;
        if (textExtensions.includes(ext || '')) return textIcon;
        if (imageExtensions.includes(ext || '')) return imageIcon;
        return defaultIcon;
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
        console.log('File clicked:', node);

        if (node.type === 'file') {
            setSelectedFile(node.path);
            if (onFileSelect) {
                console.log('Calling onFileSelect with:', node.path);
                onFileSelect(node.path);
            }
        } else {
            toggleFolder(node.path);
        }
    };

    // Sağ tık menüsü
    const handleContextMenu = (e: React.MouseEvent, path: string) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, path });
    };

    // Yeni dosya/klasör oluşturma
    const handleNewFile = (parentPath: string = '') => {
        setIsCreating({ type: 'file', path: parentPath });
        setNewItemName('');
        setContextMenu(null);
    };

    const handleNewFolder = (parentPath: string = '') => {
        setIsCreating({ type: 'folder', path: parentPath });
        setNewItemName('');
        setContextMenu(null);
    };

    const handleCreateItem = async () => {
        if (!newItemName.trim() || !isCreating) return;

        const fullPath = isCreating.path ? `${isCreating.path}/${newItemName}` : newItemName;

        try {
            if (!window.api?.file?.create) {
                console.warn('File API not available');
                return;
            }
            await window.api.file.create(fullPath, isCreating.type === 'folder');
            await fetchFileTree();
        } catch (err) {
            console.error('Error creating item:', err);
        }

        setIsCreating(null);
        setNewItemName('');
    };

    const handleCancelCreate = () => {
        setIsCreating(null);
        setNewItemName('');
    };

    const handleDelete = async (path: string) => {
        try {
            if (!window.api?.file?.delete) {
                console.warn('File API not available');
                return;
            }
            await window.api.file.delete(path);
            await fetchFileTree();
        } catch (err) {
            console.error('Error deleting:', err);
        }
        setContextMenu(null);
    };

    const handleRename = async (oldPath: string) => {
        const name = oldPath.split('/').pop() || oldPath;
        const newName = prompt('Rename to:', name);
        if (!newName || newName === name) return;
        const newPath = oldPath.replace(/[^/]*$/, newName);
        try {
            if (!window.api?.file?.rename) {
                console.warn('File API not available');
                return;
            }
            await window.api.file.rename(oldPath, newPath);
            await fetchFileTree();
        } catch (err) {
            console.error('Error renaming:', err);
        }
    };

    // Dosya ağacı render
    const extensionClassMap: Record<string, string> = {
        js: 'ext-js',
        jsx: 'ext-js',
        ts: 'ext-ts',
        tsx: 'ext-ts',
        py: 'ext-py',
        go: 'ext-go',
        java: 'ext-java',
        c: 'ext-c',
        cpp: 'ext-cpp',
        php: 'ext-php',
        md: 'ext-md',
        txt: 'ext-txt',
        json: 'ext-json',
        yml: 'ext-yaml',
        yaml: 'ext-yaml',
        jpg: 'ext-image',
        jpeg: 'ext-image',
        png: 'ext-image',
        gif: 'ext-image',
        svg: 'ext-image',
        bmp: 'ext-image',
    };

    const getExtensionClass = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase() || '';
        return extensionClassMap[ext] || '';
    };

    const renderTree = (nodes: FileNode[], level = 0) => {
        return nodes.map((node) => {
            const isExpanded = expandedFolders.has(node.path);
            const isSelected = selectedFile === node.path;
            const extClass = node.type === 'file' ? getExtensionClass(node.name) : '';

            return (
                <div key={node.path}>
                    <div
                        className={`file-item ${extClass} ${isSelected ? 'selected' : ''}`}
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                  </svg>
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

    // Dosya ağacını yükle
    useEffect(() => {
        fetchFileTree();
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
                    <button
                        title={t('fileExplorer.newFile', 'New File')}
                        type="button"
                        onClick={() => handleNewFile()}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="12" y1="18" x2="12" y2="12"></line>
                            <line x1="9" y1="15" x2="15" y2="15"></line>
                        </svg>
                    </button>
                    <button
                        title={t('fileExplorer.newFolder', 'New Folder')}
                        type="button"
                        onClick={() => handleNewFolder()}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                            <line x1="12" y1="11" x2="12" y2="17"></line>
                            <line x1="9" y1="14" x2="15" y2="14"></line>
                        </svg>
                    </button>
                </div>
            </div>

            <div className="file-tree">
                {isCreating && isCreating.path === '' && (
                    <div className="file-item creating-item" style={{ paddingLeft: '10px' }}>
            <span className="file-icon">
              {isCreating.type === 'file' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                      <polyline points="13 2 13 9 20 9"></polyline>
                  </svg>
              ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                  </svg>
              )}
            </span>
                        <input
                            type="text"
                            className="new-item-input"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCreateItem();
                                if (e.key === 'Escape') handleCancelCreate();
                            }}
                            onBlur={handleCreateItem}
                            autoFocus
                            placeholder={isCreating.type === 'file' ? 'file.ts' : 'folder-name'}
                        />
                    </div>
                )}
                {renderTree(fileTree)}
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <div
                    className="context-menu"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                >
                    <div className="context-menu-item" onClick={() => handleRename(contextMenu.path)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
                        </svg>
                        <span>Rename</span>
                    </div>
                    <div className="context-menu-item" onClick={() => handleDelete(contextMenu.path)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        <span>{t('fileExplorer.delete', 'Delete')}</span>
                    </div>
                    <div className="context-menu-divider"></div>
                    <div className="context-menu-item" onClick={() => handleNewFile(contextMenu.path)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                            <polyline points="13 2 13 9 20 9"></polyline>
                            <line x1="12" y1="18" x2="12" y2="12"></line>
                            <line x1="9" y1="15" x2="15" y2="15"></line>
                        </svg>
                        <span>{t('fileExplorer.newFile', 'New File')}</span>
                    </div>
                    <div className="context-menu-item" onClick={() => handleNewFolder(contextMenu.path)}>
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