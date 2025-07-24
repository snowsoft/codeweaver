@echo off
echo Fixing Go proxy settings...

:: Set GOPROXY to default
go env -w GOPROXY=https://proxy.golang.org,direct

:: Set GOSUMDB
go env -w GOSUMDB=sum.golang.org

:: Set GO111MODULE
go env -w GO111MODULE=on

:: Display current settings
echo.
echo Current Go environment settings:
echo ================================
go env GOPROXY
go env GOSUMDB
go env GO111MODULE

echo.
echo Go proxy settings fixed!
echo You can now run install.bat or install.ps1
pause