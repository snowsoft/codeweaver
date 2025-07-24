# Go Environment Fix Script for PowerShell

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   Go Environment Fix Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Function to find Go installations
function Find-GoInstallations {
    $locations = @(
        "C:\Program Files\Go",
        "C:\Go",
        "$env:USERPROFILE\go",
        "$env:USERPROFILE\sdk\go",
        "$env:LOCALAPPDATA\Programs\Go",
        "C:\tools\go",
        "$env:ChocolateyInstall\lib\golang\tools"
    )
    
    $found = @()
    
    foreach ($loc in $locations) {
        if (Test-Path "$loc\bin\go.exe") {
            $found += $loc
        }
    }
    
    # Search in PATH
    $pathDirs = $env:PATH -split ';'
    foreach ($dir in $pathDirs) {
        if ($dir -like "*go*" -and (Test-Path "$dir\go.exe")) {
            $parentDir = Split-Path $dir -Parent
            if ($parentDir -notin $found) {
                $found += $parentDir
            }
        }
    }
    
    return $found
}

# Display current environment
Write-Host "Current Go Environment:" -ForegroundColor Yellow
Write-Host "-----------------------"
Write-Host "GOROOT: $(go env GOROOT)" -ForegroundColor Gray
Write-Host "GOPATH: $(go env GOPATH)" -ForegroundColor Gray
Write-Host "Go Version: $(go version 2>$null)" -ForegroundColor Gray
Write-Host ""

# Check if GOROOT is incorrect
$currentGoRoot = & go env GOROOT 2>$null
if ($currentGoRoot -like "*laragon*") {
    Write-Host "[ERROR] Your GOROOT is incorrect!" -ForegroundColor Red
    Write-Host "Current GOROOT: $currentGoRoot" -ForegroundColor Red
    Write-Host "This appears to be a Laragon installation that's misconfigured." -ForegroundColor Yellow
    Write-Host ""
}

# Find Go installations
Write-Host "Searching for Go installations..." -ForegroundColor Cyan
$goInstalls = Find-GoInstallations

if ($goInstalls.Count -eq 0) {
    Write-Host "[ERROR] No valid Go installations found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Go:" -ForegroundColor Yellow
    Write-Host "1. Download from: https://go.dev/dl/" -ForegroundColor White
    Write-Host "2. Run the installer" -ForegroundColor White
    Write-Host "3. Restart this script" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "Found Go installations:" -ForegroundColor Green
    for ($i = 0; $i -lt $goInstalls.Count; $i++) {
        Write-Host "$($i + 1). $($goInstalls[$i])" -ForegroundColor White
        
        # Check version
        try {
            $oldPath = $env:PATH
            $env:PATH = "$($goInstalls[$i])\bin;$oldPath"
            $version = & "$($goInstalls[$i])\bin\go.exe" version 2>$null
            $env:PATH = $oldPath
            Write-Host "   Version: $version" -ForegroundColor Gray
        } catch {
            Write-Host "   Version: Unable to detect" -ForegroundColor Gray
        }
    }
    
    Write-Host ""
    Write-Host "Which installation would you like to use?" -ForegroundColor Yellow
    $choice = Read-Host "Enter number (1-$($goInstalls.Count))"
    
    if ($choice -match '^\d+$' -and [int]$choice -ge 1 -and [int]$choice -le $goInstalls.Count) {
        $selectedGo = $goInstalls[[int]$choice - 1]
        
        Write-Host ""
        Write-Host "Setting up Go environment..." -ForegroundColor Cyan
        
        # Set GOROOT
        [Environment]::SetEnvironmentVariable("GOROOT", $selectedGo, "User")
        $env:GOROOT = $selectedGo
        
        # Update PATH
        $userPath = [Environment]::GetEnvironmentVariable("PATH", "User")
        $newPath = "$selectedGo\bin"
        
        # Remove old Go paths
        $pathParts = $userPath -split ';' | Where-Object { $_ -notlike "*go*" -and $_ -notlike "*Go*" }
        $cleanPath = ($pathParts -join ';') + ";$newPath"
        
        [Environment]::SetEnvironmentVariable("PATH", $cleanPath, "User")
        $env:PATH = "$newPath;$env:PATH"
        
        # Reset Go environment
        & go env -u GOROOT 2>$null
        & go env -u GOPATH 2>$null
        & go env -w GO111MODULE=on
        & go env -w GOPROXY=https://proxy.golang.org,direct
        & go env -w GOSUMDB=sum.golang.org
        
        Write-Host ""
        Write-Host "[OK] Go environment configured!" -ForegroundColor Green
        Write-Host ""
        Write-Host "New settings:" -ForegroundColor Yellow
        Write-Host "GOROOT: $selectedGo" -ForegroundColor White
        Write-Host "PATH includes: $newPath" -ForegroundColor White
        Write-Host ""
        
        # Test installation
        Write-Host "Testing Go installation..." -ForegroundColor Cyan
        $testVersion = & go version 2>$null
        if ($testVersion) {
            Write-Host "[OK] $testVersion" -ForegroundColor Green
            Write-Host ""
            Write-Host "Go is now properly configured!" -ForegroundColor Green
            Write-Host "Please close and reopen your terminal, then run the installation again." -ForegroundColor Yellow
        } else {
            Write-Host "[ERROR] Go still not working properly" -ForegroundColor Red
        }
    } else {
        Write-Host "[ERROR] Invalid choice" -ForegroundColor Red
    }
}

Write-Host ""
Read-Host "Press Enter to exit"