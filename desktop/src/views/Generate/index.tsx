// src/views/Generate/index.tsx
import React, { useState } from 'react';

// Window API tipini tanımla
declare global {
    interface Window {
        api?: {
            weaver: {
                execute: (command: string) => Promise<{stdout: string, stderr: string}>
            }
        }
    }
}

const Generate = () => {
    const [fileName, setFileName] = useState('');
    const [task, setTask] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [output, setOutput] = useState('');

    const handleGenerate = async () => {
        if (!fileName || !task) {
            alert('Please fill in all fields');
            return;
        }

        setIsGenerating(true);
        setOutput('');

        try {
            const command = `new ${fileName} --task "${task}"`;
            console.log('Executing:', command);

            if (window.api?.weaver) {
                const result = await window.api.weaver.execute(command);
                setOutput(result.stdout || result.stderr || 'Command executed successfully');
            } else {
                setOutput('Weaver API not available in this environment');
            }
        } catch (error) {
            setOutput(`Error: ${error.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                Generate Code
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                File Name
                            </label>
                            <input
                                type="text"
                                value={fileName}
                                onChange={(e) => setFileName(e.target.value)}
                                placeholder="e.g., user_service.py"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600
                         rounded-lg focus:outline-none dark:bg-gray-700 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Task Description
                            </label>
                            <textarea
                                value={task}
                                onChange={(e) => setTask(e.target.value)}
                                placeholder="Describe what you want to generate..."
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600
                         rounded-lg focus:outline-none dark:bg-gray-700 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white
                       rounded-lg font-medium transition-colors disabled:bg-gray-500"
                        >
                            {isGenerating ? 'Generating...' : '✨ Generate Code'}
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Output
                    </h3>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto h-64 text-sm">
            {output || 'Output will appear here...'}
          </pre>
                </div>
            </div>
        </div>
    );
};

export default Generate;