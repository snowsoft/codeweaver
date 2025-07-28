// src/views/Terminal/index.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { useTranslation } from 'react-i18next';
import 'xterm/css/xterm.css';
import './Terminal.css';

interface TerminalTab {
    id: string;
    name: string;
    terminal: XTerm;
    fitAddon: FitAddon;
    currentLine: string;
    history: string[];
    historyIndex: number;
}

const TerminalView: React.FC = () => {
    const { t } = useTranslation();
    const terminalContainerRef = useRef<HTMLDivElement>(null);
    const [terminals, setTerminals] = useState<TerminalTab[]>([]);
    const [activeTerminalId, setActiveTerminalId] = useState<string | null>(null);

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

    // Komut işleyici
    const processCommand = (terminal: XTerm, command: string): void => {
        const args = command.trim().split(' ');
        const cmd = args[0].toLowerCase();

        terminal.write('\r\n');

        switch (cmd) {
            case '':
                break;

            case 'help':
                terminal.writeln('Available commands:');
                terminal.writeln('  help                - Show this help message');
                terminal.writeln('  clear               - Clear the terminal');
                terminal.writeln('  echo [text]         - Display text');
                terminal.writeln('  date                - Show current date and time');
                terminal.writeln('  pwd                 - Print working directory');
                terminal.writeln('  ls                  - List files (simulated)');
                terminal.writeln('  weaver [command]    - Run Weaver CLI commands');
                break;

            case 'clear':
                terminal.clear();
                break;

            case 'echo':
                terminal.writeln(args.slice(1).join(' '));
                break;

            case 'date':
                terminal.writeln(new Date().toString());
                break;

            case 'pwd':
                terminal.writeln('/home/user/project');
                break;

            case 'ls':
                terminal.writeln('src/  package.json  README.md  node_modules/');
                break;

            case 'weaver':
                if (args.length === 1) {
                    terminal.writeln('Weaver CLI v1.0.0');
                    terminal.writeln('Usage: weaver [command] [options]');
                    terminal.writeln('');
                    terminal.writeln('Commands:');
                    terminal.writeln('  new <file>      Create new code file');
                    terminal.writeln('  refactor <file> Refactor existing code');
                    terminal.writeln('  document <file> Add documentation');
                    terminal.writeln('  test <file>     Generate tests');
                    terminal.writeln('  review <file>   Review code');
                } else {
                    terminal.writeln(`Running: weaver ${args.slice(1).join(' ')}`);
                    terminal.writeln('✓ Command executed successfully');
                }
                break;

            default:
                terminal.writeln(`Command not found: ${cmd}`);
                terminal.writeln('Type "help" for available commands');
                break;
        }
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
            tabStopWidth: 4
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
            currentLine: '',
            history: [],
            historyIndex: -1
        };

        // Diğer terminalleri deaktif et
        setTerminals(prev => [...prev, newTab]);
        setActiveTerminalId(newTab.id);

        return newTab;
    };

    // Terminal sekmesine geç
    const switchToTerminal = (terminalId: string) => {
        setActiveTerminalId(terminalId);
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
                try {
                    tab.fitAddon.fit();
                } catch (e) {
                    console.error('Fit error:', e);
                }
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
                    if (terminalElement && !terminalElement.hasChildNodes()) {
                        newTerminal.terminal.open(terminalElement as HTMLElement);
                        newTerminal.fitAddon.fit();

                        // Hoş geldin mesajı
                        newTerminal.terminal.writeln('CodeWeaver Terminal v1.0.0');
                        newTerminal.terminal.writeln('Type "help" for available commands');
                        newTerminal.terminal.writeln('');
                        newTerminal.terminal.write('$ ');

                        // Input handling
                        let currentLine = '';
                        let history: string[] = [];
                        let historyIndex = -1;

                        newTerminal.terminal.onData((data) => {
                            const term = newTerminal.terminal;

                            switch (data) {
                                case '\r': // Enter
                                    if (currentLine.trim()) {
                                        history.push(currentLine);
                                        historyIndex = history.length;
                                    }
                                    processCommand(term, currentLine);
                                    currentLine = '';
                                    term.write('$ ');
                                    break;

                                case '\u007F': // Backspace
                                    if (currentLine.length > 0) {
                                        currentLine = currentLine.slice(0, -1);
                                        term.write('\b \b');
                                    }
                                    break;

                                case '\u001b[A': // Up arrow
                                    if (historyIndex > 0) {
                                        // Clear current line
                                        term.write('\r\x1b[K$ ');
                                        historyIndex--;
                                        currentLine = history[historyIndex];
                                        term.write(currentLine);
                                    }
                                    break;

                                case '\u001b[B': // Down arrow
                                    if (historyIndex < history.length - 1) {
                                        term.write('\r\x1b[K$ ');
                                        historyIndex++;
                                        currentLine = history[historyIndex];
                                        term.write(currentLine);
                                    } else if (historyIndex === history.length - 1) {
                                        term.write('\r\x1b[K$ ');
                                        historyIndex = history.length;
                                        currentLine = '';
                                    }
                                    break;

                                case '\u0003': // Ctrl+C
                                    term.write('^C\r\n$ ');
                                    currentLine = '';
                                    break;

                                default:
                                    if (data >= String.fromCharCode(0x20) && data <= String.fromCharCode(0x7e)) {
                                        currentLine += data;
                                        term.write(data);
                                    }
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
                // Tüm terminalleri gizle
                const allTerminals = terminalContainerRef.current.querySelectorAll('.xterm');
                allTerminals.forEach(el => {
                    (el as HTMLElement).style.display = 'none';
                });

                // Aktif terminali göster
                const activeElement = terminalContainerRef.current.querySelector(`[data-terminal-id="${activeTerminalId}"] .xterm`);
                if (activeElement) {
                    (activeElement as HTMLElement).style.display = 'block';
                    activeTerminal.fitAddon.fit();
                }
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
        <div className="terminal-container">
            <div className="terminal-header">
                <div className="terminal-tabs">
                    {terminals.map(tab => (
                        <div
                            key={tab.id}
                            className={`terminal-tab ${tab.id === activeTerminalId ? 'active' : ''}`}
                            onClick={() => switchToTerminal(tab.id)}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="4 17 10 11 4 5"></polyline>
                                <line x1="12" y1="19" x2="20" y2="19"></line>
                            </svg>
                            <span>{tab.name}</span>
                            {terminals.length > 1 && (
                                <button
                                    className="terminal-tab-close"
                                    onClick={(e) => closeTerminal(tab.id, e)}
                                    title={t('terminal.close', 'Close')}
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        className="terminal-new-tab"
                        onClick={createNewTerminal}
                        title={t('terminal.new', 'New Terminal')}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>
                </div>

                <div className="terminal-actions">
                    <button
                        onClick={clearTerminal}
                        title={t('terminal.clear', 'Clear')}
                        className="terminal-action-btn"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>

            <div ref={terminalContainerRef} className="terminal-content-wrapper">
                {terminals.map(tab => (
                    <div
                        key={tab.id}
                        data-terminal-id={tab.id}
                        style={{ display: tab.id === activeTerminalId ? 'block' : 'none', height: '100%' }}
                    >
                        <div className="terminal-content"></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TerminalView;