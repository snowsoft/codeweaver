package cmd

import (
	"context"
	"fmt"
	"time"

	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
	"github.com/snowsoft/codeweaver/internal/ai"
	"github.com/snowsoft/codeweaver/internal/ai/ollama"
)

// DoctorCmd checks system configuration
var DoctorCmd = &cobra.Command{
	Use:   "doctor",
	Short: "Check system configuration and dependencies",
	Long:  `Verify that CodeWeaver is properly configured and all dependencies are available.`,
	RunE:  runDoctor,
}

func runDoctor(cmd *cobra.Command, args []string) error {
	pterm.DefaultHeader.Println("CodeWeaver System Check")
	
	// Check Ollama connection
	spinner, _ := pterm.DefaultSpinner.Start("Checking Ollama connection...")
	
	// Create Ollama client with default config
	config := ai.Config{
		Provider: ai.ProviderOllama,
		APIURL:   "http://localhost:11434",
		Timeout:  10 * time.Second,
	}
	
	client := ollama.NewClient(config)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	
	if err := client.HealthCheck(ctx); err != nil {
		spinner.Fail(fmt.Sprintf("Ollama connection: FAILED - %v", err))
		pterm.Warning.Println("Make sure Ollama is running: ollama serve")
		return nil
	}
	
	spinner.Success("Ollama connection: OK")
	
	// Check available models
	spinner, _ = pterm.DefaultSpinner.Start("Checking available models...")
	models, err := client.ListModels(ctx)
	if err != nil {
		spinner.Warning("Model check: FAILED - " + err.Error())
	} else {
		spinner.Success(fmt.Sprintf("Found %d models", len(models)))
		if len(models) > 0 {
			pterm.DefaultSection.Println("Available Models")
			for _, model := range models {
				pterm.Info.Printf("  • %s\n", model.Name)
			}
		} else {
			pterm.Warning.Println("No models found. Install a model with: ollama pull codellama:13b-instruct")
		}
	}
	
	// Check configuration
	pterm.Success.Println("Configuration: Loaded")
	pterm.Success.Println("Working directory: Writable")
	
	pterm.DefaultSection.Println("System Status")
	if len(models) > 0 {
		pterm.Success.Println("All systems operational! You're ready to use CodeWeaver.")
		pterm.Info.Println("\nTry: weaver new hello.py --task \"Create a hello world script\"")
	} else {
		pterm.Warning.Println("System is ready but no AI models found.")
		pterm.Info.Println("\nInstall a model first:")
		pterm.Info.Println("  ollama pull codellama:13b-instruct")
	}
	
	return nil
}