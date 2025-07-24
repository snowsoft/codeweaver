# Code Weaver Offline Installation Script for Windows
# For environments with proxy/firewall issues

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "  Code Weaver Offline Installation" -ForegroundColor Cyan
Write-Host "    (For Proxy/Firewall Issues)" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

try {
    # Disable checksum verification
    Write-Host "[*] Configuring Go for offline/proxy environment..." -ForegroundColor Yellow
    & go env -w GOSUMDB="off"
    & go env -w GO111MODULE="on"
    & go env -w GOPROXY="direct"
    
    Write-Host "[OK] Go configured for offline mode" -ForegroundColor Green
    Write-Host ""
    
    # Clean up
    Write-Host "[*] Cleaning up old files..." -ForegroundColor Yellow
    Remove-Item -Path "go.mod", "go.sum", "weaver.exe" -ErrorAction SilentlyContinue
    
    # Create go.mod manually
    Write-Host "[*] Creating go.mod file..." -ForegroundColor Yellow
    @"
module github.com/snowsoft/codeweaver

go 1.21

require (
    github.com/spf13/cobra v1.8.0
    github.com/spf13/viper v1.18.2
    github.com/pterm/pterm v0.12.71
    github.com/sergi/go-diff v1.3.1
    github.com/AlecAivazis/survey/v2 v2.3.7
    gopkg.in/yaml.v3 v3.0.1
)
"@ | Out-File -FilePath "go.mod" -Encoding UTF8
    
    Write-Host "[OK] go.mod created" -ForegroundColor Green
    
    # Try to download dependencies
    Write-Host ""
    Write-Host "[*] Attempting to download dependencies..." -ForegroundColor Yellow
    Write-Host "    (This may take a while)" -ForegroundColor Gray
    
    & go mod download
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[!] Could not download all dependencies" -ForegroundColor Yellow
        Write-Host "[!] Attempting alternative method..." -ForegroundColor Yellow
        
        # Try getting dependencies one by one
        $dependencies = @(
            "github.com/spf13/cobra@v1.8.0",
            "github.com/spf13/viper@v1.18.2",
            "github.com/pterm/pterm@v0.12.71",
            "github.com/sergi/go-diff@v1.3.1",
            "github.com/AlecAivazis/survey/v2@v2.3.7",
            "gopkg.in/yaml.v3@v3.0.1"
        )
        
        foreach ($dep in $dependencies) {
            Write-Host "  Getting $dep..." -ForegroundColor Gray
            & go get -d $dep 2>$null
        }
    }
    
    # Tidy
    Write-Host ""
    Write-Host "[*] Running go mod tidy..." -ForegroundColor Yellow
    & go mod tidy 2>$null
    
    # Build
    Write-Host ""
    Write-Host "[*] Building Code Weaver..." -ForegroundColor Yellow
    & go build -o weaver.exe .
    
    if (Test-Path "weaver.exe") {
        Write-Host "[OK] Build successful!" -ForegroundColor Green
        
        # Setup config
        $configDir = "$env:USERPROFILE\.config\weaver"
        if (-not (Test-Path $configDir)) {
            New-Item -ItemType Directory -Path $configDir -Force | Out-Null
        }
        
        if (Test-Path "config.yaml.example") {
            Copy-Item "config.yaml.example" "$configDir\config.yaml" -Force
            Write-Host "[OK] Configuration file created" -ForegroundColor Green
        }
        
        Write-Host ""
        Write-Host "===================================" -ForegroundColor Green
        Write-Host "  Installation Complete!" -ForegroundColor Green
        Write-Host "===================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Weaver.exe has been created in the current directory." -ForegroundColor White
        Write-Host ""
        Write-Host "To use it globally, copy it to one of these locations:" -ForegroundColor Yellow
        Write-Host "  - C:\Windows\System32\ (requires admin)" -ForegroundColor Gray
        Write-Host "  - Add current directory to PATH" -ForegroundColor Gray
        Write-Host ""
    } else {
        throw "Build failed - weaver.exe not created"
    }
    
} catch {
    Write-Host ""
    Write-Host "[ERROR] Installation failed: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Manual Installation Steps:" -ForegroundColor Yellow
    Write-Host "1. Download dependencies manually from:" -ForegroundColor White
    Write-Host "   - github.com/spf13/cobra" -ForegroundColor Gray
    Write-Host "   - github.com/spf13/viper" -ForegroundColor Gray
    Write-Host "   - github.com/pterm/pterm" -ForegroundColor Gray
    Write-Host "   - github.com/sergi/go-diff" -ForegroundColor Gray
    Write-Host "   - github.com/AlecAivazis/survey" -ForegroundColor Gray
    Write-Host "   - gopkg.in/yaml.v3" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Place them in your GOPATH or vendor directory" -ForegroundColor White
    Write-Host "3. Run: go build -o weaver.exe ." -ForegroundColor White
    Write-Host ""
}

Read-Host "Press Enter to exit"