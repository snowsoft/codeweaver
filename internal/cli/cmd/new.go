package cmd

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/AlecAivazis/survey/v2"
	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
	"github.com/snowsoft/codeweaver/internal/ai"
	"github.com/snowsoft/codeweaver/internal/ai/ollama"
)

var (
	task        string
	contextFile string
	contextDir  string
	provider    string
	model       string
	temperature float64
	maxTokens   int
)

// NewCmd represents the new command
var NewCmd = &cobra.Command{
	Use:   "new <file>",
	Short: "Generate new code files",
	Long: `Generate new code files based on your task description.
The AI will create code that matches your requirements and follows best practices.

Examples:
  weaver new hello.py --task "Create a hello world script"
  weaver new api.go --task "Create REST API with user CRUD operations"
  weaver new Button.tsx --task "Create React button component" --context-file theme.ts`,
	Args: cobra.ExactArgs(1),
	RunE: runNew,
}

func init() {
	NewCmd.Flags().StringVarP(&task, "task", "t", "", "Task description (required)")
	NewCmd.Flags().StringVar(&contextFile, "context-file", "", "Reference file for context")
	NewCmd.Flags().StringVar(&contextDir, "context-dir", "", "Reference directory for context")
	NewCmd.Flags().StringVar(&provider, "provider", "ollama", "AI provider (ollama, claude, openai, gemini)")
	NewCmd.Flags().StringVar(&model, "model", "", "Specific model to use")
	NewCmd.Flags().Float64Var(&temperature, "temperature", 0.7, "Generation temperature (0.0-1.0)")
	NewCmd.Flags().IntVar(&maxTokens, "max-tokens", 2000, "Maximum tokens to generate")
	
	NewCmd.MarkFlagRequired("task")
}

func runNew(cmd *cobra.Command, args []string) error {
	filename := args[0]
	
	// Check if file already exists
	if _, err := os.Stat(filename); err == nil {
		pterm.Warning.Printf("File %s already exists!\n", filename)
		
		overwrite := false
		prompt := &survey.Confirm{
			Message: "Do you want to overwrite it?",
			Default: false,
		}
		survey.AskOne(prompt, &overwrite)
		
		if !overwrite {
			pterm.Info.Println("Operation cancelled.")
			return nil
		}
	}
	
	// Start generation process
	pterm.DefaultHeader.Printf("Generating: %s\n", filename)
	pterm.Info.Printf("Task: %s\n", task)
	
	// Read context if provided
	var contextContent []string
	if contextFile != "" {
		content, err := os.ReadFile(contextFile)
		if err != nil {
			pterm.Warning.Printf("Could not read context file %s: %v\n", contextFile, err)
		} else {
			contextContent = append(contextContent, fmt.Sprintf("Reference file (%s):\n```\n%s\n```", contextFile, string(content)))
			pterm.Info.Printf("Using context from: %s\n", contextFile)
		}
	}
	
	// Create AI client
	spinner, _ := pterm.DefaultSpinner.Start("Connecting to AI provider...")
	
	config := ai.Config{
		Provider:    ai.ProviderOllama,
		APIURL:      "http://localhost:11434",
		Model:       model,
		Temperature: temperature,
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
	
	spinner.UpdateText("Generating code...")
	
	// Build prompt
	prompt := buildPrompt(filename, task, contextContent)
	
	// Generate code
	req := ai.GenerateRequest{
		Prompt:      prompt,
		Model:       model,
		Temperature: temperature,
		MaxTokens:   maxTokens,
		Context:     contextContent,
	}
	
	resp, err := client.Generate(ctx, req)
	if err != nil {
		spinner.Fail("Code generation failed")
		return fmt.Errorf("generation failed: %w", err)
	}
	
	spinner.Success("Code generated successfully!")
	
	// Display generated code
	pterm.DefaultSection.Println("Generated Code")
	pterm.DefaultBox.Println(resp.Content)
	
	// Ask for confirmation
	saveChoice := ""
	prompt2 := &survey.Select{
		Message: "What would you like to do?",
		Options: []string{"Save", "Edit", "Regenerate", "Cancel"},
		Default: "Save",
	}
	survey.AskOne(prompt2, &saveChoice)
	
	switch saveChoice {
	case "Save":
		// Create directory if needed
		dir := filepath.Dir(filename)
		if dir != "." && dir != "" {
			os.MkdirAll(dir, 0755)
		}
		
		// Save file
		err = os.WriteFile(filename, []byte(resp.Content), 0644)
		if err != nil {
			return fmt.Errorf("failed to save file: %w", err)
		}
		pterm.Success.Printf("File saved: %s\n", filename)
		
	case "Edit":
		// TODO: Implement editor integration
		pterm.Info.Println("Edit functionality coming soon!")
		
	case "Regenerate":
		// Recursively call the command
		return runNew(cmd, args)
		
	case "Cancel":
		pterm.Info.Println("Operation cancelled.")
	}
	
	return nil
}

func buildPrompt(filename, task string, context []string) string {
	ext := strings.TrimPrefix(filepath.Ext(filename), ".")
	language := getLanguageFromExt(ext)
	
	prompt := fmt.Sprintf(`You are an expert %s developer. Generate high-quality, production-ready code.

Task: %s
Filename: %s
Language: %s

Requirements:
- Write clean, well-structured code
- Include appropriate comments and documentation
- Follow best practices and conventions for %s
- Make the code complete and functional
- Handle errors appropriately
- DO NOT include markdown code blocks or any formatting
- Return ONLY the code content that should be saved to the file

`, language, task, filename, language, language)
	
	if len(context) > 0 {
		prompt += "\nContext:\n" + strings.Join(context, "\n\n")
	}
	
	return prompt
}

func getLanguageFromExt(ext string) string {
	languages := map[string]string{
		"py":   "Python",
		"js":   "JavaScript",
		"ts":   "TypeScript",
		"jsx":  "React JavaScript",
		"tsx":  "React TypeScript",
		"go":   "Go",
		"java": "Java",
		"cpp":  "C++",
		"c":    "C",
		"cs":   "C#",
		"php":  "PHP",
		"rb":   "Ruby",
		"rs":   "Rust",
		"swift": "Swift",
		"kt":   "Kotlin",
		"dart": "Dart",
		"vue":  "Vue",
		"html": "HTML",
		"css":  "CSS",
		"scss": "SCSS",
		"sql":  "SQL",
		"sh":   "Shell",
		"yml":  "YAML",
		"yaml": "YAML",
		"json": "JSON",
		"xml":  "XML",
		"md":   "Markdown",
	}
	
	if lang, ok := languages[ext]; ok {
		return lang
	}
	return "programming"
}