# fix-all-components.ps1

Write-Host "Starting to fix all components..." -ForegroundColor Green

# Fix Sidebar
Write-Host "`nFixing Sidebar component..."
$sidebarContent = @'
import React from 'react';

interface SidebarProps {
  onNavigate?: (view: string) => void;
  activeView?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ onNavigate, activeView }) => {
  return (
    <aside className="w-64 bg-gray-800 border-r border-gray-700">
      <div className="p-4">
        <h3 className="text-xs uppercase text-gray-400 mb-4">Navigation</h3>

        <nav className="space-y-2">
          <button
            onClick={() => onNavigate?.('dashboard')}
            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
              activeView === 'dashboard'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            Dashboard
          </button>

          <button
            onClick={() => onNavigate?.('generate')}
            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
              activeView === 'generate'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            Generate
          </button>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
'@

# Create directory if needed
$sidebarDir = "src/components/layout/Sidebar"
if (!(Test-Path $sidebarDir)) {
    New-Item -ItemType Directory -Force -Path $sidebarDir | Out-Null
}
Set-Content -Path "$sidebarDir/index.tsx" -Value $sidebarContent -Encoding UTF8
Write-Host "Sidebar component fixed" -ForegroundColor Green

# Fix StatusBar
Write-Host "`nFixing StatusBar component..."
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

$statusBarDir = "src/components/layout/StatusBar"
if (!(Test-Path $statusBarDir)) {
    New-Item -ItemType Directory -Force -Path $statusBarDir | Out-Null
}
Set-Content -Path "$statusBarDir/index.tsx" -Value $statusBarContent -Encoding UTF8
Write-Host "StatusBar component fixed" -ForegroundColor Green

# Fix Dashboard
Write-Host "`nFixing Dashboard component..."
$dashboardContent = @'
import React from 'react';

const Dashboard: React.FC = () => {
  const stats = [
    { label: 'Total Files', value: '24', color: 'bg-blue-500', icon: 'F' },
    { label: 'Code Generated', value: '156', color: 'bg-green-500', icon: 'G' },
    { label: 'Tests Created', value: '89', color: 'bg-purple-500', icon: 'T' },
    { label: 'Reviews Done', value: '45', color: 'bg-orange-500', icon: 'R' }
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        CodeWeaver Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg text-white ${stat.color}`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
'@

$dashboardDir = "src/views/Dashboard"
if (!(Test-Path $dashboardDir)) {
    New-Item -ItemType Directory -Force -Path $dashboardDir | Out-Null
}
Set-Content -Path "$dashboardDir/index.tsx" -Value $dashboardContent -Encoding UTF8
Write-Host "Dashboard component fixed" -ForegroundColor Green

# Create all other views
Write-Host "`nCreating other view components..."
$views = @{
    "Generate" = "Generate Code"
    "Refactor" = "Refactor Code"
    "Document" = "Document Code"
    "Test" = "Generate Tests"
    "Review" = "Review Code"
    "History" = "History"
    "Settings" = "Settings"
}

foreach ($viewName in $views.Keys) {
    $viewTitle = $views[$viewName]
    $viewContent = @"
import React from 'react';

const $viewName = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        $viewTitle
      </h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-gray-600 dark:text-gray-400">
          $viewTitle functionality will be implemented here.
        </p>
      </div>
    </div>
  );
};

export default $viewName;
"@

    $viewDir = "src/views/$viewName"
    if (!(Test-Path $viewDir)) {
        New-Item -ItemType Directory -Force -Path $viewDir | Out-Null
    }

    Set-Content -Path "$viewDir/index.tsx" -Value $viewContent -Encoding UTF8
    Write-Host "$viewName component created" -ForegroundColor Green
}

Write-Host "`nAll components have been fixed!" -ForegroundColor Green

# Verify all files exist
Write-Host "`nVerifying files..."
$filesToCheck = @(
    "src/components/layout/Sidebar/index.tsx",
    "src/components/layout/StatusBar/index.tsx",
    "src/views/Dashboard/index.tsx",
    "src/views/Generate/index.tsx",
    "src/views/Refactor/index.tsx",
    "src/views/Document/index.tsx",
    "src/views/Test/index.tsx",
    "src/views/Review/index.tsx",
    "src/views/History/index.tsx",
    "src/views/Settings/index.tsx"
)

$allExist = $true
foreach ($file in $filesToCheck) {
    if (Test-Path $file) {
        Write-Host "[OK] $file" -ForegroundColor Green
    } else {
        Write-Host "[MISSING] $file" -ForegroundColor Red
        $allExist = $false
    }
}

if ($allExist) {
    Write-Host "`nAll components are ready!" -ForegroundColor Green
    Write-Host "You can now run: npm run dev" -ForegroundColor Yellow
} else {
    Write-Host "`nSome files are still missing!" -ForegroundColor Red
}