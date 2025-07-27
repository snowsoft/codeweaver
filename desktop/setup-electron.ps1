# Setup Electron properly

Write-Host "Setting up Electron..." -ForegroundColor Yellow

# Create electron folder structure
$dirs = @(
    "electron",
    "electron/main",
    "electron/preload"
)

foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "Created: $dir" -ForegroundColor Green
    }
}

# Create electron/main/index.js
$electronMain = @'
const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // In development, load from Vite dev server
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built files
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
'@

$Utf8NoBomEncoding = New-Object System.Text.UTF8Encoding $False
[System.IO.File]::WriteAllText("electron/main/index.js", $electronMain, $Utf8NoBomEncoding)
Write-Host "Created: electron/main/index.js" -ForegroundColor Green

# Create electron/preload/index.js
$electronPreload = @'
const { contextBridge } = require('electron');

// Expose protected APIs to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  }
});
'@

[System.IO.File]::WriteAllText("electron/preload/index.js", $electronPreload, $Utf8NoBomEncoding)
Write-Host "Created: electron/preload/index.js" -ForegroundColor Green

# Update package.json to set correct main entry and add electron-dev script
$packagePath = "package.json"
$packageContent = Get-Content $packagePath -Raw | ConvertFrom-Json

# Update main entry point
$packageContent.main = "electron/main/index.js"

# Update scripts
if (-not $packageContent.scripts."electron") {
    $packageContent.scripts | Add-Member -MemberType NoteProperty -Name "electron" -Value "electron ." -Force
}

if (-not $packageContent.scripts."electron:dev") {
    $packageContent.scripts."electron:dev" = "set NODE_ENV=development&& electron ."
}

# Save updated package.json
$packageContent | ConvertTo-Json -Depth 10 | Out-File -FilePath $packagePath -Encoding UTF8
Write-Host "Updated: package.json" -ForegroundColor Green

# Create a simple electron runner script
$runElectron = @'
@echo off
echo Starting Electron in development mode...
set NODE_ENV=development
npx electron .
'@

[System.IO.File]::WriteAllText("run-electron.bat", $runElectron, $Utf8NoBomEncoding)
Write-Host "Created: run-electron.bat" -ForegroundColor Green

Write-Host ""
Write-Host "Electron setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To run the app:" -ForegroundColor Cyan
Write-Host "1. In Terminal 1: npm run dev" -ForegroundColor Yellow
Write-Host "2. In Terminal 2: npm run electron" -ForegroundColor Yellow
Write-Host ""
Write-Host "Or use the batch file: ./run-electron.bat" -ForegroundColor Yellow