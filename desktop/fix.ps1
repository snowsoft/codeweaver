# Fix all configuration issues
$desktopPath = "."

# Helper function to write file without BOM
function Write-FileNoBOM {
    param(
        [string]$Path,
        [string]$Content
    )
    [System.IO.File]::WriteAllText($Path, $Content, [System.Text.UTF8Encoding]::new($false))
    Write-Host "Created/Updated: $Path" -ForegroundColor Green
}

Write-Host "Fixing all configuration issues..." -ForegroundColor Yellow
Write-Host ""

# 1. Create tsconfig.node.json
$tsconfigNode = @"
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
"@
Write-FileNoBOM (Join-Path $desktopPath "tsconfig.node.json") $tsconfigNode

# 2. Update package.json
$packageJson = @"
{
  "name": "codeweaver-desktop",
  "version": "2.0.0",
  "description": "AI-powered code generation and transformation tool",
  "type": "module",
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
}
"@
Write-FileNoBOM (Join-Path $desktopPath "package.json") $packageJson

# 3. Fix postcss.config.js
$postcssConfig = @"
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
"@
Write-FileNoBOM (Join-Path $desktopPath "postcss.config.js") $postcssConfig

# 4. Fix vite.config.ts
$viteConfig = @"
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    }
  },
  server: {
    port: 5173
  }
});
"@
Write-FileNoBOM (Join-Path $desktopPath "vite.config.ts") $viteConfig

# 5. Fix tsconfig.json
$tsconfig = @"
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
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
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
"@
Write-FileNoBOM (Join-Path $desktopPath "tsconfig.json") $tsconfig

Write-Host ""
Write-Host "All configuration issues fixed!" -ForegroundColor Green
Write-Host ""
Write-Host "Now run these commands:" -ForegroundColor Cyan
Write-Host "1. npm install" -ForegroundColor Yellow
Write-Host "2. npm run dev" -ForegroundColor Yellow