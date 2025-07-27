# Create all view components

Write-Host "Creating view components..." -ForegroundColor Yellow

$views = @{
    "Dashboard" = @"
import { IconCode, IconRefresh, IconFileText, IconTestPipe } from '@tabler/icons-react';

export function Dashboard() {
  const stats = [
    { label: 'Code Generated', value: '0', icon: IconCode, color: 'bg-blue-500' },
    { label: 'Files Refactored', value: '0', icon: IconRefresh, color: 'bg-green-500' },
    { label: 'Docs Created', value: '0', icon: IconFileText, color: 'bg-purple-500' },
    { label: 'Tests Written', value: '0', icon: IconTestPipe, color: 'bg-orange-500' },
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Welcome to CodeWeaver Desktop
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg text-white `${stat.color}`}>
                  <Icon size={24} />
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Getting Started
        </h2>
        <ul className="space-y-3 text-gray-600 dark:text-gray-400">
          <li>• Use the sidebar to navigate between different features</li>
          <li>• Generate new code files with AI assistance</li>
          <li>• Refactor existing code to improve quality</li>
          <li>• Automatically generate documentation</li>
          <li>• Create comprehensive test suites</li>
        </ul>
      </div>
    </div>
  );
}
"@

    "Generate" = @"
import { useState } from 'react';
import { IconSparkles } from '@tabler/icons-react';

export function Generate() {
  const [fileName, setFileName] = useState('');
  const [task, setTask] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    // TODO: Implement actual generation
    setTimeout(() => setLoading(false), 2000);
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
              placeholder="e.g., api_handler.py"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
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
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !fileName || !task}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg
                     hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors"
          >
            <IconSparkles size={20} />
            {loading ? 'Generating...' : 'Generate Code'}
          </button>
        </div>
      </div>
    </div>
  );
}
"@

    "StatusBar" = @"
export function StatusBar() {
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
}
"@
}

# Create view directories and files
foreach ($viewName in $views.Keys) {
    $viewDir = "src/views/$viewName"
    $componentDir = "src/components/layout/$viewName"

    # Determine correct directory
    if ($viewName -eq "StatusBar") {
        $dir = $componentDir
    } else {
        $dir = $viewDir
    }

    # Create directory
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }

    # Create index.tsx
    $content = $views[$viewName]
    $filePath = Join-Path $dir "index.tsx"

    [System.IO.File]::WriteAllText($filePath, $content, [System.Text.UTF8Encoding]::new($false))
    Write-Host "Created: $filePath" -ForegroundColor Green
}

# Create placeholder views for other pages
$placeholderViews = @("Refactor", "Document", "Test", "Review", "History", "Settings")

foreach ($view in $placeholderViews) {
    $viewDir = "src/views/$view"

    if (-not (Test-Path $viewDir)) {
        New-Item -ItemType Directory -Path $viewDir -Force | Out-Null
    }

    $content = @"
export function $view() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        $view
      </h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-gray-600 dark:text-gray-400">
          $view feature coming soon...
        </p>
      </div>
    </div>
  );
}
"@

    $filePath = Join-Path $viewDir "index.tsx"
    [System.IO.File]::WriteAllText($filePath, $content, [System.Text.UTF8Encoding]::new($false))
    Write-Host "Created: $filePath" -ForegroundColor Green
}

Write-Host ""
Write-Host "All view components created!" -ForegroundColor Green
Write-Host "Now run: npm run dev" -ForegroundColor Yellow