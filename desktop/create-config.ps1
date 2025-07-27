# Create config files without BOM
$desktopPath = "."

# Helper function to write file without BOM
function Write-FileNoBOM {
    param(
        [string]$Path,
        [string]$Content
    )
    [System.IO.File]::WriteAllText($Path, $Content, [System.Text.UTF8Encoding]::new($false))
    Write-Host "Created: $Path" -ForegroundColor Green
}

# postcss.config.js
$postcssConfig = @"
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
"@
Write-FileNoBOM (Join-Path $desktopPath "postcss.config.js") $postcssConfig

# vite.config.ts
$viteConfig = @"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  server: {
    port: 5173
  }
})
"@
Write-FileNoBOM (Join-Path $desktopPath "vite.config.ts") $viteConfig

# tsconfig.node.json (Vite için gerekli)
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

Write-Host "Config files created successfully!" -ForegroundColor Green