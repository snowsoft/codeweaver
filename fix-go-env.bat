@echo off
echo =====================================
echo   Go Environment Fix Script
echo =====================================
echo.

echo Current Go environment:
echo -----------------------
echo GOROOT:
go env GOROOT
echo.
echo GOPATH:
go env GOPATH
echo.
echo PATH entries with Go:
echo %PATH% | findstr /i "go"
echo.

echo.
echo [!] It seems your Go installation is corrupted.
echo [!] GOROOT is pointing to: E:\laragon\laragon\bin\go\test
echo [!] This is incorrect!
echo.

echo Possible solutions:
echo.
echo 1. REINSTALL Go properly:
echo    a) Uninstall current Go installation
echo    b) Download Go from: https://go.dev/dl/
echo    c) Install to default location (C:\Program Files\Go)
echo    d) Restart your computer
echo.

echo 2. If you have multiple Go installations:
echo    Set the correct GOROOT manually:
echo.
echo    For standard installation:
echo    set GOROOT=C:\Program Files\Go
echo    go env -w GOROOT="C:\Program Files\Go"
echo.
echo    For custom installation (find where go.exe is):
echo    set GOROOT=C:\path\to\your\go
echo    go env -w GOROOT="C:\path\to\your\go"
echo.

echo 3. Reset Go environment:
echo    go env -u GOROOT
echo    go env -u GOPATH
echo.

echo Checking for Go installations...
echo.

:: Check common Go installation paths
if exist "C:\Program Files\Go\bin\go.exe" (
    echo [FOUND] Go at: C:\Program Files\Go
    echo.
    echo To use this installation, run:
    echo   set GOROOT=C:\Program Files\Go
    echo   set PATH=C:\Program Files\Go\bin;%PATH%
)

if exist "C:\Go\bin\go.exe" (
    echo [FOUND] Go at: C:\Go
    echo.
    echo To use this installation, run:
    echo   set GOROOT=C:\Go
    echo   set PATH=C:\Go\bin;%PATH%
)

if exist "%USERPROFILE%\go\bin\go.exe" (
    echo [FOUND] Go at: %USERPROFILE%\go
    echo.
    echo To use this installation, run:
    echo   set GOROOT=%USERPROFILE%\go
    echo   set PATH=%USERPROFILE%\go\bin;%PATH%
)

echo.
echo After fixing GOROOT, run these commands:
echo   go version
echo   go env GOROOT
echo.
echo Then try the installation again.
echo.
pause