@echo off
echo ====================================
echo   CodeWeaver Build Script
echo ====================================
echo.

REM Set variables
set BINARY_NAME=weaver.exe
set MAIN_PATH=cmd\weaver\main.go
set BUILD_DIR=build

REM Clean previous build
echo Cleaning previous build...
if exist %BUILD_DIR% (
    rmdir /s /q %BUILD_DIR% 2>nul
)

REM Create build directory
echo Creating build directory...
mkdir %BUILD_DIR% 2>nul

REM Get dependencies
echo Downloading dependencies...
go mod download
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to download dependencies
    echo Run: go mod tidy
    exit /b 1
)

REM Build the application
echo Building CodeWeaver...
go build -o %BUILD_DIR%\%BINARY_NAME% %MAIN_PATH%
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Build failed!
    echo Please check the error messages above.
    exit /b 1
)

echo.
echo ====================================
echo   Build Successful!
echo ====================================
echo.
echo Binary location: %BUILD_DIR%\%BINARY_NAME%
echo.
echo Run the following commands to test:
echo   %BUILD_DIR%\%BINARY_NAME% --help
echo   %BUILD_DIR%\%BINARY_NAME% version
echo   %BUILD_DIR%\%BINARY_NAME% doctor
echo.
echo To add to PATH:
echo   set PATH=%%PATH%%;%CD%\%BUILD_DIR%
echo.