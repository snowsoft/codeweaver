import Editor from '@monaco-editor/react';

interface CodeEditorProps {
    value: string;
    onChange: (value: string | undefined) => void;
    language?: string;
}

export function CodeEditor({ value, onChange, language = 'typescript' }: CodeEditorProps) {
    return (
        <Editor
            height="100%"
            language={language}
            value={value}
            onChange={onChange}
            theme="vs-dark"
            options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                automaticLayout: true,
            }}
        />
    );
}