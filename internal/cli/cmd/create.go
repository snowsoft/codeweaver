package cmd

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"sync"
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

type FileResult struct {
	Path    string
	Success bool
	Error   error
}

var (
	parallel     int
	noStream     bool
	skipConfirm  bool
)

func init() {
	CreateCmd.Flags().StringVar(&provider, "provider", "ollama", "AI provider")
	CreateCmd.Flags().StringVar(&model, "model", "", "Specific model to use")
	CreateCmd.Flags().Float64Var(&temperature, "temperature", 0.7, "Generation temperature")
	CreateCmd.Flags().BoolVarP(&skipConfirm, "yes", "y", false, "Skip confirmation prompts")
	CreateCmd.Flags().IntVarP(&parallel, "parallel", "p", 3, "Number of files to generate in parallel")
	CreateCmd.Flags().BoolVar(&noStream, "no-stream", false, "Disable streaming output")
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
	
	// Create each file with parallel processing
	pterm.DefaultSection.Println("Creating Files")
	
	// Progress bar
	progressbar, _ := pterm.DefaultProgressbar.
		WithTotal(len(plan.Files)).
		WithTitle("Creating files").
		WithShowElapsedTime().
		Start()
	
	// Create channels for work distribution
	jobs := make(chan FileToCreate, len(plan.Files))
	results := make(chan FileResult, len(plan.Files))
	
	// Start workers
	var wg sync.WaitGroup
	for w := 0; w < parallel; w++ {
		wg.Add(1)
		go fileWorker(w, client, config, plan, jobs, results, &wg, progressbar)
	}
	
	// Send jobs
	for _, file := range plan.Files {
		jobs <- file
	}
	close(jobs)
	
	// Wait for all workers to complete
	go func() {
		wg.Wait()
		close(results)
	}()
	
	// Collect results
	successCount := 0
	var failures []FileResult
	
	for result := range results {
		if result.Success {
			successCount++
		} else {
			failures = append(failures, result)
		}
	}
	
	progressbar.Stop()
	
	// Summary
	pterm.DefaultSection.Println("Summary")
	pterm.Success.Printf("Successfully created %d/%d files\n", successCount, len(plan.Files))
	
	// Show failures if any
	if len(failures) > 0 {
		pterm.Warning.Println("\nFailed files:")
		for _, fail := range failures {
			pterm.Error.Printf("  • %s: %v\n", fail.Path, fail.Error)
		}
	}
	
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

func fileWorker(id int, client *ollama.Client, config ai.Config, plan ProjectPlan,
	jobs <-chan FileToCreate, results chan<- FileResult, wg *sync.WaitGroup, 
	progressbar *pterm.ProgressbarPrinter) {
	
	defer wg.Done()
	ctx := context.Background()
	
	for file := range jobs {
		// Update progress bar title
		progressbar.UpdateTitle(fmt.Sprintf("Worker %d: Creating %s", id+1, file.Path))
		
		// Generate file content
		filePrompt := buildFilePrompt(file, plan)
		
		req := ai.GenerateRequest{
			Prompt:      filePrompt,
			Model:       config.Model,
			Temperature: temperature,
			MaxTokens:   3000,
		}
		
		// Generate content
		var content string
		var err error
		
		if !noStream && id == 0 { // Only first worker streams to avoid confusion
			// Show which file is being streamed
			pterm.FgCyan.Printf("\n[Streaming] %s:\n", file.Path)
			
			streamCh, err := client.GenerateStream(ctx, req)
			if err == nil {
				var fullContent strings.Builder
				for chunk := range streamCh {
					if chunk.Error != nil {
						err = chunk.Error
						break
					}
					fmt.Print(chunk.Content)
					fullContent.WriteString(chunk.Content)
				}
				content = fullContent.String()
				fmt.Println() // New line after streaming
			}
		} else {
			// Non-streaming generation for other workers
			resp, genErr := client.Generate(ctx, req)
			if genErr == nil {
				content = resp.Content
			} else {
				err = genErr
			}
		}
		
		if err != nil {
			results <- FileResult{
				Path:    file.Path,
				Success: false,
				Error:   err,
			}
			progressbar.Increment()
			continue
		}
		
		// Create directory if needed
		dir := filepath.Dir(file.Path)
		if dir != "." && dir != "" {
			os.MkdirAll(dir, 0755)
		}
		
		// Write file
		if err := os.WriteFile(file.Path, []byte(content), 0644); err != nil {
			results <- FileResult{
				Path:    file.Path,
				Success: false,
				Error:   err,
			}
		} else {
			results <- FileResult{
				Path:    file.Path,
				Success: true,
				Error:   nil,
			}
		}
		
		progressbar.Increment()
	}
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
		".ps1":  "💻",
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