// src/views/Editor/index.tsx
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './Editor.css';

interface EditorProps {
    selectedFile?: string | null;
}

const Editor: React.FC<EditorProps> = ({ selectedFile }) => {
    const { t } = useTranslation();
    const [content, setContent] = useState<string>('');
    const [fileName, setFileName] = useState<string>('');

    useEffect(() => {
        if (selectedFile && window.electron) {
            // Dosya içeriğini yükle
            window.electron.readFile(selectedFile)
                .then(fileContent => {
                    setContent(fileContent);
                    setFileName(selectedFile.split('/').pop() || 'Untitled');
                })
                .catch(err => {
                    console.error('Error reading file:', err);
                });
        }
    }, [selectedFile]);

    return (
        <div className="editor-container">
            {selectedFile ? (
                <>
                    <div className="editor-tabs">
                        <div className="editor-tab active">
                            <span className="tab-name">{fileName}</span>
                            <button className="tab-close">×</button>
                        </div>
                    </div>
                    <div className="editor-content">
            <textarea
                className="editor-textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t('editor.placeholder', 'Start typing...')}
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

export default Editor;