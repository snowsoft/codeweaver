// src/renderer/components/Editor.tsx
import React, { useState } from 'react';

const Editor: React.FC = () => {
    const [content, setContent] = useState('// Welcome to CodeWeaver Editor\n// Start typing your code here...\n\n');

    return (
        <div className="flex-1 flex flex-col">
            <div className="h-10 bg-gray-800 border-b border-gray-700 flex items-center px-4">
                <span className="text-sm text-gray-300">untitled.js</span>
            </div>

            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-1 bg-gray-900 text-gray-300 p-4 font-mono text-sm focus:outline-none resize-none"
                spellCheck={false}
            />
        </div>
    );
};

export default Editor;