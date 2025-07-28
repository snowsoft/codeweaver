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
    terminal: XTerm | null;
    fitAddon: FitAddon | null;
    element: HTMLDivElement | null;
}

const TerminalView: React.FC = () => {
    const { t } = useTranslation();
    const terminalContainerRef = useRef<HTMLDivElement>(null);
    const [tabs, setTabs] = useState<TerminalTab[]>([]);
    const [activeTabId, setActiveTabId] = useState<string>('');
    const terminalCounterRef = useRef(0);

    // Terminal teması
    const getTerminalTheme = () => {
        const isDark = localStorage.getItem('theme') !== 'light';
        return {
            background: isDark ? '#1e1e1e' : '#ffffff',
            foreground: isDark ? '#cccccc' : '#333333',
            cursor: isDark ? '#ffffff' : '#333333',
            cursorAccent: isDark ? '#000000' : '#ffffff',
            selection: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
            black: '#000000',
            red: '#cd3131',
            green: '#0dbc79',
            yellow: '#e5e510',
            blue: '#2472c8',
            magenta: '#bc3fbc',
            cyan: '#11a8cd',
            white: '#e5e5e5',
            brightBlack: '#666666',
            brightRed: '#f14c4c',
            brightGreen: '#23d18b',
            brightYellow: '#f5f543',
            brightBlue: '#3b8eea',
            brightMagenta: '#d670d6',
            brightCyan: '#29b8db',
            brightWhite: '#e5e5e5'
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
                terminal.writeln('  ls                  - List files');
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
                    setTimeout(() => {
                        terminal.writeln('✓ Command executed successfully');
                        terminal.write('$ ');
                    }, 1000);
                    return;
                }
                break;

            default:
                terminal.writeln(`Command not found: ${cmd}`);
                terminal.writeln('Type "help" for available commands');
                break;
        }
    };

    // Terminal oluştur
    const createNewTerminal = () => {
        terminalCounterRef.current += 1;
        const id = `terminal-${terminalCounterRef.current}`;

        const newTab: TerminalTab = {
            id,
            name: `Terminal ${terminalCounterRef.current}`,
            terminal: null,
            fitAddon: null,
            element: null
        };

        setTabs(prev => [...prev, newTab]);
        setActiveTabId(id);
    };

    // Terminal'i başlat
    const initializeTerminal = (tabId: string, element: HTMLDivElement) => {
        const tab = tabs.find(t => t.id === tabId);
        if (!tab || tab.terminal) return;

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
        terminal.open(element);

        // Terminal'i güncelle
        setTabs(prev => prev.map(t =>
            t.id === tabId
                ? { ...t, terminal, fitAddon, element }
                : t
        ));

        // Fit
        setTimeout(() => {
            fitAddon.fit();
        }, 0);

        // Welcome message
        terminal.writeln('CodeWeaver Terminal v1.0.0');
        terminal.writeln('Type "help" for available commands');
        terminal.writeln('');
        terminal.write('$ ');

        // Input handling
        let currentLine = '';
        let history: string[] = [];
        let historyIndex = -1;

        terminal.onData((data) => {
            switch (data) {
                case '\r': // Enter
                    if (currentLine.trim()) {
                        history.push(currentLine);
                        historyIndex = history.length;
                    }
                    processCommand(terminal, currentLine);
                    currentLine = '';
                    terminal.write('$ ');
                    break;

                case '\u007F': // Backspace
                    if (currentLine.length > 0) {
                        currentLine = currentLine.slice(0, -1);
                        terminal.write('\b \b');
                    }
                    break;

                case '\u001b[A': // Up arrow
                    if (historyIndex > 0) {
                        terminal.write('\r\x1b[K$ ');
                        historyIndex--;
                        currentLine = history[historyIndex];
                        terminal.write(currentLine);
                    }
                    break;

                case '\u001b[B': // Down arrow
                    if (historyIndex < history.length - 1) {
                        terminal.write('\r\x1b[K$ ');
                        historyIndex++;
                        currentLine = history[historyIndex];
                        terminal.write(currentLine);
                    } else if (historyIndex === history.length - 1) {
                        terminal.write('\r\x1b[K$ ');
                        historyIndex = history.length;
                        currentLine = '';
                    }
                    break;

                case '\u0003': // Ctrl+C
                    terminal.write('^C\r\n$ ');
                    currentLine = '';
                    break;

                default:
                    if (data >= String.fromCharCode(0x20) && data <= String.fromCharCode(0x7e)) {
                        currentLine += data;
                        terminal.write(data);
                    }
            }
        });
    };

    // Tab değiştir
    const switchToTab = (tabId: string) => {
        setActiveTabId(tabId);
    };

    // Tab kapat
    const closeTab = (tabId: string, e?: React.MouseEvent) => {
        e?.stopPropagation();

        const tab = tabs.find(t => t.id === tabId);
        if (tab?.terminal) {
            tab.terminal.dispose();
        }

        const newTabs = tabs.filter(t => t.id !== tabId);
        setTabs(newTabs);

        if (activeTabId === tabId && newTabs.length > 0) {
            setActiveTabId(newTabs[0].id);
        }
    };

    // Terminal'i temizle
    const clearTerminal = () => {
        const activeTab = tabs.find(t => t.id === activeTabId);
        if (activeTab?.terminal) {
            activeTab.terminal.clear();
        }
    };

    // Resize handler
    const handleResize = () => {
        tabs.forEach(tab => {
            if (tab.fitAddon) {
                try {
                    tab.fitAddon.fit();
                } catch (e) {
                    // Ignore fit errors
                }
            }
        });
    };

    // İlk terminal'i oluştur
    useEffect(() => {
        if (tabs.length === 0) {
            createNewTerminal();
        }
    }, []);

    // Resize event listener
    useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [tabs]);

    // Theme change listener
    useEffect(() => {
        const handleThemeChange = () => {
            const theme = getTerminalTheme();
            tabs.forEach(tab => {
                if (tab.terminal) {
                    tab.terminal.options.theme = theme;
                }
            });
        };

        window.addEventListener('storage', handleThemeChange);
        return () => window.removeEventListener('storage', handleThemeChange);
    }, [tabs]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            tabs.forEach(tab => {
                if (tab.terminal) {
                    try {
                        tab.terminal.dispose();
                    } catch (e) {
                        // Ignore dispose errors
                    }
                }
            });
        };
    }, [tabs]);

    return (
        <div className="terminal-container">
            <div className="terminal-header">
                <div className="terminal-tabs">
                    {tabs.map(tab => (
                        <div
                            key={tab.id}
                            className={`terminal-tab ${tab.id === activeTabId ? 'active' : ''}`}
                            onClick={() => switchToTab(tab.id)}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="4 17 10 11 4 5"></polyline>
                                <line x1="12" y1="19" x2="20" y2="19"></line>
                            </svg>
                            <span>{tab.name}</span>
                            {tabs.length > 1 && (
                                <button
                                    className="terminal-tab-close"
                                    onClick={(e) => closeTab(tab.id, e)}
                                    title={t('terminal.close', 'Close')}
                                    type="button"
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
                        type="button"
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
                        type="button"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>

            <div ref={terminalContainerRef} className="terminal-content-wrapper">
                {tabs.map(tab => (
                    <div
                        key={tab.id}
                        data-terminal-id={tab.id}
                        className="terminal-content"
                        style={{ display: tab.id === activeTabId ? 'block' : 'none' }}
                        ref={(el) => {
                            if (el && !tab.terminal) {
                                initializeTerminal(tab.id, el);
                            }
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default TerminalView;