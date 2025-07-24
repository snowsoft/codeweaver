package cmd

import (
	"fmt"
	
	"github.com/spf13/cobra"
)

// Version information
var (
	Version   = "0.1.0"
	BuildTime = "unknown"
	GitCommit = "unknown"
)

// VersionCmd represents the version command
var VersionCmd = &cobra.Command{
	Use:   "version",
	Short: "Print the version number of CodeWeaver",
	Long:  `This command prints the version number, build time, and git commit of CodeWeaver.`,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Printf("CodeWeaver v%s\n", Version)
		fmt.Printf("Build Time: %s\n", BuildTime)
		fmt.Printf("Git Commit: %s\n", GitCommit)
	},
}