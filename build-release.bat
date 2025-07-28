@echo off
echo Building CodeWeaver Release Version...
echo.

REM Create build directory
if not exist build mkdir build

REM Simple build without version info
echo Building without version info...
go build -ldflags "-s -w" -o build\weaver.exe cmd\weaver\main.go

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Build successful!
    echo Binary location: build\weaver.exe
    echo.
    for %%I in (build\weaver.exe) do echo Binary size: %%~zI bytes
    echo.
    echo Test with:
    echo   build\weaver.exe --help
    echo   build\weaver.exe version
) else (
    echo.
    echo Build failed!
)