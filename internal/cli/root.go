package cli

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"github.com/snowsoft/codeweaver/internal/cli/cmd"
)

var (
	cfgFile string
	verbose bool
	debug   bool
)

var rootCmd = &cobra.Command{
	Use:   "weaver",
	Short: "AI-powered universal code generation and transformation tool",
	Long: `CodeWeaver is a powerful CLI tool that automates code writing, refactoring,
documentation, and testing processes using AI. It works with any programming
language and understands project context to perform intelligent code transformations.`,
	Version: "0.1.0",
}

// Execute runs the root command
func Execute() error {
	return rootCmd.Execute()
}

func init() {
	cobra.OnInitialize(initConfig)

	// Global flags
	rootCmd.PersistentFlags().StringVar(&cfgFile, "config", "", "config file (default is $HOME/.config/weaver/config.yaml)")
	rootCmd.PersistentFlags().BoolVarP(&verbose, "verbose", "v", false, "verbose output")
	rootCmd.PersistentFlags().BoolVar(&debug, "debug", false, "debug mode")

	// Bind flags to viper
	viper.BindPFlag("verbose", rootCmd.PersistentFlags().Lookup("verbose"))
	viper.BindPFlag("debug", rootCmd.PersistentFlags().Lookup("debug"))

	// Register commands
	rootCmd.AddCommand(cmd.VersionCmd)
	rootCmd.AddCommand(cmd.DoctorCmd)
	rootCmd.AddCommand(cmd.NewCmd)
	rootCmd.AddCommand(cmd.RefactorCmd)
	rootCmd.AddCommand(cmd.CreateCmd)
    rootCmd.AddCommand(cmd.TemplateCmd) 

}

func initConfig() {
	if cfgFile != "" {
		viper.SetConfigFile(cfgFile)
	} else {
		home, err := os.UserHomeDir()
		if err != nil {
			fmt.Println(err)
			os.Exit(1)
		}

		// Search config in ~/.config/weaver
		viper.AddConfigPath(home + "/.config/weaver")
		viper.SetConfigName("config")
		viper.SetConfigType("yaml")
	}

	// Environment variables
	viper.SetEnvPrefix("WEAVER")
	viper.AutomaticEnv()

	// Read config file
	if err := viper.ReadInConfig(); err == nil {
		if verbose {
			fmt.Println("Using config file:", viper.ConfigFileUsed())
		}
	}
}