# Code Weaver Quick Setup Script

Write-Host "🧵 Code Weaver Quick Setup" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

# Create config directory
$configDir = "$env:USERPROFILE\.config\weaver"
if (!(Test-Path $configDir)) {
    New-Item -ItemType Directory -Path $configDir -Force | Out-Null
}

# Create default config if not exists
$configFile = "$configDir\config.yaml"
if (!(Test-Path $configFile)) {
    @"
# Weaver Configuration
ollama:
  api_url: "http://localhost:11434"
  model: "codellama:13b-instruct"
  temperature: 0.7

ui:
  theme: "dark"
  show_spinner: true

defaults:
  auto_backup: true
  backup_dir: ".weaver_backups"
"@ | Out-File -FilePath $configFile -Encoding UTF8
    Write-Host "✅ Config file created" -ForegroundColor Green
}

# Check if weaver exists
if (Get-Command weaver -ErrorAction SilentlyContinue) {
    Write-Host "✅ Weaver is installed" -ForegroundColor Green
    & weaver --version
} else {
    Write-Host "❌ Weaver not found in PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "To install:" -ForegroundColor Yellow
    Write-Host "  1. Download from: https://github.com/snowsoft/codeweaver/releases"
    Write-Host "  2. Or build: go build -o weaver.exe ."
    Write-Host "  3. Add to PATH"
}

# Check Ollama
if (Get-Command ollama -ErrorAction SilentlyContinue) {
    Write-Host "✅ Ollama is installed" -ForegroundColor Green
} else {
    Write-Host "❌ Ollama not found" -ForegroundColor Red
    Write-Host "Install from: https://ollama.ai/" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Setup complete! Run: weaver --help" -ForegroundColor Cyan