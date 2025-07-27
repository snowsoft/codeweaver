// src/components/FileExplorer/index.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ChevronRight,
    ChevronDown,
    File,
    Folder,
    FolderOpen,
    Plus,
    RefreshCw,
    FileText,
    FileCode,
    FileJson,
    Image,
    MoreVertical
} from 'lucide-react';
import { Menu, Item, useContextMenu } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';

interface FileNode {
    name: string;
    path: string;
    type: 'file' | 'directory';
    children?: FileNode[];
    expanded?: boolean;
}

interface FileExplorerProps {
    onFileSelect?: (path: string) => void;
    rootPath?: string;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ onFileSelect, rootPath = '.' }) => {
    const { t } = useTranslation();
    const [files, setFiles] = useState<FileNode[]>([]);
    const [selectedPath, setSelectedPath] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { show } = useContextMenu({ id: 'file-menu' });

    // File icon based on extension
    const getFileIcon = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'js':
            case 'jsx':
            case 'ts':
            case 'tsx':
                return <FileCode className="w-4 h-4 text-yellow-500" />;
            case 'json':
                return <FileJson className="w-4 h-4 text-orange-500" />;
            case 'md':
            case 'txt':
                return <FileText className="w-4 h-4 text-gray-400" />;
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'gif':
                return <Image className="w-4 h-4 text-green-500" />;
            default:
                return <File className="w-4 h-4 text-gray-400" />;
        }
    };

    // Load files from API
    const loadFiles = async (path: string = rootPath) => {
        setLoading(true);
        try {
            if (window.api?.file?.list) {
                const result = await window.api.file.list(path);
                if (result.success) {
                    setFiles(result.files);
                }
            } else {
                // Mock data for development
                setFiles([
                    {
                        name: 'src',
                        path: '/src',
                        type: 'directory',
                        children: [
                            { name: 'main.tsx', path: '/src/main.tsx', type: 'file' },
                            { name: 'App.tsx', path: '/src/App.tsx', type: 'file' },
                            { name: 'index.css', path: '/src/index.css', type: 'file' },
                        ]
                    },
                    { name: 'package.json', path: '/package.json', type: 'file' },
                    { name: 'README.md', path: '/README.md', type: 'file' },
                ]);
            }
        } catch (error) {
            console.error('Failed to load files:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFiles();
    }, [rootPath]);

    const toggleExpand = (node: FileNode) => {
        node.expanded = !node.expanded;
        setFiles([...files]);
    };

    const handleFileClick = (node: FileNode) => {
        if (node.type === 'file') {
            setSelectedPath(node.path);
            onFileSelect?.(node.path);
        } else {
            toggleExpand(node);
        }
    };

    const handleContextMenu = (e: React.MouseEvent, node: FileNode) => {
        e.preventDefault();
        show({ event: e, props: { node } });
    };

    const renderTree = (nodes: FileNode[], level = 0) => {
        return nodes.map((node) => (
            <div key={node.path}>
                <div
                    className={`flex items-center gap-2 px-2 py-1 hover:bg-gray-700 cursor-pointer text-sm ${
                        selectedPath === node.path ? 'bg-gray-700' : ''
                    }`}
                    style={{ paddingLeft: `${level * 16 + 8}px` }}
                    onClick={() => handleFileClick(node)}
                    onContextMenu={(e) => handleContextMenu(e, node)}
                >
                    {node.type === 'directory' && (
                        node.expanded ?
                            <ChevronDown className="w-4 h-4" /> :
                            <ChevronRight className="w-4 h-4" />
                    )}
                    {node.type === 'directory' ? (
                        node.expanded ?
                            <FolderOpen className="w-4 h-4 text-blue-400" /> :
                            <Folder className="w-4 h-4 text-blue-400" />
                    ) : (
                        getFileIcon(node.name)
                    )}
                    <span className="text-gray-300">{node.name}</span>
                </div>
                {node.type === 'directory' && node.expanded && node.children && (
                    renderTree(node.children, level + 1)
                )}
            </div>
        ));
    };

    return (
        <div className="h-full bg-gray-800 border-r border-gray-700 flex flex-col">
            <div className="p-3 border-b border-gray-700 flex items-center justify-between">
                <h3 className="text-xs uppercase text-gray-400">{t('fileExplorer.title')}</h3>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => loadFiles()}
                        className="p-1 hover:bg-gray-700 rounded"
                        title={t('common.refresh')}
                    >
                        <RefreshCw className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                        className="p-1 hover:bg-gray-700 rounded"
                        title={t('fileExplorer.newFile')}
                    >
                        <Plus className="w-4 h-4 text-gray-400" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="p-4 text-center text-gray-400">Loading...</div>
                ) : files.length === 0 ? (
                    <div className="p-4 text-center text-gray-400">No files</div>
                ) : (
                    renderTree(files)
                )}
            </div>

            <Menu id="file-menu">
                <Item onClick={() => console.log('New File')}>
                    {t('fileExplorer.newFile')}
                </Item>
                <Item onClick={() => console.log('New Folder')}>
                    {t('fileExplorer.newFolder')}
                </Item>
                <Item onClick={() => console.log('Rename')}>
                    {t('fileExplorer.rename')}
                </Item>
                <Item onClick={() => console.log('Delete')}>
                    {t('fileExplorer.delete')}
                </Item>
            </Menu>
        </div>
    );
};

export default FileExplorer;