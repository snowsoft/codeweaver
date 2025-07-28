// src/renderer/components/Terminal.tsx
import React, { useEffect, useRef } from 'react';

interface TerminalProps {
    onClose: () => void;
}

const Terminal: React.FC<TerminalProps> = ({ onClose }) => {
    const terminalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Here you would initialize xterm.js
        // For now, we'll use a simple div
    }, []);

    return (
        <div className="h-64 bg-black border-t border-gray-700 flex flex-col">
            <div className="h-8 bg-gray-800 flex items-center justify-between px-4">
                <span className="text-sm text-gray-300">Terminal</span>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white"
                >
                    ✕
                </button>
            </div>

            <div ref={terminalRef} className="flex-1 p-2 font-mono text-sm text-green-400 overflow-y-auto">
                <div>$ weaver --version</div>
                <div>CodeWeaver v1.0.0</div>
                <div>$ _</div>
            </div>
        </div>
    );
};

export default Terminal;