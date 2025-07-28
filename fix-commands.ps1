# Fix commands registration - fix-commands.ps1

Write-Host "Fixing command registration..." -ForegroundColor Cyan

# Update commands.go to temporarily comment out commands
Write-Host "Updating internal\cli\commands.go..." -ForegroundColor Yellow
@"
package cli

func init() {
    // Commands will be registered here
    // For now, we'll just have the root command work
}
"@ | Out-File -FilePath "internal\cli\commands.go" -Encoding UTF8

# Create a simple version command
Write-Host "Creating internal\cli\cmd\version.go..." -ForegroundColor Yellow
@"
package cmd

import (
    "fmt"
    
    "github.com/spf13/cobra"
)

// VersionCmd represents the version command
var VersionCmd = &cobra.Command{
    Use:   "version",
    Short: "Print the version number of CodeWeaver",
    Long:  ``This command prints the version number of CodeWeaver.``,
    Run: func(cmd *cobra.Command, args []string) {
        fmt.Println("CodeWeaver v0.1.0")
    },
}
"@ | Out-File -FilePath "internal\cli\cmd\version.go" -Encoding UTF8

# Update commands.go to register the version command
Write-Host "Registering version command..." -ForegroundColor Yellow
@"
package cli

import "github.com/snowsoft/codeweaver/internal/cli/cmd"

func init() {
    // Register commands
    rootCmd.AddCommand(cmd.VersionCmd)
}
"@ | Out-File -FilePath "internal\cli\commands.go" -Encoding UTF8

Write-Host "Commands fixed!" -ForegroundColor Green