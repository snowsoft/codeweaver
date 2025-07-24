// Package cmd contains all CLI commands for Weaver
package cmd

import (
    "fmt"
    "os"
    "path/filepath"
    
    "github.com/spf13/cobra"
    "github.com/spf13/viper"
    "github.com/snowsoft/codeweaver/internal/config"
)

var (
    cfgFile string
    cfg     *config.Config
)

// rootCmd represents the base command when called without any subcommands
var rootCmd = &cobra.Command{
    Use:   "weaver",
    Short: "Universal code generation and transformation CLI tool",
    Long: `Weaver is a powerful CLI tool that helps developers generate, refactor,
document, test, and review code in any programming language using AI.

It provides context-aware code transformations while ensuring all changes
are reviewed and approved before being applied.`,
    Version: "1.0.0",
}

// Execute adds all child commands to the root command and sets flags appropriately.
func Execute() error {
    return rootCmd.Execute()
}

func init() {
    cobra.OnInitialize(initConfig)
    
    // Global flags
    rootCmd.PersistentFlags().StringVar(&cfgFile, "config", "", "config file (default is $HOME/.config/weaver/config.yaml)")
    rootCmd.PersistentFlags().String("api-url", "", "Ollama API URL")
    rootCmd.PersistentFlags().String("model", "", "AI model to use")
    rootCmd.PersistentFlags().Float32("temperature", 0, "Model temperature (0-1)")
    
    // Bind flags to viper
    if err := viper.BindPFlag("ollama.api_url", rootCmd.PersistentFlags().Lookup("api-url")); err != nil {
        fmt.Fprintf(os.Stderr, "Error binding flag: %v\n", err)
    }
    if err := viper.BindPFlag("ollama.model", rootCmd.PersistentFlags().Lookup("model")); err != nil {
        fmt.Fprintf(os.Stderr, "Error binding flag: %v\n", err)
    }
    if err := viper.BindPFlag("ollama.temperature", rootCmd.PersistentFlags().Lookup("temperature")); err != nil {
        fmt.Fprintf(os.Stderr, "Error binding flag: %v\n", err)
    }
}

// initConfig reads in config file and ENV variables if set.
func initConfig() {
    if cfgFile != "" {
        // Use config file from the flag.
        viper.SetConfigFile(cfgFile)
    } else {
        // Find home directory.
        home, err := os.UserHomeDir()
        cobra.CheckErr(err)
        
        // Search config in home directory with name ".config/weaver/config.yaml"
        configPath := filepath.Join(home, ".config", "weaver")
        viper.AddConfigPath(configPath)
        viper.SetConfigType("yaml")
        viper.SetConfigName("config")
    }
    
    viper.AutomaticEnv() // read in environment variables that match
    
    // If a config file is found, read it in.
    if err := viper.ReadInConfig(); err == nil {
        fmt.Fprintln(os.Stderr, "Using config file:", viper.ConfigFileUsed())
    }
    
    // Load configuration
    var err error
    cfg, err = config.Load()
    if err != nil {
        fmt.Fprintf(os.Stderr, "Error loading configuration: %v\n", err)
        os.Exit(1)
    }
}