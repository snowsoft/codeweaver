// src/components/WeaverCommands/index.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { weaverCommands } from '../../services/weaverService';
import './WeaverCommands.css';

const WeaverCommands: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [selectedCommand, setSelectedCommand] = useState<string>('');

    const handleCommandClick = (command: string) => {
        setSelectedCommand(command);
        // Terminal'e git ve komutu çalıştır
        navigate('/terminal');
        // Terminal'e komut gönder (context ile)
        setTimeout(() => {
            const event = new CustomEvent('terminal-command', {
                detail: { command: `weaver ${command} --help` }
            });
            window.dispatchEvent(event);
        }, 100);
    };

    const getCommandIcon = (command: string) => {
        const icons: { [key: string]: JSX.Element } = {
            new: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="12" y1="18" x2="12" y2="12"></line>
                    <line x1="9" y1="15" x2="15" y2="15"></line>
                </svg>
            ),
            refactor: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="17 1 21 5 17 9"></polyline>
                    <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                    <polyline points="7 23 3 19 7 15"></polyline>
                    <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                </svg>
            ),
            document: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
            ),
            test: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
            ),
            review: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
            ),
            'heal-project': (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z"></path>
                </svg>
            ),
            template: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="9" y1="3" x2="9" y2="21"></line>
                    <line x1="15" y1="3" x2="15" y2="21"></line>
                </svg>
            )
        };
        return icons[command] || icons.new;
    };

    return (
        <div className="weaver-commands">
            <h2 className="commands-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="4 17 10 11 4 5"></polyline>
                    <line x1="12" y1="19" x2="20" y2="19"></line>
                </svg>
                {t('weaver.title', 'Weaver Komutları')}
            </h2>

            <div className="commands-grid">
                {weaverCommands.map((cmd) => (
                    <div
                        key={cmd.command}
                        className={`command-card ${selectedCommand === cmd.command ? 'selected' : ''}`}
                        onClick={() => handleCommandClick(cmd.command)}
                    >
                        <div className="command-icon">
                            {getCommandIcon(cmd.command)}
                        </div>
                        <div className="command-info">
                            <h3 className="command-name">weaver {cmd.command}</h3>
                            <p className="command-description">{cmd.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WeaverCommands;