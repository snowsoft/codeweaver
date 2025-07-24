@echo off
echo Code Weaver Quick Setup
echo =======================
echo.

:: Create config directory
set CONFIG_DIR=%USERPROFILE%\.config\weaver
if not exist "%CONFIG_DIR%" mkdir "%CONFIG_DIR%"

:: Create default config if not exists
if not exist "%CONFIG_DIR%\config.yaml" (
    (
    echo # Weaver Configuration
    echo ollama:
    echo   api_url: "http://localhost:11434"
    echo   model: "codellama:13b-instruct"
    echo   temperature: 0.7
    echo.
    echo ui:
    echo   theme: "dark"
    echo   show_spinner: true
    echo.
    echo defaults:
    echo   auto_backup: true
    echo   backup_dir: ".weaver_backups"
    ) > "%CONFIG_DIR%\config.yaml"
    echo [OK] Config file created
)

:: Check if weaver exists
where weaver >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] Weaver is installed
    weaver --version
) else (
    echo [X] Weaver not found in PATH
    echo.
    echo To install:
    echo   1. Download from: https://github.com/snowsoft/codeweaver/releases
    echo   2. Or build: go build -o weaver.exe .
    echo   3. Add to PATH or copy to C:\Windows\System32\
)

:: Check Ollama
where ollama >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] Ollama is installed
) else (
    echo [X] Ollama not found
    echo Install from: https://ollama.ai/
)

echo.
echo Setup complete! Run: weaver --help
pause