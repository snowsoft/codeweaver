@echo off
setlocal enabledelayedexpansion

echo ====================================
echo   CodeWeaver Advanced Build Script
echo ====================================
echo.

REM Set variables
set BINARY_NAME=weaver.exe
set MAIN_PATH=cmd\weaver\main.go
set BUILD_DIR=build
set VERSION=0.1.0

REM Get current date and time - Fixed format without spaces
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "BUILD_TIME=%dt:~0,4%-%dt:~4,2%-%dt:~6,2%T%dt:~8,2%:%dt:~10,2%:%dt:~12,2%"

REM Get git commit (if available)
set GIT_COMMIT=unknown
for /f "tokens=*" %%i in ('git rev-parse --short HEAD 2^>nul') do set GIT_COMMIT=%%i

REM Build flags - Fixed with proper quotes
set LDFLAGS=-X "github.com/snowsoft/codeweaver/internal/cli/cmd.Version=%VERSION%" -X "github.com/snowsoft/codeweaver/internal/cli/cmd.BuildTime=%BUILD_TIME%" -X "github.com/snowsoft/codeweaver/internal/cli/cmd.GitCommit=%GIT_COMMIT%"

REM Menu
echo Select build option:
echo 1. Quick Build (development)
echo 2. Release Build (optimized)
echo 3. Cross-platform Build
echo 4. Clean Only
echo.
set /p choice="Enter choice (1-4): "

if "%choice%"=="1" goto quick_build
if "%choice%"=="2" goto release_build
if "%choice%"=="3" goto cross_build
if "%choice%"=="4" goto clean_only
goto invalid_choice

:quick_build
echo.
echo Starting Quick Build...
call :clean
call :build_dev
goto end

:release_build
echo.
echo Starting Release Build...
call :clean
call :build_release
goto end

:cross_build
echo.
echo Starting Cross-platform Build...
call :clean
call :build_all_platforms
goto end

:clean_only
echo.
echo Cleaning...
call :clean
echo Clean complete!
goto end

:invalid_choice
echo Invalid choice!
goto end

REM Functions
:clean
echo Cleaning previous builds...
if exist %BUILD_DIR% rmdir /s /q %BUILD_DIR%
go clean -cache 2>nul
mkdir %BUILD_DIR%
exit /b 0

:build_dev
echo Building development version...
go build -o %BUILD_DIR%\%BINARY_NAME% %MAIN_PATH%
if %ERRORLEVEL% NEQ 0 (
    echo Build failed!
    exit /b 1
)
echo Development build complete!
exit /b 0

:build_release
echo Building release version...
echo Build flags: %LDFLAGS%
go build -ldflags "%LDFLAGS% -s -w" -o %BUILD_DIR%\%BINARY_NAME% %MAIN_PATH%
if %ERRORLEVEL% NEQ 0 (
    echo Build failed!
    exit /b 1
)
echo Release build complete!
echo Binary size: 
for %%I in (%BUILD_DIR%\%BINARY_NAME%) do echo %%~zI bytes
exit /b 0

:build_all_platforms
echo Building for multiple platforms...

REM Windows AMD64
echo Building Windows (64-bit)...
set GOOS=windows
set GOARCH=amd64
go build -ldflags "%LDFLAGS% -s -w" -o %BUILD_DIR%\weaver-windows-amd64.exe %MAIN_PATH%

REM Windows 386
echo Building Windows (32-bit)...
set GOOS=windows
set GOARCH=386
go build -ldflags "%LDFLAGS% -s -w" -o %BUILD_DIR%\weaver-windows-386.exe %MAIN_PATH%

REM Linux AMD64
echo Building Linux (64-bit)...
set GOOS=linux
set GOARCH=amd64
go build -ldflags "%LDFLAGS% -s -w" -o %BUILD_DIR%\weaver-linux-amd64 %MAIN_PATH%

REM macOS AMD64
echo Building macOS (Intel)...
set GOOS=darwin
set GOARCH=amd64
go build -ldflags "%LDFLAGS% -s -w" -o %BUILD_DIR%\weaver-darwin-amd64 %MAIN_PATH%

REM macOS ARM64
echo Building macOS (Apple Silicon)...
set GOOS=darwin
set GOARCH=arm64
go build -ldflags "%LDFLAGS% -s -w" -o %BUILD_DIR%\weaver-darwin-arm64 %MAIN_PATH%

REM Reset environment
set GOOS=
set GOARCH=

echo.
echo Cross-platform builds complete!
echo Files in %BUILD_DIR%:
dir /b %BUILD_DIR%
exit /b 0

:end
echo.
echo ====================================
if exist %BUILD_DIR%\%BINARY_NAME% (
    echo Build successful!
    echo.
    echo Test with:
    echo   %BUILD_DIR%\%BINARY_NAME% --help
    echo   %BUILD_DIR%\%BINARY_NAME% version
) else (
    echo Build failed or cancelled.
)
echo ====================================
endlocal