@echo off
setlocal enabledelayedexpansion

echo.
echo ===================================
echo   Code Weaver Installation Script
echo          for Windows
echo ===================================
echo.

:: Check if Go is installed
where go >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Go is not installed or not in PATH.
    echo.
    echo Please install Go 1.21 or higher from:
    echo https://go.dev/dl/
    echo.
    echo After installation, restart this script.
    pause
    exit /b 1
)

:: Get Go version
for /f "tokens=3" %%i in ('go version') do set GO_VERSION=%%i
echo [OK] Found Go version: %GO_VERSION%

:: Parse Go version (basic check)
for /f "tokens=1,2 delims=." %%a in ("%GO_VERSION:go=%") do (
    set GO_MAJOR=%%a
    set GO_MINOR=%%b
)

:: Check if version is 1.21 or higher
if %GO_MAJOR% equ 1 if %GO_MINOR% lss 21 (
    echo [ERROR] Go version 1.21 or higher is required.
    echo Current version: %GO_VERSION%
    pause
    exit /b 1
)

echo.
echo [*] Installing dependencies...
echo.

:: Clean up existing module files
if exist go.mod del /f go.mod
if exist go.sum del /f go.sum
if exist weaver.exe del /f weaver.exe

:: Initialize module
echo Initializing Go module...
go mod init github.com/snowsoft/codeweaver
if %errorlevel% neq 0 (
    echo [ERROR] Failed to initialize Go module
    pause
    exit /b 1
)

:: Add dependencies
echo.
echo Adding dependencies...
echo.

go get github.com/spf13/cobra@v1.8.0
if %errorlevel% neq 0 goto :dependency_error

go get github.com/spf13/viper@v1.18.2
if %errorlevel% neq 0 goto :dependency_error

go get github.com/pterm/pterm@v0.12.71
if %errorlevel% neq 0 goto :dependency_error

go get github.com/sergi/go-diff@v1.3.1
if %errorlevel% neq 0 goto :dependency_error

go get github.com/AlecAivazis/survey/v2@v2.3.7
if %errorlevel% neq 0 goto :dependency_error

go get gopkg.in/yaml.v3@v3.0.1
if %errorlevel% neq 0 goto :dependency_error

:: Tidy up
echo.
echo Tidying up modules...
go mod tidy
if %errorlevel% neq 0 (
    echo [WARNING] go mod tidy reported issues, but continuing...
)

:: Build
echo.
echo [*] Building Code Weaver...
echo.
go build -o weaver.exe .
if %errorlevel% neq 0 (
    echo [ERROR] Build failed. Please check the error messages above.
    pause
    exit /b 1
)

echo [OK] Build successful!

:: Setup configuration
echo.
echo [*] Setting up configuration...
echo.

set CONFIG_DIR=%USERPROFILE%\.config\weaver
if not exist "%CONFIG_DIR%" mkdir "%CONFIG_DIR%"

if not exist "%CONFIG_DIR%\config.yaml" (
    if exist "config.yaml.example" (
        copy "config.yaml.example" "%CONFIG_DIR%\config.yaml" >nul
        echo [OK] Configuration file created at: %CONFIG_DIR%\config.yaml
    ) else (
        echo [WARNING] config.yaml.example not found. Please create it manually.
    )
) else (
    echo [OK] Configuration file already exists at: %CONFIG_DIR%\config.yaml
)

:: Installation options
echo.
echo ===================================
echo   Installation Options:
echo ===================================
echo.
echo 1. Install to System32 (requires Administrator)
echo 2. Install to User directory
echo 3. Add current directory to PATH
echo 4. Skip installation (use from current directory)
echo.

set /p choice="Choose an option (1-4): "

if "%choice%"=="1" goto :install_system
if "%choice%"=="2" goto :install_user
if "%choice%"=="3" goto :add_to_path
if "%choice%"=="4" goto :skip_install
goto :invalid_choice

:install_system
echo.
echo Installing to System32...
echo This requires Administrator privileges.
echo.

:: Check for admin rights
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Administrator privileges required!
    echo.
    echo Please run this script as Administrator:
    echo 1. Right-click on install.bat
    echo 2. Select "Run as administrator"
    pause
    exit /b 1
)

copy weaver.exe %SYSTEMROOT%\System32\ >nul
if %errorlevel% equ 0 (
    echo [OK] Weaver installed to System32
    echo You can now use 'weaver' command from anywhere!
) else (
    echo [ERROR] Failed to copy to System32
    pause
    exit /b 1
)
goto :installation_complete

:install_user
echo.
echo Installing to user directory...

set USER_BIN=%USERPROFILE%\.local\bin
if not exist "%USER_BIN%" mkdir "%USER_BIN%"

copy weaver.exe "%USER_BIN%\" >nul
if %errorlevel% equ 0 (
    echo [OK] Weaver installed to %USER_BIN%
    echo.
    
    :: Check if already in PATH
    echo %PATH% | findstr /C:"%USER_BIN%" >nul
    if %errorlevel% neq 0 (
        echo [ACTION REQUIRED] Add to PATH manually:
        echo.
        echo 1. Press Win + X, select "System"
        echo 2. Click "Advanced system settings"
        echo 3. Click "Environment Variables"
        echo 4. Under "User variables", select "Path" and click "Edit"
        echo 5. Click "New" and add: %USER_BIN%
        echo 6. Click "OK" to save
        echo.
        echo After adding to PATH, restart Command Prompt.
    ) else (
        echo [OK] Directory already in PATH
    )
) else (
    echo [ERROR] Failed to copy to user directory
    pause
    exit /b 1
)
goto :installation_complete

:add_to_path
echo.
echo Adding current directory to PATH...

:: Get current directory
set CURRENT_DIR=%CD%

:: Check if already in PATH
echo %PATH% | findstr /C:"%CURRENT_DIR%" >nul
if %errorlevel% equ 0 (
    echo [OK] Current directory already in PATH
) else (
    echo [ACTION REQUIRED] Add to PATH manually:
    echo.
    echo 1. Press Win + X, select "System"
    echo 2. Click "Advanced system settings"
    echo 3. Click "Environment Variables"
    echo 4. Under "User variables", select "Path" and click "Edit"
    echo 5. Click "New" and add: %CURRENT_DIR%
    echo 6. Click "OK" to save
    echo.
    echo After adding to PATH, restart Command Prompt.
)
goto :installation_complete

:skip_install
echo.
echo [OK] Weaver binary created in current directory
echo Run with: weaver.exe
goto :installation_complete

:invalid_choice
echo.
echo [ERROR] Invalid option selected
pause
exit /b 1

:dependency_error
echo.
echo [ERROR] Failed to install dependencies
echo Please check your internet connection and try again.
pause
exit /b 1

:installation_complete
echo.
echo ===================================
echo   Installation Complete!
echo ===================================
echo.
echo Next steps:
echo.
echo 1. Install Ollama for Windows:
echo    https://ollama.ai/download/windows
echo.
echo 2. After installing Ollama, open a new Command Prompt and run:
echo    ollama serve
echo.
echo 3. In another Command Prompt, pull a model:
echo    ollama pull codellama:13b-instruct
echo.
echo 4. Test Weaver:
echo    weaver --version
echo.
echo Happy coding!
echo.
pause