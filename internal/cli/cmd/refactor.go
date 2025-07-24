package cmd

import (
	"context"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/AlecAivazis/survey/v2"
	"github.com/pterm/pterm"
	"github.com/sergi/go-diff/diffmatchpatch"
	"github.com/spf13/cobra"
	"github.com/snowsoft/codeweaver/internal/ai"
	"github.com/snowsoft/codeweaver/internal/ai/ollama"
)

// RefactorCmd represents the refactor command
var RefactorCmd = &cobra.Command{
	Use:   "refactor <file>",
	Short: "Refactor and modernize existing code",
	Long: `Refactor existing code to improve quality, modernize syntax,
and follow current best practices while maintaining functionality.

Examples:
  weaver refactor old_code.js --task "Convert to ES6+ syntax"
  weaver refactor api.py --task "Add type hints and error handling"
  weaver refactor legacy.php --task "Update to PSR-12 standards"`,
	Args: cobra.ExactArgs(1),
	RunE: runRefactor,
}

func init() {
	RefactorCmd.Flags().StringVarP(&task, "task", "t", "", "Refactoring task description (required)")
	RefactorCmd.Flags().StringVar(&contextDir, "context-dir", "", "Project directory for context")
	RefactorCmd.Flags().StringVar(&provider, "provider", "ollama", "AI provider")
	RefactorCmd.Flags().StringVar(&model, "model", "", "Specific model to use")
	RefactorCmd.Flags().Float64Var(&temperature, "temperature", 0.3, "Generation temperature (0.0-1.0)")
	RefactorCmd.Flags().IntVar(&maxTokens, "max-tokens", 2000, "Maximum tokens to generate")
	
	RefactorCmd.MarkFlagRequired("task")
}

func runRefactor(cmd *cobra.Command, args []string) error {
	filename := args[0]
	
	// Check if file exists
	originalContent, err := os.ReadFile(filename)
	if err != nil {
		return fmt.Errorf("failed to read file %s: %w", filename, err)
	}
	
	pterm.DefaultHeader.Printf("Refactoring: %s\n", filename)
	pterm.Info.Printf("Task: %s\n", task)
	
	// Create backup
	backupDir := ".weaver_backups"
	os.MkdirAll(backupDir, 0755)
	backupFile := fmt.Sprintf("%s/%s.%d.bak", backupDir, filename, time.Now().Unix())
	os.WriteFile(backupFile, originalContent, 0644)
	pterm.Info.Printf("Backup created: %s\n", backupFile)
	
	// Create AI client
	spinner, _ := pterm.DefaultSpinner.Start("Connecting to AI provider...")
	
	config := ai.Config{
		Provider:    ai.ProviderOllama,
		APIURL:      "http://localhost:11434",
		Model:       model,
		Temperature: temperature, // Lower temperature for refactoring
		MaxTokens:   maxTokens,
		Timeout:     120 * time.Second,
	}
	
	client := ollama.NewClient(config)
	
	// Check connection
	ctx := context.Background()
	if err := client.HealthCheck(ctx); err != nil {
		spinner.Fail("Failed to connect to Ollama")
		return fmt.Errorf("ollama connection failed: %w", err)
	}
	
	spinner.UpdateText("Analyzing and refactoring code...")
	
	// Build refactoring prompt
	prompt := buildRefactorPrompt(filename, task, string(originalContent))
	
	// Generate refactored code
	req := ai.GenerateRequest{
		Prompt:      prompt,
		Model:       model,
		Temperature: temperature,
		MaxTokens:   maxTokens,
	}
	
	resp, err := client.Generate(ctx, req)
	if err != nil {
		spinner.Fail("Refactoring failed")
		return fmt.Errorf("generation failed: %w", err)
	}
	
	spinner.Success("Code refactored successfully!")
	
	// Show diff
	showDiff(string(originalContent), resp.Content)
	
	// Ask for confirmation
	saveChoice := ""
	prompt2 := &survey.Select{
		Message: "What would you like to do?",
		Options: []string{"Accept changes", "Decline changes", "Edit manually", "Regenerate"},
		Default: "Accept changes",
	}
	survey.AskOne(prompt2, &saveChoice)
	
	switch saveChoice {
	case "Accept changes":
		err = os.WriteFile(filename, []byte(resp.Content), 0644)
		if err != nil {
			return fmt.Errorf("failed to save file: %w", err)
		}
		pterm.Success.Printf("File updated: %s\n", filename)
		pterm.Info.Printf("Original backed up to: %s\n", backupFile)
		
	case "Decline changes":
		pterm.Info.Println("Changes declined. File unchanged.")
		os.Remove(backupFile)
		
	case "Edit manually":
		pterm.Info.Println("Manual edit functionality coming soon!")
		
	case "Regenerate":
		return runRefactor(cmd, args)
	}
	
	return nil
}

func buildRefactorPrompt(filename, task, originalCode string) string {
	prompt := fmt.Sprintf(`You are an expert code refactoring assistant. Your task is to refactor the following code.

Task: %s
Filename: %s

Original Code:
%s

Requirements:
- Maintain the exact same functionality
- Improve code quality, readability, and maintainability
- Apply modern best practices and idioms
- Fix any obvious bugs or issues
- Add appropriate comments where helpful
- DO NOT include markdown code blocks or any formatting
- Return ONLY the refactored code content

Refactored code:`, task, filename, originalCode)
	
	return prompt
}

func showDiff(original, refactored string) {
	pterm.DefaultSection.Println("Proposed Changes")
	
	dmp := diffmatchpatch.New()
	diffs := dmp.DiffMain(original, refactored, false)
	
	// Create a more readable diff display
	for _, diff := range diffs {
		lines := strings.Split(diff.Text, "\n")
		for i, line := range lines {
			if line == "" && i == len(lines)-1 {
				continue // Skip last empty line
			}
			
			switch diff.Type {
			case diffmatchpatch.DiffDelete:
				pterm.FgRed.Printf("- %s\n", line)
			case diffmatchpatch.DiffInsert:
				pterm.FgGreen.Printf("+ %s\n", line)
			case diffmatchpatch.DiffEqual:
				// Only show a few lines of context
				if len(lines) > 6 && i > 2 && i < len(lines)-3 {
					if i == 3 {
						fmt.Println("  ...")
					}
					continue
				}
				fmt.Printf("  %s\n", line)
			}
		}
	}
}