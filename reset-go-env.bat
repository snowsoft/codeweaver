@echo off
echo =====================================
echo   Complete Go Environment Reset
echo =====================================
echo.

echo Step 1: Clearing all Go environment variables...
go env -u GOROOT
go env -u GOPATH
go env -u GOBIN
go env -u GOPROXY
go env -u GOSUMDB
go env -u GO111MODULE

echo.
echo Step 2: Setting correct values...

:: Find where go.exe actually is
for %%i in (go.exe) do set "GO_EXE_PATH=%%~dp$PATH:i"
echo Found go.exe at: %GO_EXE_PATH%

:: Set GOROOT to parent of bin directory
for %%i in ("%GO_EXE_PATH:~0,-1%") do set "CORRECT_GOROOT=%%~dpi"
set "CORRECT_GOROOT=%CORRECT_GOROOT:~0,-1%"

echo Setting GOROOT to: %CORRECT_GOROOT%
setx GOROOT "%CORRECT_GOROOT%"
set GOROOT=%CORRECT_GOROOT%

echo.
echo Step 3: Verifying installation...
echo GOROOT should be: %CORRECT_GOROOT%
echo GOROOT/src should exist: %CORRECT_GOROOT%\src

if exist "%CORRECT_GOROOT%\src\fmt" (
    echo [OK] Standard library found at correct location!
) else (
    echo [ERROR] Standard library not found!
    echo.
    echo Your Go installation appears to be corrupted.
    echo Please reinstall Go from https://go.dev/dl/
    pause
    exit /b 1
)

echo.
echo Step 4: Setting module defaults...
go env -w GO111MODULE=on
go env -w GOPROXY=https://proxy.golang.org,direct
go env -w GOSUMDB=sum.golang.org

echo.
echo Step 5: Final verification...
go version
echo.
go env GOROOT
echo.

echo Environment reset complete!
echo.
echo Now try running:
echo   go mod init github.com/snowsoft/codeweaver
echo   go mod tidy
echo.
pause