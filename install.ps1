# Code Weaver Installation Script for Windows (PowerShell)
# Run with: powershell -ExecutionPolicy Bypass -File install.ps1

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "  Code Weaver Installation Script" -ForegroundColor Cyan
Write-Host "       for Windows (PowerShell)" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Check if Go is installed
function Test-GoInstalled {
    try {
        $null = Get-Command go -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

# Get Go version
function Get-GoVersion {
    $versionOutput = go version
    if ($versionOutput -match "go(\d+)\.(\d+)") {
        return @{
            Major = [int]$matches[1]
            Minor = [int]$matches[2]
            Full = $versionOutput
        }
    }
    return $null
}

# Add to PATH
function Add-ToPath {
    param([string]$Directory)
    
    $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if ($userPath -notlike "*$Directory*") {
        $newPath = $userPath + ";" + $Directory
        [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
        Write-Host "[OK] Added to PATH: $Directory" -ForegroundColor Green
        Write-Host "[!] Please restart your terminal for PATH changes to take effect" -ForegroundColor Yellow
        return $true
    } else {
        Write-Host "[OK] Directory already in PATH" -ForegroundColor Green
        return $false
    }
}

# Main installation process
try {
    # Check Go installation
    if (-not (Test-GoInstalled)) {
        Write-Host "[ERROR] Go is not installed or not in PATH." -ForegroundColor Red
        Write-Host ""
        Write-Host "Please install Go 1.21 or higher from:" -ForegroundColor Yellow
        Write-Host "https://go.dev/dl/" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "After installation, restart this script." -ForegroundColor Yellow
        Read-Host "Press Enter to exit"
        exit 1
    }

    # Check Go version
    $goVersion = Get-GoVersion
    Write-Host "[OK] Found Go version: $($goVersion.Full)" -ForegroundColor Green

    if ($goVersion.Major -eq 1 -and $goVersion.Minor -lt 21) {
        Write-Host "[ERROR] Go version 1.21 or higher is required." -ForegroundColor Red
        Write-Host "Current version: $($goVersion.Full)" -ForegroundColor Yellow
        Read-Host "Press Enter to exit"
        exit 1
    }

    Write-Host ""
    Write-Host "[*] Cleaning up old files..." -ForegroundColor Yellow
    Remove-Item -Path "go.mod", "go.sum", "weaver.exe" -ErrorAction SilentlyContinue

    Write-Host "[*] Installing dependencies..." -ForegroundColor Yellow
    Write-Host ""

    # Initialize module
    Write-Host "Initializing Go module..." -ForegroundColor Gray
    & go mod init github.com/snowsoft/codeweaver
    if ($LASTEXITCODE -ne 0) { throw "Failed to initialize Go module" }

    # Install dependencies with progress
    $dependencies = @(
        "github.com/spf13/cobra@v1.8.0",
        "github.com/spf13/viper@v1.18.2",
        "github.com/pterm/pterm@v0.12.71",
        "github.com/sergi/go-diff@v1.3.1",
        "github.com/AlecAivazis/survey/v2@v2.3.7",
        "gopkg.in/yaml.v3@v3.0.1"
    )

    $i = 0
    foreach ($dep in $dependencies) {
        $i++
        $percent = [int](($i / $dependencies.Count) * 100)
        Write-Progress -Activity "Installing dependencies" -Status "Installing $dep" -PercentComplete $percent
        & go get $dep
        if ($LASTEXITCODE -ne 0) { throw "Failed to install $dep" }
    }
    Write-Progress -Activity "Installing dependencies" -Completed

    # Tidy up
    Write-Host ""
    Write-Host "Tidying up modules..." -ForegroundColor Gray
    & go mod tidy

    # Build
    Write-Host ""
    Write-Host "[*] Building Code Weaver..." -ForegroundColor Yellow
    & go build -o weaver.exe .
    if ($LASTEXITCODE -ne 0) { throw "Build failed" }

    Write-Host "[OK] Build successful!" -ForegroundColor Green

    # Setup configuration
    Write-Host ""
    Write-Host "[*] Setting up configuration..." -ForegroundColor Yellow

    $configDir = "$env:USERPROFILE\.config\weaver"
    if (-not (Test-Path $configDir)) {
        New-Item -ItemType Directory -Path $configDir -Force | Out-Null
    }

    $configFile = "$configDir\config.yaml"
    if (-not (Test-Path $configFile)) {
        if (Test-Path "config.yaml.example") {
            Copy-Item "config.yaml.example" $configFile
            Write-Host "[OK] Configuration file created at: $configFile" -ForegroundColor Green
        } else {
            Write-Host "[WARNING] config.yaml.example not found. Please create it manually." -ForegroundColor Yellow
        }
    } else {
        Write-Host "[OK] Configuration file already exists" -ForegroundColor Green
    }

    # Installation options
    Write-Host ""
    Write-Host "===================================" -ForegroundColor Cyan
    Write-Host "  Installation Options:" -ForegroundColor Cyan
    Write-Host "===================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Install to Program Files (requires Administrator)" -ForegroundColor White
    Write-Host "2. Install to User directory (recommended)" -ForegroundColor White
    Write-Host "3. Add current directory to PATH" -ForegroundColor White
    Write-Host "4. Skip installation (use from current directory)" -ForegroundColor White
    Write-Host ""

    $choice = Read-Host "Choose an option (1-4)"

    switch ($choice) {
        "1" {
            Write-Host ""
            if (-not (Test-Administrator)) {
                Write-Host "[ERROR] Administrator privileges required!" -ForegroundColor Red
                Write-Host ""
                Write-Host "Please run PowerShell as Administrator:" -ForegroundColor Yellow
                Write-Host "1. Right-click on PowerShell" -ForegroundColor Gray
                Write-Host "2. Select 'Run as administrator'" -ForegroundColor Gray
                Write-Host "3. Navigate to this directory and run: .\install.ps1" -ForegroundColor Gray
                Read-Host "Press Enter to exit"
                exit 1
            }

            $installDir = "$env:ProgramFiles\CodeWeaver"
            if (-not (Test-Path $installDir)) {
                New-Item -ItemType Directory -Path $installDir -Force | Out-Null
            }
            Copy-Item "weaver.exe" "$installDir\" -Force
            Add-ToPath $installDir
            Write-Host "[OK] Weaver installed to Program Files" -ForegroundColor Green
        }
        "2" {
            Write-Host ""
            $userBin = "$env:USERPROFILE\.local\bin"
            if (-not (Test-Path $userBin)) {
                New-Item -ItemType Directory -Path $userBin -Force | Out-Null
            }
            Copy-Item "weaver.exe" "$userBin\" -Force
            Add-ToPath $userBin
            Write-Host "[OK] Weaver installed to user directory" -ForegroundColor Green
        }
        "3" {
            Write-Host ""
            $currentDir = Get-Location
            Add-ToPath $currentDir
            Write-Host "[OK] Current directory added to PATH" -ForegroundColor Green
        }
        "4" {
            Write-Host ""
            Write-Host "[OK] Weaver binary created in current directory" -ForegroundColor Green
            Write-Host "Run with: .\weaver.exe" -ForegroundColor Gray
        }
        default {
            Write-Host "[ERROR] Invalid option selected" -ForegroundColor Red
            Read-Host "Press Enter to exit"
            exit 1
        }
    }

    # Display next steps
    Write-Host ""
    Write-Host "===================================" -ForegroundColor Green
    Write-Host "  Installation Complete!" -ForegroundColor Green
    Write-Host "===================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Install Ollama for Windows:" -ForegroundColor White
    Write-Host "   https://ollama.ai/download/windows" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. After installing Ollama, open a new terminal and run:" -ForegroundColor White
    Write-Host "   ollama serve" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. In another terminal, pull a model:" -ForegroundColor White
    Write-Host "   ollama pull codellama:13b-instruct" -ForegroundColor Gray
    Write-Host ""
    Write-Host "4. Test Weaver:" -ForegroundColor White
    Write-Host "   weaver --version" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Happy coding! 🚀" -ForegroundColor Cyan
    Write-Host ""

} catch {
    Write-Host ""
    Write-Host "[ERROR] Installation failed: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Stack trace:" -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor Gray
    Read-Host "Press Enter to exit"
    exit 1
}

Read-Host "Press Enter to exit"