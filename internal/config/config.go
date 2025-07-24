package config

import (
	"os"
	"path/filepath"
	
	"github.com/spf13/viper"
	"gopkg.in/yaml.v3"
)

type Config struct {
	// AI Settings
	AI struct {
		DefaultProvider string  `yaml:"default_provider"`
		DefaultModel    string  `yaml:"default_model"`
		Temperature     float64 `yaml:"temperature"`
		MaxTokens       int     `yaml:"max_tokens"`
		Stream          bool    `yaml:"stream"`
	} `yaml:"ai"`
	
	// Provider Settings
	Providers map[string]ProviderConfig `yaml:"providers"`
	
	// UI Settings
	UI struct {
		Theme       string `yaml:"theme"`
		ShowSpinner bool   `yaml:"show_spinner"`
		Colors      struct {
			Added    string `yaml:"added"`
			Removed  string `yaml:"removed"`
			Modified string `yaml:"modified"`
		} `yaml:"colors"`
	} `yaml:"ui"`
	
	// Defaults
	Defaults struct {
		ContextDepth int    `yaml:"context_depth"`
		AutoBackup   bool   `yaml:"auto_backup"`
		BackupDir    string `yaml:"backup_dir"`
	} `yaml:"defaults"`
}

type ProviderConfig struct {
	APIKey      string  `yaml:"api_key,omitempty"`
	APIURL      string  `yaml:"api_url,omitempty"`
	Model       string  `yaml:"model"`
	Temperature float64 `yaml:"temperature"`
	MaxTokens   int     `yaml:"max_tokens"`
}

var cfg *Config

// Load loads configuration from file
func Load() (*Config, error) {
	if cfg != nil {
		return cfg, nil
	}
	
	cfg = &Config{}
	
	// Set defaults
	viper.SetDefault("ai.default_provider", "ollama")
	viper.SetDefault("ai.default_model", "codellama:13b-instruct")
	viper.SetDefault("ai.temperature", 0.7)
	viper.SetDefault("ai.max_tokens", 2000)
	viper.SetDefault("ai.stream", true)
	
	viper.SetDefault("providers.ollama.api_url", "http://localhost:11434")
	viper.SetDefault("providers.ollama.model", "codellama:13b-instruct")
	
	viper.SetDefault("ui.theme", "dark")
	viper.SetDefault("ui.show_spinner", true)
	
	viper.SetDefault("defaults.context_depth", 3)
	viper.SetDefault("defaults.auto_backup", true)
	viper.SetDefault("defaults.backup_dir", ".weaver_backups")
	
	// Try to read config file
	if err := viper.ReadInConfig(); err == nil {
		if err := viper.Unmarshal(cfg); err != nil {
			return nil, err
		}
	} else {
		// Create default config file if it doesn't exist
		if _, ok := err.(viper.ConfigFileNotFoundError); ok {
			if err := createDefaultConfig(); err != nil {
				return nil, err
			}
		}
	}
	
	// Override with environment variables
	if apiKey := os.Getenv("OLLAMA_API_KEY"); apiKey != "" {
		if cfg.Providers == nil {
			cfg.Providers = make(map[string]ProviderConfig)
		}
		ollamaConfig := cfg.Providers["ollama"]
		ollamaConfig.APIKey = apiKey
		cfg.Providers["ollama"] = ollamaConfig
	}
	
	return cfg, nil
}

func createDefaultConfig() error {
	home, err := os.UserHomeDir()
	if err != nil {
		return err
	}
	
	configDir := filepath.Join(home, ".config", "weaver")
	if err := os.MkdirAll(configDir, 0755); err != nil {
		return err
	}
	
	configFile := filepath.Join(configDir, "config.yaml")
	
	defaultConfig := `# CodeWeaver Configuration

# AI Settings
ai:
  default_provider: ollama
  default_model: codellama:13b-instruct
  temperature: 0.7
  max_tokens: 2000
  stream: true

# Provider Settings
providers:
  ollama:
    api_url: http://localhost:11434
    model: codellama:13b-instruct
    
  # Uncomment and configure to use other providers
  # claude:
  #   api_key: ${CLAUDE_API_KEY}
  #   model: claude-3-opus-20240229
  #   
  # openai:
  #   api_key: ${OPENAI_API_KEY}
  #   model: gpt-4-turbo-preview
  #   
  # gemini:
  #   api_key: ${GEMINI_API_KEY}
  #   model: gemini-pro

# UI Settings
ui:
  theme: dark
  show_spinner: true
  colors:
    added: green
    removed: red
    modified: yellow

# Default Settings
defaults:
  context_depth: 3
  auto_backup: true
  backup_dir: .weaver_backups
`
	
	return os.WriteFile(configFile, []byte(defaultConfig), 0644)
}

// Get returns the current configuration
func Get() *Config {
	if cfg == nil {
		Load()
	}
	return cfg
}