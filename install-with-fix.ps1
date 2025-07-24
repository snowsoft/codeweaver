# Code Weaver Installation with Go Fix
# For users with broken Go installations (Laragon, etc.)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "  Code Weaver Installation" -ForegroundColor Cyan
Write-Host "  (with Go environment fix)" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Function to find proper Go installation
function Find-ProperGo {
    $standardPaths = @(
        "C:\Program Files\Go",
        "C:\Go",
        "$env:LOCALAPPDATA\Programs\Go"
    )
    
    foreach ($path in $standardPaths) {
        if (Test-Path "$path\bin\go.exe") {
            # Test if this Go has log/slog (Go 1.21+)
            $testResult = & "$path\bin\go.exe" list std 2>$null | Select-String "log/slog"
            if ($testResult) {
                return $path
            }
        }
    }
    return $null
}

# Check current Go
Write-Host "Checking current Go installation..." -ForegroundColor Yellow
$currentGoVersion = & go version 2>$null
$currentGoRoot = & go env GOROOT 2>$null

if ($currentGoRoot -like "*laragon*") {
    Write-Host "[WARNING] Detected Laragon Go installation" -ForegroundColor Yellow
    Write-Host "This installation is incompatible with modern Go modules" -ForegroundColor Yellow
    Write-Host ""
}

# Find proper Go
Write-Host "Searching for compatible Go installation..." -ForegroundColor Yellow
$properGo = Find-ProperGo

if (-not $properGo) {
    Write-Host ""
    Write-Host "[ERROR] No compatible Go installation found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "You need Go 1.21 or newer. Current installations don't have required packages." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please install Go:" -ForegroundColor Cyan
    Write-Host "1. Download from: https://go.dev/dl/" -ForegroundColor White
    Write-Host "   (Get go1.21.5.windows-amd64.msi or newer)" -ForegroundColor Gray
    Write-Host "2. Run the installer with default settings" -ForegroundColor White
    Write-Host "3. Restart your computer" -ForegroundColor White
    Write-Host "4. Run this script again" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter to open Go download page"
    Start-Process "https://go.dev/dl/"
    exit 1
}

Write-Host "[OK] Found compatible Go at: $properGo" -ForegroundColor Green
Write-Host ""

# Set up environment for this session
Write-Host "Setting up Go environment..." -ForegroundColor Yellow
$env:GOROOT = $properGo
$env:PATH = "$properGo\bin;$env:PATH"

# Remove any Laragon Go from PATH
$env:PATH = $env:PATH -replace "E:\\laragon\\laragon\\bin\\go\\bin;?", ""
$env:PATH = $env:PATH -replace "E:\\laragon\\laragon\\bin\\go;?", ""

# Test Go
$newVersion = & go version
Write-Host "[OK] Using: $newVersion" -ForegroundColor Green
Write-Host ""

try {
    # Clean up
    Write-Host "Cleaning up old files..." -ForegroundColor Yellow
    Remove-Item -Path "go.mod", "go.sum", "weaver.exe" -ErrorAction SilentlyContinue
    
    # Set Go environment
    Write-Host "Configuring Go modules..." -ForegroundColor Yellow
    & go env -w GO111MODULE=on
    & go env -w GOPROXY=https://proxy.golang.org,direct
    & go env -w GOSUMDB=sum.golang.org
    
    # Initialize module
    Write-Host "Initializing project..." -ForegroundColor Yellow
    & go mod init github.com/snowsoft/codeweaver
    if ($LASTEXITCODE -ne 0) { throw "Failed to initialize module" }
    
    # Install dependencies
    Write-Host ""
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    
    $dependencies = @(
        @{name="Cobra CLI framework"; pkg="github.com/spf13/cobra@v1.8.0"},
        @{name="Viper configuration"; pkg="github.com/spf13/viper@v1.18.2"},
        @{name="PTerm UI library"; pkg="github.com/pterm/pterm@v0.12.71"},
        @{name="Diff viewer"; pkg="github.com/sergi/go-diff@v1.3.1"},
        @{name="Survey prompts"; pkg="github.com/AlecAivazis/survey/v2@v2.3.7"},
        @{name="YAML support"; pkg="gopkg.in/yaml.v3@v3.0.1"}
    )
    
    foreach ($dep in $dependencies) {
        Write-Host "  Installing $($dep.name)..." -ForegroundColor Gray
        & go get $dep.pkg
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to install $($dep.name)"
        }
    }
    
    # Tidy
    Write-Host ""
    Write-Host "Tidying up modules..." -ForegroundColor Yellow
    & go mod tidy
    
    # Build
    Write-Host ""
    Write-Host "Building Code Weaver..." -ForegroundColor Yellow
    & go build -o weaver.exe .
    
    if (-not (Test-Path "weaver.exe")) {
        throw "Build failed - weaver.exe not created"
    }
    
    Write-Host "[OK] Build successful!" -ForegroundColor Green
    
    # Create config
    $configDir = "$env:USERPROFILE\.config\weaver"
    if (-not (Test-Path $configDir)) {
        New-Item -ItemType Directory -Path $configDir -Force | Out-Null
    }
    
    if (Test-Path "config.yaml.example") {
        Copy-Item "config.yaml.example" "$configDir\config.yaml" -Force
        Write-Host "[OK] Configuration created" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "===================================" -ForegroundColor Green
    Write-Host "  Installation Complete!" -ForegroundColor Green
    Write-Host "===================================" -ForegroundColor Green
    Write-Host ""
    
    # Test the binary
    Write-Host "Testing Weaver..." -ForegroundColor Yellow
    $weaverVersion = & .\weaver.exe --version 2>$null
    if ($weaverVersion) {
        Write-Host "[OK] $weaverVersion" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "IMPORTANT for Laragon users:" -ForegroundColor Yellow
    Write-Host "----------------------------" -ForegroundColor Yellow
    Write-Host "Your Laragon Go is incompatible with modern Go modules." -ForegroundColor White
    Write-Host "Please install official Go and update your PATH." -ForegroundColor White
    Write-Host ""
    Write-Host "To use weaver.exe:" -ForegroundColor Cyan
    Write-Host "  .\weaver.exe --help" -ForegroundColor White
    Write-Host ""
    Write-Host "To install globally:" -ForegroundColor Cyan
    Write-Host "  Copy weaver.exe to C:\Windows\System32\ (as admin)" -ForegroundColor White
    Write-Host "  Or add current directory to PATH" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "[ERROR] Installation failed: $_" -ForegroundColor Red
    Write-Host ""
}

Read-Host "Press Enter to exit"