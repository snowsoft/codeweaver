# fix-missing-exports.ps1

# Fix StatusBar
$statusBarContent = @'
import React from 'react';

const StatusBar = () => {
  return (
    <div className="bg-gray-800 text-white px-6 py-2 flex items-center justify-between text-sm">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          Connected
        </span>
        <span>Model: codellama:13b-instruct</span>
      </div>
      <div className="flex items-center gap-4">
        <span>Ready</span>
      </div>
    </div>
  );
};

export default StatusBar;
'@

Set-Content -Path "src/components/layout/StatusBar/index.tsx" -Value $statusBarContent -Encoding UTF8
Write-Host "Fixed StatusBar component"

# Fix Generate
$generateContent = @'
import React, { useState } from 'react';

const Generate = () => {
  const [fileName, setFileName] = useState('');
  const [task, setTask] = useState('');

  const handleGenerate = async () => {
    if (!fileName || !task) {
      alert('Please fill in all fields');
      return;
    }

    console.log('Generating:', { fileName, task });
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Generate Code
      </h1>

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
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white
                     rounded-lg font-medium transition-colors"
          >
            ✨ Generate Code
          </button>
        </div>
      </div>
    </div>
  );
};

export default Generate;
'@

Set-Content -Path "src/views/Generate/index.tsx" -Value $generateContent -Encoding UTF8
Write-Host "Fixed Generate component"

# Create other missing views
$viewTemplates = @{
    "Refactor" = "Refactor Code"
    "Document" = "Document Code"
    "Test" = "Generate Tests"
    "Review" = "Review Code"
    "History" = "History"
    "Settings" = "Settings"
}

foreach ($view in $viewTemplates.Keys) {
    $title = $viewTemplates[$view]
    $content = @"
import React from 'react';

const $view = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        $title
      </h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-gray-600 dark:text-gray-400">
          $title functionality will be implemented here.
        </p>
      </div>
    </div>
  );
};

export default $view;
"@

    $path = "src/views/$view/index.tsx"

    # Create directory if it doesn't exist
    $dir = Split-Path $path -Parent
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
    }

    Set-Content -Path $path -Value $content -Encoding UTF8
    Write-Host "Created/Fixed $view component"
}

Write-Host "`nAll components have been fixed with default exports!"