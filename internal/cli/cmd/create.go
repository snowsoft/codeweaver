package cmd

import (
	"context"
	"encoding/json"
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

// CreateCmd represents the create command
var CreateCmd = &cobra.Command{
	Use:   "create",
	Short: "Create multiple files based on natural language description",
	Long: `Create an entire project or feature by describing what you want in natural language.
The AI will understand your request and create all necessary files automatically.

Examples:
  weaver create "Create a REST API for a blog system with user authentication"
  weaver create "Build a React dashboard with charts and user management"
  weaver create "Create a Python CLI tool for file organization"`,
	Args: cobra.MinimumNArgs(1),
	RunE: runCreate,
}

type FileToCreate struct {
	Path        string `json:"path"`
	Description string `json:"description"`
	Content     string `json:"content,omitempty"`
}

type ProjectPlan struct {
	ProjectName string         `json:"project_name"`
	Description string         `json:"description"`
	Files       []FileToCreate `json:"files"`
	Commands    []string       `json:"setup_commands,omitempty"`
}

func init() {
	CreateCmd.Flags().StringVar(&provider, "provider", "ollama", "AI provider")
	CreateCmd.Flags().StringVar(&model, "model", "", "Specific model to use")
	CreateCmd.Flags().Float64Var(&temperature, "temperature", 0.7, "Generation temperature")
	CreateCmd.Flags().BoolP("yes", "y", false, "Skip confirmation prompts")
}

func runCreate(cmd *cobra.Command, args []string) error {
	// Join all args as the task description
	task := strings.Join(args, " ")
	
	pterm.DefaultHeader.Printf("Creating Project: %s\n", task)
	
	// Create AI client
	spinner, _ := pterm.DefaultSpinner.Start("Analyzing your request...")
	
	config := ai.Config{
		Provider:    ai.ProviderOllama,
		APIURL:      "http://localhost:11434",
		Model:       model,
		Temperature: 0.3, // Lower temperature for planning
		MaxTokens:   4000,
		Timeout:     120 * time.Second,
	}
	
	if model == "" {
		config.Model = "codellama:13b-instruct"
	}
	
	client := ollama.NewClient(config)
	ctx := context.Background()
	
	// Check connection
	if err := client.HealthCheck(ctx); err != nil {
		spinner.Fail("Failed to connect to Ollama")
		return fmt.Errorf("ollama connection failed: %w", err)
	}
	
	spinner.UpdateText("Planning project structure...")
	
	// First, get the project plan
	planPrompt := buildPlanPrompt(task)
	
	req := ai.GenerateRequest{
		Prompt:      planPrompt,
		Model:       config.Model,
		Temperature: 0.3,
		MaxTokens:   2000,
	}
	
	planResp, err := client.Generate(ctx, req)
	if err != nil {
		spinner.Fail("Failed to create project plan")
		return fmt.Errorf("planning failed: %w", err)
	}
	
	// Parse the plan
	var plan ProjectPlan
	if err := json.Unmarshal([]byte(planResp.Content), &plan); err != nil {
		// Try to extract JSON from the response
		jsonStart := strings.Index(planResp.Content, "{")
		jsonEnd := strings.LastIndex(planResp.Content, "}")
		if jsonStart >= 0 && jsonEnd > jsonStart {
			jsonStr := planResp.Content[jsonStart : jsonEnd+1]
			if err := json.Unmarshal([]byte(jsonStr), &plan); err != nil {
				spinner.Fail("Failed to parse project plan")
				return fmt.Errorf("could not parse AI response: %w", err)
			}
		} else {
			spinner.Fail("Failed to parse project plan")
			return fmt.Errorf("could not parse AI response: %w", err)
		}
	}
	
	spinner.Success("Project plan created!")
	
	// Display the plan
	displayProjectPlan(&plan)
	
	// Ask for confirmation (unless -y flag is set)
	skipConfirm, _ := cmd.Flags().GetBool("yes")
	if !skipConfirm {
		confirm := false
		prompt := &survey.Confirm{
			Message: "Do you want to create these files?",
			Default: true,
		}
		survey.AskOne(prompt, &confirm)
		
		if !confirm {
			pterm.Info.Println("Operation cancelled.")
			return nil
		}
	}
	
	// Create each file
	pterm.DefaultSection.Println("Creating Files")
	
	successCount := 0
	for _, file := range plan.Files {
		spinner, _ := pterm.DefaultSpinner.Start(fmt.Sprintf("Creating %s...", file.Path))
		
		// Generate file content
		filePrompt := buildFilePrompt(file, plan)
		
		req := ai.GenerateRequest{
			Prompt:      filePrompt,
			Model:       config.Model,
			Temperature: temperature,
			MaxTokens:   3000,
		}
		
		resp, err := client.Generate(ctx, req)
		if err != nil {
			spinner.Fail(fmt.Sprintf("Failed to create %s: %v", file.Path, err))
			continue
		}
		
		// Create directory if needed
		dir := filepath.Dir(file.Path)
		if dir != "." && dir != "" {
			os.MkdirAll(dir, 0755)
		}
		
		// Write file
		if err := os.WriteFile(file.Path, []byte(resp.Content), 0644); err != nil {
			spinner.Fail(fmt.Sprintf("Failed to write %s: %v", file.Path, err))
			continue
		}
		
		spinner.Success(fmt.Sprintf("Created %s", file.Path))
		successCount++
	}
	
	// Summary
	pterm.DefaultSection.Println("Summary")
	pterm.Success.Printf("Successfully created %d/%d files\n", successCount, len(plan.Files))
	
	// Show setup commands if any
	if len(plan.Commands) > 0 {
		pterm.DefaultSection.Println("Next Steps")
		pterm.Info.Println("Run these commands to set up your project:")
		for _, cmd := range plan.Commands {
			fmt.Printf("  %s\n", cmd)
		}
	}
	
	return nil
}

func buildPlanPrompt(task string) string {
	return fmt.Sprintf(`You are an expert software architect. Based on the user's request, create a detailed project plan.

User Request: %s

Create a JSON project plan with this structure:
{
  "project_name": "short project name",
  "description": "brief description",
  "files": [
    {
      "path": "relative/path/to/file.ext",
      "description": "what this file does"
    }
  ],
  "setup_commands": ["npm install", "pip install -r requirements.txt"]
}

Rules:
- Include all necessary files for a complete, working project
- Use appropriate directory structure
- Include configuration files, documentation, and tests as needed
- Keep file paths relative and use forward slashes
- Return ONLY valid JSON, no markdown or explanations

Project plan:`, task)
}

func buildFilePrompt(file FileToCreate, plan ProjectPlan) string {
	ext := strings.TrimPrefix(filepath.Ext(file.Path), ".")
	language := getLanguageFromExt(ext)
	
	return fmt.Sprintf(`You are an expert %s developer. Generate production-ready code for this file.

Project: %s
Description: %s

File: %s
Purpose: %s

Requirements:
- Write complete, functional code
- Include appropriate imports and dependencies
- Follow best practices for %s
- Add helpful comments
- Make it production-ready
- Consider the context of other files in the project
- Return ONLY the file content, no markdown blocks or explanations

File content:`, language, plan.ProjectName, plan.Description, file.Path, file.Description, language)
}

func displayProjectPlan(plan *ProjectPlan) {
	pterm.DefaultSection.Println("Project Plan")
	pterm.Info.Printf("Project: %s\n", plan.ProjectName)
	pterm.Info.Printf("Description: %s\n", plan.Description)
	
	pterm.DefaultSection.Println("Files to Create")
	
	// Group files by directory
	tree := make(map[string][]FileToCreate)
	for _, file := range plan.Files {
		dir := filepath.Dir(file.Path)
		if dir == "." {
			dir = "root"
		}
		tree[dir] = append(tree[dir], file)
	}
	
	// Display as tree
	for dir, files := range tree {
		if dir != "root" {
			pterm.FgGray.Printf("📁 %s/\n", dir)
		}
		for _, file := range files {
			name := filepath.Base(file.Path)
			icon := getFileIcon(name)
			if dir != "root" {
				pterm.FgDefault.Printf("  %s %s - %s\n", icon, name, file.Description)
			} else {
				pterm.FgDefault.Printf("%s %s - %s\n", icon, name, file.Description)
			}
		}
	}
	
	if len(plan.Commands) > 0 {
		pterm.DefaultSection.Println("Setup Commands")
		for _, cmd := range plan.Commands {
			pterm.FgCyan.Printf("$ %s\n", cmd)
		}
	}
}

func getFileIcon(filename string) string {
	ext := strings.ToLower(filepath.Ext(filename))
	
	icons := map[string]string{
		".py":   "🐍",
		".js":   "📜",
		".ts":   "📘",
		".jsx":  "⚛️",
		".tsx":  "⚛️",
		".go":   "🐹",
		".java": "☕",
		".php":  "🐘",
		".rb":   "💎",
		".rs":   "🦀",
		".cpp":  "🔷",
		".c":    "🔷",
		".cs":   "🔷",
		".html": "🌐",
		".css":  "🎨",
		".json": "📋",
		".yaml": "📋",
		".yml":  "📋",
		".xml":  "📋",
		".sql":  "🗃️",
		".md":   "📝",
		".txt":  "📄",
		".sh":   "🖥️",
		".bat":  "🖥️",
	}
	
	if icon, ok := icons[ext]; ok {
		return icon
	}
	
	// Special files
	switch strings.ToLower(filename) {
	case "dockerfile":
		return "🐳"
	case "makefile":
		return "🔧"
	case ".gitignore":
		return "🚫"
	case "readme.md", "readme.txt":
		return "📖"
	case "package.json":
		return "📦"
	case "requirements.txt":
		return "📦"
	case "go.mod":
		return "📦"
	default:
		return "📄"
	}
}