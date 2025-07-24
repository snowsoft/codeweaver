package cli

import "github.com/snowsoft/codeweaver/internal/cli/cmd"

func init() {
	// Register all commands
	rootCmd.AddCommand(cmd.VersionCmd)
	rootCmd.AddCommand(cmd.DoctorCmd)
	rootCmd.AddCommand(cmd.NewCmd)
	rootCmd.AddCommand(cmd.RefactorCmd)
}