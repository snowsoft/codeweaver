@echo off
echo Fixing Go environment settings...

:: Set GOPROXY to default
go env -w GOPROXY=https://proxy.golang.org,direct

:: Set GOSUMDB
go env -w GOSUMDB=sum.golang.org

:: Set GO111MODULE
go env -w GO111MODULE=on

:: If you're behind a corporate proxy or having issues, uncomment these:
:: go env -w GOPRIVATE=*
:: go env -w GOSUMDB=off
:: go env -w GOPROXY=direct

:: Display current settings
echo.
echo Current Go environment settings:
echo ================================
echo GOPROXY:
go env GOPROXY
echo.
echo GOSUMDB:
go env GOSUMDB
echo.
echo GO111MODULE:
go env GO111MODULE
echo.

echo Go environment settings fixed!
echo.

:: Try to download a test module
echo Testing module download...
go mod download -x github.com/spf13/cobra@v1.8.0
if %errorlevel% equ 0 (
    echo [OK] Module download successful!
) else (
    echo [WARNING] Module download failed. You may be behind a firewall.
    echo.
    echo Try running these commands:
    echo   go env -w GOSUMDB=off
    echo   go env -w GOPROXY=direct
    echo.
    echo Or if you have a corporate proxy:
    echo   set HTTP_PROXY=http://your-proxy:port
    echo   set HTTPS_PROXY=http://your-proxy:port
)

echo.
echo You can now run install.bat or install.ps1
pause