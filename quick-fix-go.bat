@echo off
echo =====================================
echo   Quick Go Fix for Laragon Users
echo =====================================
echo.

echo [!] Laragon's Go installation is broken!
echo [!] We need to use a proper Go installation.
echo.

:: Check if official Go is installed
if exist "C:\Program Files\Go\bin\go.exe" (
    echo [OK] Found official Go installation!
    echo.
    echo Temporarily switching to official Go...
    
    :: Set environment variables for this session
    set "GOROOT=C:\Program Files\Go"
    set "PATH=C:\Program Files\Go\bin;%PATH%"
    
    :: Remove Laragon paths from PATH for this session
    set "PATH=%PATH:E:\laragon\laragon\bin\go\bin;=%"
    set "PATH=%PATH:E:\laragon\laragon\bin\go;=%"
    
    echo.
    echo Testing Go...
    go version
    echo.
    
    if %errorlevel% equ 0 (
        echo [OK] Go is working!
        echo.
        echo Now you can run the installation:
        echo   go build -o weaver.exe .
        echo.
        echo Or use the fixed PowerShell installer:
        echo   powershell -ExecutionPolicy Bypass -File install-with-fix.ps1
    )
) else (
    echo [ERROR] Official Go not found at C:\Program Files\Go
    echo.
    echo Please download and install Go:
    echo.
    echo 1. Go to: https://go.dev/dl/
    echo 2. Download: go1.21.5.windows-amd64.msi or newer
    echo 3. Run the installer (use default settings)
    echo 4. Restart your computer
    echo 5. Run this script again
)

echo.
pause