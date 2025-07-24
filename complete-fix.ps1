# Complete Go Fix and Code Weaver Installation

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   Complete Go Fix & Installation" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Function to find Go executable
function Find-GoExecutable {
    $goCmd = Get-Command go -ErrorAction SilentlyContinue
    if ($goCmd) {
        return $goCmd.Source
    }
    return $null
}

# Function to get correct GOROOT
function Get-CorrectGoRoot {
    param($goExePath)
    
    # Go from go.exe to bin to parent
    $binDir = Split-Path $goExePath -Parent
    $goRoot = Split-Path $binDir -Parent
    
    return $goRoot
}

# Step 1: Find Go
Write-Host "Step 1: Finding Go installation..." -ForegroundColor Yellow
$goExe = Find-GoExecutable

if (-not $goExe) {
    Write-Host "[ERROR] Go is not installed or not in PATH!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Go from: https://go.dev/dl/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[OK] Found Go at: $goExe" -ForegroundColor Green

# Step 2: Get correct GOROOT
$correctGoRoot = Get-CorrectGoRoot $goExe
Write-Host ""
Write-Host "Step 2: Setting correct GOROOT..." -ForegroundColor Yellow
Write-Host "GOROOT should be: $correctGoRoot" -ForegroundColor Gray

# Step 3: Verify standard library
$stdLibPath = Join-Path $correctGoRoot "src"
$fmtPath = Join-Path $stdLibPath "fmt"

if (-not (Test-Path $fmtPath)) {
    Write-Host "[ERROR] Standard library not found at: $stdLibPath" -ForegroundColor Red
    Write-Host ""
    Write-Host "Your Go installation is corrupted. Please reinstall Go." -ForegroundColor Yellow
    Write-Host "Download from: https://go.dev/dl/" -ForegroundColor Cyan
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[OK] Standard library found" -ForegroundColor Green

# Step 4: Reset Go environment
Write-Host ""
Write-Host "Step 3: Resetting Go environment..." -ForegroundColor Yellow

# Clear all custom settings
& go env -u GOROOT 2>$null
& go env -u GOPATH 2>$null
& go env -u GOBIN 2>$null

# Set environment variable for this session
$env:GOROOT = $correctGoRoot

# Set system environment variable
[Environment]::SetEnvironmentVariable("GOROOT", $correctGoRoot, "User")

# Configure Go
& go env -w GO111MODULE=on
& go env -w GOPROXY=https://proxy.golang.org,direct
& go env -w GOSUMDB=sum.golang.org

Write-Host "[OK] Go environment reset" -ForegroundColor Green

# Step 5: Verify
Write-Host ""
Write-Host "Step 4: Verifying Go setup..." -ForegroundColor Yellow
$version = & go version
Write-Host "Version: $version" -ForegroundColor Gray

$envGoRoot = & go env GOROOT
Write-Host "GOROOT: $envGoRoot" -ForegroundColor Gray

if ($envGoRoot -ne $correctGoRoot) {
    Write-Host "[WARNING] GOROOT mismatch. Forcing correct value..." -ForegroundColor Yellow
    $env:GOROOT = $correctGoRoot
}

# Step 6: Clean and build
Write-Host ""
Write-Host "Step 5: Building Code Weaver..." -ForegroundColor Yellow

try {
    # Clean up
    Remove-Item -Path "go.mod", "go.sum", "weaver.exe" -ErrorAction SilentlyContinue
    
    # Initialize module
    Write-Host "Initializing module..." -ForegroundColor Gray
    & go mod init github.com/snowsoft/codeweaver
    if ($LASTEXITCODE -ne 0) { throw "Module init failed" }
    
    # Add dependencies one by one with explicit GOROOT
    Write-Host "Adding dependencies..." -ForegroundColor Gray
    $env:GOROOT = $correctGoRoot
    
    $deps = @(
        "github.com/spf13/cobra@v1.8.0",
        "github.com/spf13/viper@v1.18.2",
        "github.com/pterm/pterm@v0.12.71",
        "github.com/sergi/go-diff@v1.3.1",
        "github.com/AlecAivazis/survey/v2@v2.3.7",
        "gopkg.in/yaml.v3@v3.0.1"
    )
    
    foreach ($dep in $deps) {
        Write-Host "  - Installing $dep" -ForegroundColor DarkGray
        & go get $dep
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERROR] Failed to install $dep" -ForegroundColor Red
            throw "Dependency installation failed"
        }
    }
    
    # Tidy
    Write-Host "Running go mod tidy..." -ForegroundColor Gray
    & go mod tidy
    
    # Build
    Write-Host "Building executable..." -ForegroundColor Gray
    & go build -o weaver.exe .
    
    if (Test-Path "weaver.exe") {
        Write-Host ""
        Write-Host "=====================================" -ForegroundColor Green
        Write-Host "   BUILD SUCCESSFUL!" -ForegroundColor Green
        Write-Host "=====================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "weaver.exe has been created!" -ForegroundColor White
        Write-Host ""
        Write-Host "Test it with:" -ForegroundColor Yellow
        Write-Host "  .\weaver.exe --version" -ForegroundColor White
    } else {
        throw "Build failed - no executable created"
    }
    
} catch {
    Write-Host ""
    Write-Host "[ERROR] Build failed: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Try manual build:" -ForegroundColor Yellow
    Write-Host "  set GOROOT=$correctGoRoot" -ForegroundColor White
    Write-Host "  go mod init github.com/snowsoft/codeweaver" -ForegroundColor White
    Write-Host "  go mod tidy" -ForegroundColor White
    Write-Host "  go build -o weaver.exe ." -ForegroundColor White
}

Write-Host ""
Read-Host "Press Enter to exit"