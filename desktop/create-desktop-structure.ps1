# CodeWeaver Desktop Setup Script
# Simple version without special characters

param(
    [string]$RootPath = "."
)

Write-Host "CodeWeaver Desktop Setup" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host ""

$desktopRoot = Join-Path $RootPath "desktop"

# Create directory function
function CreateDir {
    param([string]$Path)

    if (-not (Test-Path $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
        Write-Host "Created: $Path" -ForegroundColor Green
    }
}

# Create file function
function CreateFile {
    param(
        [string]$Path,
        [string]$Content
    )

    $dir = Split-Path -Parent $Path
    if ($dir -and -not (Test-Path $dir)) {
        CreateDir $dir
    }

    if (-not (Test-Path $Path)) {
        Set-Content -Path $Path -Value $Content -Encoding UTF8
        Write-Host "Created: $Path" -ForegroundColor Green
    }
}

Write-Host "Creating directory structure..." -ForegroundColor Yellow
Write-Host ""

# Create all directories
$dirs = @(
    "electron/main",
    "electron/preload",
    "electron/services",
    "src/components/common/Button",
    "src/components/common/Modal",
    "src/components/common/Tooltip",
    "src/components/common/Dropdown",
    "src/components/common/LoadingSpinner",
    "src/components/editor/CodeEditor",
    "src/components/editor/DiffViewer",
    "src/components/editor/FileTree",
    "src/components/editor/TabManager",
    "src/components/layout/Sidebar",
    "src/components/layout/StatusBar",
    "src/components/layout/Toolbar",
    "src/components/layout/CommandPalette",
    "src/components/layout/MainLayout",
    "src/components/features/CodeGeneration",
    "src/components/features/Refactoring",
    "src/components/features/Documentation",
    "src/components/features/Testing",
    "src/components/features/Review",
    "src/views/Dashboard",
    "src/views/Editor",
    "src/views/Settings",
    "src/views/History",
    "src/views/Analytics",
    "src/hooks",
    "src/services",
    "src/store/slices",
    "src/store/middleware",
    "src/utils",
    "src/styles/themes",
    "src/styles/components",
    "src/assets/icons",
    "src/assets/images",
    "src/assets/fonts",
    "resources/binaries/darwin",
    "resources/binaries/linux",
    "resources/binaries/win32",
    "scripts",
    "tests/unit",
    "tests/integration",
    "tests/e2e",
    "docs"
)

foreach ($dir in $dirs) {
    CreateDir (Join-Path $desktopRoot $dir)
}

Write-Host ""
Write-Host "Creating configuration files..." -ForegroundColor Yellow
Write-Host ""

# Create package.json
$packageJson = '{
  "name": "codeweaver-desktop",
  "version": "2.0.0",
  "description": "AI-powered code generation and transformation tool",
  "main": "dist/electron/main/index.js",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:5173 && electron .\"",
    "electron:build": "npm run build && electron-builder",
    "test": "vitest",
    "lint": "eslint . --ext .ts,.tsx"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.0",
    "monaco-editor": "^0.45.0",
    "zustand": "^4.5.0",
    "@tabler/icons-react": "^3.0.0",
    "clsx": "^2.1.0",
    "react-hot-toast": "^2.4.1"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "@typescript-eslint/eslint-plugin": "^6.19.0",
    "@typescript-eslint/parser": "^6.19.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "concurrently": "^8.2.2",
    "electron": "^28.1.3",
    "electron-builder": "^24.9.1",
    "eslint": "^8.56.0",
    "postcss": "^8.4.33",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.11",
    "wait-on": "^7.2.0"
  }
}'
CreateFile (Join-Path $desktopRoot "package.json") $packageJson

# Create tsconfig.json
$tsconfig = '{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@electron/*": ["electron/*"]
    }
  },
  "include": ["src", "electron"],
  "references": [{ "path": "./tsconfig.node.json" }]
}'
CreateFile (Join-Path $desktopRoot "tsconfig.json") $tsconfig

# Create vite.config.ts
$viteConfig = 'import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@electron": path.resolve(__dirname, "./electron")
    }
  },
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: true
  },
  server: {
    port: 5173,
    strictPort: true
  }
})'
CreateFile (Join-Path $desktopRoot "vite.config.ts") $viteConfig

# Create index.html
$indexHtml = '<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/icon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CodeWeaver</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>'
CreateFile (Join-Path $desktopRoot "index.html") $indexHtml

# Create main.tsx
$mainTsx = 'import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);'
CreateFile (Join-Path $desktopRoot "src/main.tsx") $mainTsx

# Create App.tsx
$appTsx = 'import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { MainLayout } from "./components/layout/MainLayout";

function App() {
  return (
    <BrowserRouter>
      <MainLayout />
      <Toaster position="bottom-right" />
    </BrowserRouter>
  );
}

export default App;'
CreateFile (Join-Path $desktopRoot "src/App.tsx") $appTsx

# Create globals.css
$globalsCss = '@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 255 255 255;
    --foreground: 0 0 0;
  }

  .dark {
    --background: 30 30 30;
    --foreground: 204 204 204;
  }

  body {
    @apply bg-background text-foreground;
  }
}'
CreateFile (Join-Path $desktopRoot "src/styles/globals.css") $globalsCss

# Create MainLayout component
$mainLayout = 'export function MainLayout() {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 flex flex-col">
        <header className="bg-white dark:bg-gray-800 shadow-sm px-6 py-4">
          <h1 className="text-xl font-semibold">CodeWeaver Desktop</h1>
        </header>
        <main className="flex-1 p-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <p>Welcome to CodeWeaver Desktop!</p>
          </div>
        </main>
      </div>
    </div>
  );
}'
CreateFile (Join-Path $desktopRoot "src/components/layout/MainLayout/index.tsx") $mainLayout

# Create tailwind.config.js
$tailwindConfig = '/** @type {import("tailwindcss").Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {},
  },
  plugins: [],
}'
CreateFile (Join-Path $desktopRoot "tailwind.config.js") $tailwindConfig

# Create postcss.config.js
$postcssConfig = 'export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}'
CreateFile (Join-Path $desktopRoot "postcss.config.js") $postcssConfig

# Create .gitignore
$gitignore = 'node_modules
dist
dist-electron
.env.local
*.log
.DS_Store'
CreateFile (Join-Path $desktopRoot ".gitignore") $gitignore

# Create electron main file
$electronMain = 'const { app, BrowserWindow } = require("electron");
const path = require("path");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});'
CreateFile (Join-Path $desktopRoot "electron/main/index.js") $electronMain

# Create preload script
$preloadScript = 'const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  // Add your API methods here
});'
CreateFile (Join-Path $desktopRoot "electron/preload/index.js") $preloadScript

# Create README
$readme = '# CodeWeaver Desktop

AI-powered code generation desktop application.

## Setup

1. Install dependencies: npm install
2. Run development: npm run electron:dev
3. Build: npm run electron:build

## Technologies

- Electron
- React
- TypeScript
- Tailwind CSS
- Vite'
CreateFile (Join-Path $desktopRoot "README.md") $readme

Write-Host ""
Write-Host "Setup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. cd desktop"
Write-Host "2. npm install"
Write-Host "3. npm run electron:dev"
Write-Host ""