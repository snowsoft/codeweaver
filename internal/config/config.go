// Package config handles configuration management for Weaver
package config

import (
    "time"
    
    "github.com/spf13/viper"
)

// Config represents the application configuration
type Config struct {
    Ollama   OllamaConfig              `mapstructure:"ollama"`
    UI       UIConfig                  `mapstructure:"ui"`
    Defaults DefaultsConfig            `mapstructure:"defaults"`
    Languages map[string]LanguageConfig `mapstructure:"languages"`
}

// OllamaConfig contains Ollama API settings
type OllamaConfig struct {
    APIURL      string        `mapstructure:"api_url"`
    Model       string        `mapstructure:"model"`
    Temperature float32       `mapstructure:"temperature"`
    MaxTokens   int           `mapstructure:"max_tokens"`
    Timeout     time.Duration `mapstructure:"timeout"`
}

// UIConfig contains UI-related settings
type UIConfig struct {
    Theme       string           `mapstructure:"theme"`
    ShowSpinner bool             `mapstructure:"show_spinner"`
    DiffColors  DiffColorsConfig `mapstructure:"diff_colors"`
}

// DiffColorsConfig contains colors for diff display
type DiffColorsConfig struct {
    Added    string `mapstructure:"added"`
    Removed  string `mapstructure:"removed"`
    Modified string `mapstructure:"modified"`
}

// DefaultsConfig contains default behavior settings
type DefaultsConfig struct {
    ContextDepth int    `mapstructure:"context_depth"`
    AutoBackup   bool   `mapstructure:"auto_backup"`
    BackupDir    string `mapstructure:"backup_dir"`
}

// LanguageConfig contains language-specific settings
type LanguageConfig struct {
    TestFramework string `mapstructure:"test_framework"`
    DocStyle      string `mapstructure:"doc_style"`
}

// Load loads the configuration from viper
func Load() (*Config, error) {
    var cfg Config
    
    // Set defaults
    viper.SetDefault("ollama.api_url", "http://localhost:11434")
    viper.SetDefault("ollama.model", "codellama:13b-instruct")
    viper.SetDefault("ollama.temperature", 0.7)
    viper.SetDefault("ollama.max_tokens", 4096)
    viper.SetDefault("ollama.timeout", "120s")
    
    viper.SetDefault("ui.theme", "dark")
    viper.SetDefault("ui.show_spinner", true)
    viper.SetDefault("ui.diff_colors.added", "green")
    viper.SetDefault("ui.diff_colors.removed", "red")
    viper.SetDefault("ui.diff_colors.modified", "yellow")
    
    viper.SetDefault("defaults.context_depth", 3)
    viper.SetDefault("defaults.auto_backup", true)
    viper.SetDefault("defaults.backup_dir", ".weaver_backups")
    
    // Unmarshal config
    if err := viper.Unmarshal(&cfg); err != nil {
        return nil, err
    }
    
    return &cfg, nil
}