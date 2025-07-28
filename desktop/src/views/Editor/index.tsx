// src/views/Editor/index.tsx
import React, { useEffect, useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useTranslation } from 'react-i18next';
import {
    X,
    Save,
    FileCode,
    FileText,
    Image as ImageIcon,
    Archive,
    File
} from 'lucide-react';
import './Editor.css';

interface Tab {
    id: string;
    path: string;
    name: string;
    content: string;
    language: string;
    isDirty: boolean;
}

interface EditorProps {
    selectedFile?: string | null;
    editorFiles?: string[];
    setEditorFiles?: React.Dispatch<React.SetStateAction<string[]>>;
}

const EditorView: React.FC<EditorProps> = ({ selectedFile, editorFiles = [], setEditorFiles }) => {
    const { t } = useTranslation();
    const [tabs, setTabs] = useState<Tab[]>([]);
    const [activeTabId, setActiveTabId] = useState<string | null>(null);
    const [theme, setTheme] = useState(localStorage.getItem('theme') === 'dark' ? 'vs-dark' : 'vs');
    const [editorSettings, setEditorSettings] = useState({
        fontSize: parseInt(localStorage.getItem('editorFontSize') || '14'),
        tabSize: parseInt(localStorage.getItem('editorTabSize') || '2'),
        wordWrap: localStorage.getItem('editorWordWrap') || 'on',
        minimap: localStorage.getItem('editorMinimap') === 'true',
        lineNumbers: localStorage.getItem('showLineNumbers') !== 'false'
    });
    const editorRef = useRef<any>(null);

    // Dosya uzantısına göre dil belirleme
    const getLanguageFromPath = (path: string): string => {
        const ext = path.split('.').pop()?.toLowerCase();
        const languageMap: { [key: string]: string } = {
            js: 'javascript',
            jsx: 'javascript',
            ts: 'typescript',
            tsx: 'typescript',
            py: 'python',
            java: 'java',
            cpp: 'cpp',
            c: 'c',
            cs: 'csharp',
            php: 'php',
            rb: 'ruby',
            go: 'go',
            rs: 'rust',
            kt: 'kotlin',
            swift: 'swift',
            m: 'objective-c',
            scala: 'scala',
            sh: 'shell',
            bash: 'shell',
            zsh: 'shell',
            ps1: 'powershell',
            psm1: 'powershell',
            psd1: 'powershell',
            bat: 'bat',
            cmd: 'bat',
            json: 'json',
            xml: 'xml',
            yaml: 'yaml',
            yml: 'yaml',
            toml: 'toml',
            ini: 'ini',
            cfg: 'ini',
            conf: 'ini',
            sql: 'sql',
            md: 'markdown',
            mdx: 'markdown',
            tex: 'latex',
            r: 'r',
            R: 'r',
            jl: 'julia',
            vue: 'vue',
            html: 'html',
            htm: 'html',
            css: 'css',
            scss: 'scss',
            sass: 'sass',
            less: 'less',
            styl: 'stylus',
            dockerfile: 'dockerfile',
            Dockerfile: 'dockerfile',
            makefile: 'makefile',
            Makefile: 'makefile',
            mk: 'makefile',
            nginx: 'nginx',
            graphql: 'graphql',
            gql: 'graphql',
            proto: 'proto'
        };
        return languageMap[ext || ''] || 'plaintext';
    };

    // Dosya ikonunu belirleme
    const getFileIcon = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        const codeExtensions = ['js', 'jsx', 'ts', 'tsx', 'py', 'go', 'java', 'cpp', 'c', 'php', 'rb', 'rs', 'kt', 'swift'];
        const textExtensions = ['md', 'txt', 'log', 'csv', 'json', 'xml', 'yaml', 'yml'];
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'bmp', 'ico', 'webp'];
        const archiveExtensions = ['zip', 'tar', 'gz', 'rar', '7z', 'bz2'];

        if (codeExtensions.includes(ext || '')) return <FileCode size={14} />;
        if (textExtensions.includes(ext || '')) return <FileText size={14} />;
        if (imageExtensions.includes(ext || '')) return <ImageIcon size={14} />;
        if (archiveExtensions.includes(ext || '')) return <Archive size={14} />;
        return <File size={14} />;
    };

    // Tema değişimini dinle
    useEffect(() => {
        const handleStorageChange = () => {
            const newTheme = localStorage.getItem('theme') === 'dark' ? 'vs-dark' : 'vs';
            setTheme(newTheme);
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Editor ayarlarını dinle
    useEffect(() => {
        const handleEditorSettingsChange = (e: CustomEvent) => {
            setEditorSettings({
                fontSize: parseInt(localStorage.getItem('editorFontSize') || '14'),
                tabSize: parseInt(localStorage.getItem('editorTabSize') || '2'),
                wordWrap: localStorage.getItem('editorWordWrap') || 'on',
                minimap: localStorage.getItem('editorMinimap') === 'true',
                lineNumbers: localStorage.getItem('showLineNumbers') !== 'false'
            });
        };

        window.addEventListener('editorSettingsChanged', handleEditorSettingsChange as EventListener);
        return () => window.removeEventListener('editorSettingsChanged', handleEditorSettingsChange as EventListener);
    }, []);

    // Dosya seçildiğinde
    useEffect(() => {
        if (selectedFile && window.electron) {
            const fileName = selectedFile.split('/').pop() || 'Untitled';

            // Tab zaten açık mı kontrol et
            const existingTab = tabs.find(tab => tab.path === selectedFile);
            if (existingTab) {
                setActiveTabId(existingTab.id);
                return;
            }

            // Yeni tab oluştur
            window.electron.readFile(selectedFile)
                .then(content => {
                    const newTab: Tab = {
                        id: `tab-${Date.now()}`,
                        path: selectedFile,
                        name: fileName,
                        content: content,
                        language: getLanguageFromPath(selectedFile),
                        isDirty: false
                    };
                    setTabs(prev => [...prev, newTab]);
                    setActiveTabId(newTab.id);
                })
                .catch(err => {
                    console.error('Error reading file:', err);
                });
        }
    }, [selectedFile]);

    // Editor mount olduğunda
    const handleEditorDidMount = (editor: any, monaco: any) => {
        editorRef.current = editor;

        // Kısayollar
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, () => {
            handleSave();
        });

        // Font boyutu kısayolları
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Equal, () => {
            editor.updateOptions({ fontSize: editor.getOptions().fontSize + 1 });
        });

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Minus, () => {
            editor.updateOptions({ fontSize: Math.max(10, editor.getOptions().fontSize - 1) });
        });
    };

    // İçerik değiştiğinde
    const handleEditorChange = (value: string | undefined) => {
        if (activeTabId && value !== undefined) {
            setTabs(prev => prev.map(tab =>
                tab.id === activeTabId
                    ? { ...tab, content: value, isDirty: true }
                    : tab
            ));
        }
    };

    // Dosyayı kaydet
    const handleSave = async () => {
        const activeTab = tabs.find(tab => tab.id === activeTabId);
        if (activeTab && activeTab.isDirty && window.electron) {
            try {
                await window.electron.writeFile(activeTab.path, activeTab.content);
                setTabs(prev => prev.map(tab =>
                    tab.id === activeTabId
                        ? { ...tab, isDirty: false }
                        : tab
                ));
            } catch (err) {
                console.error('Error saving file:', err);
            }
        }
    };

    // Tab'ı kapat
    const handleCloseTab = (tabId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const tabIndex = tabs.findIndex(tab => tab.id === tabId);
        const newTabs = tabs.filter(tab => tab.id !== tabId);
        setTabs(newTabs);

        if (activeTabId === tabId) {
            if (newTabs.length > 0) {
                // Kapatılan tab'ın yanındaki tab'ı seç
                const newActiveIndex = Math.min(tabIndex, newTabs.length - 1);
                setActiveTabId(newTabs[newActiveIndex].id);
            } else {
                setActiveTabId(null);
            }
        }
    };

    const activeTab = tabs.find(tab => tab.id === activeTabId);

    return (
        <div className="editor-container">
            {tabs.length > 0 ? (
                <>
                    <div className="editor-tabs">
                        {tabs.map(tab => (
                            <div
                                key={tab.id}
                                className={`editor-tab ${tab.id === activeTabId ? 'active' : ''}`}
                                onClick={() => setActiveTabId(tab.id)}
                            >
                                <span className="tab-icon">{getFileIcon(tab.name)}</span>
                                <span className="tab-name">
                  {tab.name}
                                    {tab.isDirty && <span className="tab-dirty">•</span>}
                </span>
                                <button
                                    className="tab-close"
                                    onClick={(e) => handleCloseTab(tab.id, e)}
                                    title={t('editor.close', 'Close')}
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="editor-toolbar">
                        <button
                            className="toolbar-btn"
                            onClick={handleSave}
                            disabled={!activeTab?.isDirty}
                            title={`${t('editor.save', 'Save')} (Ctrl+S)`}
                        >
                            <Save size={16} />
                        </button>
                    </div>

                    <div className="editor-content">
                        <Editor
                            height="100%"
                            language={activeTab?.language}
                            theme={theme}
                            value={activeTab?.content}
                            onChange={handleEditorChange}
                            onMount={handleEditorDidMount}
                            options={{
                                fontSize: editorSettings.fontSize,
                                fontFamily: 'Consolas, "Courier New", monospace',
                                minimap: { enabled: editorSettings.minimap },
                                scrollBeyondLastLine: false,
                                wordWrap: editorSettings.wordWrap as 'on' | 'off',
                                automaticLayout: true,
                                formatOnPaste: true,
                                formatOnType: true,
                                suggestOnTriggerCharacters: true,
                                acceptSuggestionOnCommitCharacter: true,
                                tabSize: editorSettings.tabSize,
                                insertSpaces: true,
                                lineNumbers: editorSettings.lineNumbers ? 'on' : 'off',
                                bracketPairColorization: {
                                    enabled: true,
                                    independentColorPoolPerBracketType: true
                                },
                                guides: {
                                    bracketPairs: true,
                                    indentation: true
                                },
                                stickyScroll: {
                                    enabled: true
                                }
                            }}
                        />
                    </div>
                </>
            ) : (
                <div className="editor-empty">
                    <h2>{t('editor.noFileOpen', 'No file is open')}</h2>
                    <p>{t('editor.selectFile', 'Select a file from the explorer to start editing')}</p>
                </div>
            )}
        </div>
    );
};

export default EditorView;