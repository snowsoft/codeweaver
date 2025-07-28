// src/App.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import IDELayout from './layouts/IDELayout';
import Dashboard from './views/Dashboard';
import Editor from './views/Editor';
import Terminal from './views/Terminal';
import Settings from './views/Settings';
import { useOutletContext } from 'react-router-dom';
import './App.css';

// Context type for outlet
interface OutletContextType {
    selectedFile: string | null;
    editorFiles: string[];
    setEditorFiles: React.Dispatch<React.SetStateAction<string[]>>;
}

// Editor wrapper to use context
const EditorWrapper = () => {
    const context = useOutletContext<OutletContextType>();
    return <Editor {...context} />;
};

function App() {
    return (
        <div className="app" data-theme={localStorage.getItem('theme') || 'dark'}>
            <Routes>
                <Route path="/" element={<IDELayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="editor" element={<EditorWrapper />} />
                    <Route path="terminal" element={<Terminal />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="git" element={<div style={{ padding: '20px' }}>Git Integration Coming Soon...</div>} />
                    <Route path="extensions" element={<div style={{ padding: '20px' }}>Extensions Coming Soon...</div>} />
                </Route>
            </Routes>
        </div>
    );
}

export default App;