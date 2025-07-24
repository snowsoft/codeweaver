package cli

import "github.com/snowsoft/codeweaver/internal/cli/cmd"

func init() {
    // Register commands
    rootCmd.AddCommand(cmd.VersionCmd)
}
