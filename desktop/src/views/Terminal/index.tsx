// src/views/Terminal/index.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { useTranslation } from 'react-i18next';
import {
    Terminal as TerminalIcon,
    Plus,
    X,
    Trash2,
    SplitSquareVertical,
    Maximize2,
    Minimize2
} from 'lucide-react';
import 'xterm/css/xterm.css';
import './Terminal.css';

interface TerminalTab {
    id: string;
    name: string;
    terminal: XTerm;
    fitAddon: FitAddon;
    isActive: boolean;
}

const TerminalView: React.FC = () => {
    const { t } = useTranslation();
    const terminalContainerRef = useRef<HTMLDivElement>(null);
    const [terminals, setTerminals] = useState<TerminalTab[]>([]);
    const [activeTerminalId, setActiveTerminalId] = useState<string | null>(null);
    const [isMaximized, setIsMaximized] = useState(false);
    const [terminalHeight, setTerminalHeight] = useState(300);
    const currentTerminalRef = useRef<TerminalTab | null>(null);

    // Terminal teması
    const getTerminalTheme = () => {
        const isDark = localStorage.getItem('theme') === 'dark';
        return {
            background: isDark ? '#1e1e1e' : '#ffffff',
            foreground: isDark ? '#cccccc' : '#333333',
            cursor: isDark ? '#ffffff' : '#333333',
            cursorAccent: isDark ? '#000000' : '#ffffff',
            selection: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
            black: isDark ? '#000000' : '#000000',
            red: isDark ? '#cd3131' : '#cd3131',
            green: isDark ? '#0dbc79' : '#00bc00',
            yellow: isDark ? '#e5e510' : '#949800',
            blue: isDark ? '#2472c8' : '#0451a5',
            magenta: isDark ? '#bc3fbc' : '#bc05bc',
            cyan: isDark ? '#11a8cd' : '#0598bc',
            white: isDark ? '#e5e5e5' : '#555555',
            brightBlack: isDark ? '#666666' : '#666666',
            brightRed: isDark ? '#f14c4c' : '#cd3131',
            brightGreen: isDark ? '#23d18b' : '#14ce14',
            brightYellow: isDark ? '#f5f543' : '#b5ba00',
            brightBlue: isDark ? '#3b8eea' : '#0451a5',
            brightMagenta: isDark ? '#d670d6' : '#bc05bc',
            brightCyan: isDark ? '#29b8db' : '#0598bc',
            brightWhite: isDark ? '#e5e5e5' : '#a5a5a5'
        };
    };

    // Yeni terminal oluştur
    const createNewTerminal = () => {
        const terminal = new XTerm({
            fontFamily: 'Consolas, "Courier New", monospace',
            fontSize: 14,
            theme: getTerminalTheme(),
            cursorBlink: true,
            cursorStyle: 'block',
            scrollback: 10000,
            tabStopWidth: 4,
            windowsMode: process.platform === 'win32'
        });

        const fitAddon = new FitAddon();
        const webLinksAddon = new WebLinksAddon();

        terminal.loadAddon(fitAddon);
        terminal.loadAddon(webLinksAddon);

        const newTab: TerminalTab = {
            id: `terminal-${Date.now()}`,
            name: `Terminal ${terminals.length + 1}`,
            terminal,
            fitAddon,
            isActive: true
        };

        // Diğer terminalleri deaktif et
        setTerminals(prev => prev.map(t => ({ ...t, isActive: false })));
        setTerminals(prev => [...prev, newTab]);
        setActiveTerminalId(newTab.id);

        return newTab;
    };

    // Terminal sekmesine geç
    const switchToTerminal = (terminalId: string) => {
        setActiveTerminalId(terminalId);
        setTerminals(prev => prev.map(t => ({
            ...t,
            isActive: t.id === terminalId
        })));
    };

    // Terminali kapat
    const closeTerminal = (terminalId: string, e?: React.MouseEvent) => {
        e?.stopPropagation();

        const terminalIndex = terminals.findIndex(t => t.id === terminalId);
        const terminal = terminals.find(t => t.id === terminalId);

        if (terminal) {
            terminal.terminal.dispose();
        }

        const newTerminals = terminals.filter(t => t.id !== terminalId);
        setTerminals(newTerminals);

        // Aktif terminal kapatıldıysa yenisini seç
        if (activeTerminalId === terminalId && newTerminals.length > 0) {
            const newActiveIndex = Math.min(terminalIndex, newTerminals.length - 1);
            setActiveTerminalId(newTerminals[newActiveIndex].id);
        } else if (newTerminals.length === 0) {
            setActiveTerminalId(null);
        }
    };

    // Tüm terminalleri temizle
    const clearTerminal = () => {
        const activeTerminal = terminals.find(t => t.id === activeTerminalId);
        if (activeTerminal) {
            activeTerminal.terminal.clear();
        }
    };

    // Terminal boyutunu ayarla
    const handleResize = () => {
        terminals.forEach(tab => {
            if (tab.fitAddon) {
                tab.fitAddon.fit();
            }
        });
    };

    // İlk terminal oluştur
    useEffect(() => {
        if (terminals.length === 0) {
            const newTerminal = createNewTerminal();

            // Terminal mount olduktan sonra
            setTimeout(() => {
                if (terminalContainerRef.current && newTerminal) {
                    const terminalElement = terminalContainerRef.current.querySelector('.terminal-content');
                    if (terminalElement) {
                        newTerminal.terminal.open(terminalElement as HTMLElement);
                        newTerminal.fitAddon.fit();

                        // Hoş geldin mesajı
                        newTerminal.terminal.writeln('CodeWeaver Terminal v1.0.0');
                        newTerminal.terminal.writeln('-----------------------------');
                        newTerminal.terminal.writeln('');
                        newTerminal.terminal.write('$ ');

                        // Input handling
                        newTerminal.terminal.onData((data) => {
                            // Basit echo için - gerçek uygulamada IPC ile shell'e gönderilecek
                            if (data === '\r') { // Enter
                                newTerminal.terminal.write('\r\n$ ');
                            } else if (data === '\u007F') { // Backspace
                                newTerminal.terminal.write('\b \b');
                            } else {
                                newTerminal.terminal.write(data);
                            }
                        });
                    }
                }
            }, 100);
        }
    }, []);

    // Aktif terminal değiştiğinde
    useEffect(() => {
        if (activeTerminalId && terminalContainerRef.current) {
            const activeTerminal = terminals.find(t => t.id === activeTerminalId);
            if (activeTerminal) {
                currentTerminalRef.current = activeTerminal;

                // Terminal içeriğini göster
                setTimeout(() => {
                    const terminalElement = terminalContainerRef.current?.querySelector('.terminal-content');
                    if (terminalElement && !terminalElement.firstChild) {
                        activeTerminal.terminal.open(terminalElement as HTMLElement);
                        activeTerminal.fitAddon.fit();
                    }
                }, 0);
            }
        }
    }, [activeTerminalId, terminals]);

    // Pencere boyutu değiştiğinde
    useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [terminals]);

    // Tema değiştiğinde
    useEffect(() => {
        const handleThemeChange = () => {
            const theme = getTerminalTheme();
            terminals.forEach(tab => {
                tab.terminal.options.theme = theme;
            });
        };

        window.addEventListener('storage', handleThemeChange);
        return () => window.removeEventListener('storage', handleThemeChange);
    }, [terminals]);

    return (
        <div className={`terminal-container ${isMaximized ? 'maximized' : ''}`} style={{ height: isMaximized ? '100%' : `${terminalHeight}px` }}>
            <div className="terminal-header">
                <div className="terminal-tabs">
                    {terminals.map(tab => (
                        <div
                            key={tab.id}
                            className={`terminal-tab ${tab.isActive ? 'active' : ''}`}
                            onClick={() => switchToTerminal(tab.id)}
                        >
                            <TerminalIcon size={14} />
                            <span>{tab.name}</span>
                            <button
                                className="terminal-tab-close"
                                onClick={(e) => closeTerminal(tab.id, e)}
                                title={t('terminal.close', 'Close')}
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                    <button
                        className="terminal-new-tab"
                        onClick={createNewTerminal}
                        title={t('terminal.new', 'New Terminal')}
                    >
                        <Plus size={14} />
                    </button>
                </div>

                <div className="terminal-actions">
                    <button
                        onClick={clearTerminal}
                        title={t('terminal.clear', 'Clear')}
                        className="terminal-action-btn"
                    >
                        <Trash2 size={16} />
                    </button>
                    <button
                        onClick={() => setIsMaximized(!isMaximized)}
                        title={isMaximized ? t('terminal.minimize', 'Minimize') : t('terminal.maximize', 'Maximize')}
                        className="terminal-action-btn"
                    >
                        {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>
                </div>
            </div>

            <div
                className="terminal-resize-handle"
                onMouseDown={(e) => {
                    const startY = e.clientY;
                    const startHeight = terminalHeight;

                    const handleMouseMove = (e: MouseEvent) => {
                        const deltaY = startY - e.clientY;
                        const newHeight = Math.max(150, Math.min(600, startHeight + deltaY));
                        setTerminalHeight(newHeight);
                        handleResize();
                    };

                    const handleMouseUp = () => {
                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);
                    };

                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                }}
            />

            <div ref={terminalContainerRef} className="terminal-content-wrapper">
                <div className="terminal-content"></div>
            </div>
        </div>
    );
};

export default TerminalView;