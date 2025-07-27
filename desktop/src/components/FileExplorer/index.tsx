// src/components/FileExplorer/index.tsx
import React, { useState, useEffect } from 'react';
import {
    ChevronRight,
    ChevronDown,
    File,
    Folder,
    FolderOpen,
    Plus,
    Trash2,
    Edit3,
    FileText,
    FileCode,
    Image,
    Archive
} from 'lucide-react';
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
                return <FileCode size={16} />;
            case 'md':
            case 'txt':
            case 'doc':
            case 'docx':
                return <FileText size={16} />;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'svg':
                return <Image size={16} />;
            case 'zip':
            case 'tar':
            case 'gz':
            case 'rar':
                return <Archive size={16} />;
            default:
                return <File size={16} />;
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
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </span>
                                <span className="file-icon">
                  {isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />}
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
                    <button title={t('fileExplorer.newFile', 'New File')}>
                        <Plus size={16} />
                    </button>
                    <button title={t('fileExplorer.refresh', 'Refresh')}>
                        <ChevronDown size={16} />
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
                        <Edit3 size={14} /> {t('fileExplorer.rename', 'Rename')}
                    </div>
                    <div className="context-menu-item">
                        <Trash2 size={14} /> {t('fileExplorer.delete', 'Delete')}
                    </div>
                    <div className="context-menu-divider"></div>
                    <div className="context-menu-item">
                        <Plus size={14} /> {t('fileExplorer.newFile', 'New File')}
                    </div>
                    <div className="context-menu-item">
                        <Folder size={14} /> {t('fileExplorer.newFolder', 'New Folder')}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileExplorer;