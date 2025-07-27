# Check and create view files

Write-Host "Checking view files structure..." -ForegroundColor Yellow
Write-Host ""

# Check current structure
Write-Host "Current directory structure:" -ForegroundColor Cyan
Get-ChildItem -Path "src" -Directory -Recurse | Where-Object { $_.Name -eq "views" } | ForEach-Object {
    Write-Host "Found views at: $($_.FullName)" -ForegroundColor Green
}

# Check if views exist in correct location
$viewsPath = "src/views"
if (-not (Test-Path $viewsPath)) {
    Write-Host ""
    Write-Host "Views directory not found at src/views" -ForegroundColor Red
    Write-Host "Creating views directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $viewsPath -Force | Out-Null
}

# Create view files if they don't exist
$views = @{
    "Dashboard" = @"
export function Dashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Welcome to CodeWeaver Desktop
      </h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-gray-600 dark:text-gray-400">
          Select a feature from the sidebar to get started.
        </p>
      </div>
    </div>
  );
}
"@

    "Generate" = @"
import { useState } from 'react';

export function Generate() {
  const [fileName, setFileName] = useState('');
  const [task, setTask] = useState('');

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Generate Code
      </h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              File Name
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="e.g., api_handler.py"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Task Description
            </label>
            <textarea
              value={task}
              onChange={(e) => setTask(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={4}
              placeholder="Describe what you want to generate..."
            />
          </div>
          <button className="btn-primary">
            Generate Code
          </button>
        </div>
      </div>
    </div>
  );
}
"@
}

# Create other simple placeholder views
$placeholderViews = @("Refactor", "Document", "Test", "Review", "History", "Settings")

foreach ($viewName in $views.Keys) {
    $viewDir = Join-Path $viewsPath $viewName
    if (-not (Test-Path $viewDir)) {
        New-Item -ItemType Directory -Path $viewDir -Force | Out-Null
    }

    $indexPath = Join-Path $viewDir "index.tsx"
    if (-not (Test-Path $indexPath)) {
        [System.IO.File]::WriteAllText($indexPath, $views[$viewName], [System.Text.UTF8Encoding]::new($false))
        Write-Host "Created: $indexPath" -ForegroundColor Green
    }
}

foreach ($viewName in $placeholderViews) {
    $viewDir = Join-Path $viewsPath $viewName
    if (-not (Test-Path $viewDir)) {
        New-Item -ItemType Directory -Path $viewDir -Force | Out-Null
    }

    $content = @"
export function $viewName() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        $viewName
      </h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-gray-600 dark:text-gray-400">
          $viewName feature coming soon...
        </p>
      </div>
    </div>
  );
}
"@

    $indexPath = Join-Path $viewDir "index.tsx"
    if (-not (Test-Path $indexPath)) {
        [System.IO.File]::WriteAllText($indexPath, $content, [System.Text.UTF8Encoding]::new($false))
        Write-Host "Created: $indexPath" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "View files created successfully!" -ForegroundColor Green