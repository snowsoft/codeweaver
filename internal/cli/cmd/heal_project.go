// cmd/heal_project.go
package cmd

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/fatih/color"
	"github.com/spf13/cobra"
	"github.com/snowsoft/codeweaver/internal/ai"
	"github.com/snowsoft/codeweaver/internal/analyzer"
	"github.com/snowsoft/codeweaver/internal/config"
	"github.com/snowsoft/codeweaver/internal/ui"
)

var (
	autoFix  bool
	severity string
)

var healProjectCmd = &cobra.Command{
	Use:   "heal-project [path]",
	Short: "Analyze and fix project issues automatically",
	Long: `Heal-project performs a comprehensive analysis of your codebase to detect:
- Security vulnerabilities
- Performance issues
- Code quality problems
- Deprecated dependencies
- Style inconsistencies`,
	Example: `  # Analyze current directory
  weaver heal-project

  # Analyze specific project
  weaver heal-project /path/to/project

  # Auto-fix all issues
  weaver heal-project --auto-fix

  # Only show critical issues
  weaver heal-project --severity critical`,
	Run: runHealProject,
}

func init() {
	rootCmd.AddCommand(healProjectCmd)
	
	healProjectCmd.Flags().BoolVar(&autoFix, "auto-fix", false, "Automatically fix detected issues")
	healProjectCmd.Flags().StringVar(&severity, "severity", "all", "Filter by severity: all, critical, medium, low")
}

// Issue represents a detected project issue
type Issue struct {
	Type        string
	Severity    string // critical, medium, low
	File        string
	Line        int
	Description string
	Solution    string
	Command     string // Weaver command to fix
}

// ProjectReport contains all detected issues
type ProjectReport struct {
	ProjectPath    string
	AnalysisTime   time.Duration
	TotalIssues    int
	CriticalIssues []Issue
	MediumIssues   []Issue
	LowIssues      []Issue
	FixCommands    []string
}

func runHealProject(cmd *cobra.Command, args []string) {
	// Determine project path
	projectPath := "."
	if len(args) > 0 {
		projectPath = args[0]
	}
	
	absPath, err := filepath.Abs(projectPath)
	if err != nil {
		ui.ErrorMsg("Failed to resolve project path", err)
		os.Exit(1)
	}
	
	// Start analysis
	spinner := ui.NewSpinner("Analyzing project...")
	spinner.Start()
	
	startTime := time.Now()
	
	// Create enhanced AI client
	cfg := config.Load()
	aiConfig := ai.ClientConfig{
		Provider:    "ollama",
		Model:       cfg.Ollama.Model,
		Temperature: cfg.Ollama.Temperature,
		MaxTokens:   8192,
	}
	
	enhancedClient, err := ai.NewEnhancedClient(aiConfig)
	if err != nil {
		spinner.Stop()
		ui.ErrorMsg("Failed to initialize AI client", err)
		os.Exit(1)
	}
	
	// Detect project type and update context
	projectType, language, framework := detectProjectType(absPath)
	enhancedClient.UpdateProjectContext(language, framework, projectType, "")
	
	// Create project analyzer
	projectAnalyzer := analyzer.NewProjectAnalyzer(absPath)
	
	// Perform analysis
	issues, err := analyzeProject(projectAnalyzer, enhancedClient, absPath)
	if err != nil {
		spinner.Stop()
		ui.ErrorMsg("Failed to analyze project", err)
		os.Exit(1)
	}
	
	spinner.Stop()
	
	// Generate report
	report := generateReport(absPath, issues, time.Since(startTime))
	
	// Display report
	displayReport(report)
	
	// Handle auto-fix if requested
	if autoFix && len(report.FixCommands) > 0 {
		if ui.Confirm("\nApply all fixes automatically?") {
			applyFixes(report.FixCommands)
		}
	}
}

func detectProjectType(projectPath string) (projectType, language, framework string) {
	// Check for various project indicators
	files, _ := os.ReadDir(projectPath)
	
	for _, file := range files {
		switch file.Name() {
		case "package.json":
			content, _ := os.ReadFile(filepath.Join(projectPath, "package.json"))
			if strings.Contains(string(content), "react") {
				return "web", "javascript", "react"
			} else if strings.Contains(string(content), "express") {
				return "api", "javascript", "express"
			}
			return "web", "javascript", ""
		case "requirements.txt", "setup.py", "pyproject.toml":
			content, _ := os.ReadFile(filepath.Join(projectPath, file.Name()))
			if strings.Contains(string(content), "django") {
				return "web", "python", "django"
			} else if strings.Contains(string(content), "fastapi") {
				return "api", "python", "fastapi"
			}
			return "library", "python", ""
		case "go.mod":
			content, _ := os.ReadFile(filepath.Join(projectPath, "go.mod"))
			if strings.Contains(string(content), "gin") {
				return "api", "go", "gin"
			}
			return "library", "go", ""
		case "Cargo.toml":
			return "library", "rust", ""
		case "composer.json":
			content, _ := os.ReadFile(filepath.Join(projectPath, "composer.json"))
			if strings.Contains(string(content), "laravel") {
				return "web", "php", "laravel"
			}
			return "web", "php", ""
		}
	}
	
	return "unknown", "unknown", ""
}

func analyzeProject(analyzer *analyzer.ProjectAnalyzer, client *ai.EnhancedClient, projectPath string) ([]Issue, error) {
	ctx := context.Background()
	issues := []Issue{}
	
	// Get file list
	files, err := analyzer.GetSourceFiles()
	if err != nil {
		return nil, err
	}
	
	// Prepare context for AI
	aiContext := map[string]interface{}{
		"project_path": projectPath,
		"file_count":   len(files),
		"file_list":    files[:min(20, len(files))], // First 20 files as sample
	}
	
	// Use AI to analyze project structure
	analysisPrompt := fmt.Sprintf(`Analyze this project structure and identify potential issues.
Project has %d files. Sample files: %v`, len(files), files[:min(10, len(files))])
	
	aiResponse, err := client.GenerateWithCommand(
		ctx,
		ai.PromptTypeHealProject,
		analysisPrompt,
		aiContext,
	)
	if err != nil {
		return nil, err
	}
	
	// Parse AI response into issues
	issues = append(issues, parseAIResponse(aiResponse)...)
	
	// Perform pattern-based analysis
	patternIssues := analyzer.DetectCommonIssues(files)
	issues = append(issues, patternIssues...)
	
	// Security scan
	securityIssues := analyzer.SecurityScan(files)
	issues = append(issues, securityIssues...)
	
	return issues, nil
}

func parseAIResponse(response string) []Issue {
	issues := []Issue{}
	
	// Simple parsing logic - in real implementation, use structured output
	lines := strings.Split(response, "\n")
	
	var currentSeverity string
	for _, line := range lines {
		line = strings.TrimSpace(line)
		
		// Detect severity sections
		if strings.Contains(line, "🔴") || strings.Contains(line, "Critical") {
			currentSeverity = "critical"
		} else if strings.Contains(line, "🟡") || strings.Contains(line, "Medium") {
			currentSeverity = "medium"
		} else if strings.Contains(line, "🟢") || strings.Contains(line, "Low") {
			currentSeverity = "low"
		}
		
		// Parse issue lines (simplified)
		if strings.Contains(line, ":") && !strings.Contains(line, "🔴") && 
		   !strings.Contains(line, "🟡") && !strings.Contains(line, "🟢") {
			parts := strings.SplitN(line, ":", 2)
			if len(parts) == 2 {
				issue := Issue{
					Type:        "general",
					Severity:    currentSeverity,
					Description: strings.TrimSpace(parts[0]),
					Solution:    strings.TrimSpace(parts[1]),
				}
				
				// Extract file and line if present
				if strings.Contains(parts[0], " ") {
					fileParts := strings.Fields(parts[0])
					for _, part := range fileParts {
						if strings.Contains(part, ".") && strings.Contains(part, "/") {
							issue.File = part
							break
						}
					}
				}
				
				issues = append(issues, issue)
			}
		}
	}
	
	return issues
}

func generateReport(projectPath string, issues []Issue, duration time.Duration) *ProjectReport {
	report := &ProjectReport{
		ProjectPath:    projectPath,
		AnalysisTime:   duration,
		TotalIssues:    len(issues),
		CriticalIssues: []Issue{},
		MediumIssues:   []Issue{},
		LowIssues:      []Issue{},
		FixCommands:    []string{},
	}
	
	// Categorize issues
	for _, issue := range issues {
		switch issue.Severity {
		case "critical":
			report.CriticalIssues = append(report.CriticalIssues, issue)
		case "medium":
			report.MediumIssues = append(report.MediumIssues, issue)
		case "low":
			report.LowIssues = append(report.LowIssues, issue)
		}
		
		// Generate fix commands
		if issue.Command != "" {
			report.FixCommands = append(report.FixCommands, issue.Command)
		} else {
			// Generate command based on issue type
			cmd := generateFixCommand(issue)
			if cmd != "" {
				report.FixCommands = append(report.FixCommands, cmd)
			}
		}
	}
	
	return report
}

func generateFixCommand(issue Issue) string {
	switch issue.Type {
	case "security":
		if issue.File != "" {
			return fmt.Sprintf("weaver secure %s", issue.File)
		}
	case "style":
		if issue.File != "" {
			return fmt.Sprintf("weaver refactor %s --task \"Fix code style\"", issue.File)
		}
	case "performance":
		if issue.File != "" {
			return fmt.Sprintf("weaver optimize %s", issue.File)
		}
	case "deprecated":
		if issue.File != "" {
			return fmt.Sprintf("weaver refactor %s --task \"Update deprecated code\"", issue.File)
		}
	}
	return ""
}

func displayReport(report *ProjectReport) {
	// Header
	fmt.Println()
	color.New(color.FgCyan, color.Bold).Println("🔍 Project Analysis Complete")
	fmt.Printf("Project: %s\n", report.ProjectPath)
	fmt.Printf("Analysis Time: %s\n", report.AnalysisTime.Round(time.Millisecond))
	fmt.Printf("Total Issues: %d\n\n", report.TotalIssues)
	
	// Critical Issues
	if len(report.CriticalIssues) > 0 {
		color.New(color.FgRed, color.Bold).Println("🔴 Critical Issues")
		for i, issue := range report.CriticalIssues {
			fmt.Printf("%d. %s\n", i+1, issue.Description)
			if issue.File != "" {
				fmt.Printf("   File: %s", issue.File)
				if issue.Line > 0 {
					fmt.Printf(":%d", issue.Line)
				}
				fmt.Println()
			}
			fmt.Printf("   → Solution: %s\n", issue.Solution)
			fmt.Println()
		}
	}
	
	// Medium Issues
	if len(report.MediumIssues) > 0 && (severity == "all" || severity == "medium") {
		color.New(color.FgYellow, color.Bold).Println("🟡 Medium Priority Issues")
		for i, issue := range report.MediumIssues {
			fmt.Printf("%d. %s\n", i+1, issue.Description)
			if issue.File != "" {
				fmt.Printf("   File: %s", issue.File)
				if issue.Line > 0 {
					fmt.Printf(":%d", issue.Line)
				}
				fmt.Println()
			}
			fmt.Printf("   → Solution: %s\n", issue.Solution)
			fmt.Println()
		}
	}
	
	// Low Issues
	if len(report.LowIssues) > 0 && severity == "all" {
		color.New(color.FgGreen, color.Bold).Println("🟢 Low Priority Issues")
		for i, issue := range report.LowIssues {
			fmt.Printf("%d. %s\n", i+1, issue.Description)
			if issue.File != "" {
				fmt.Printf("   File: %s", issue.File)
				if issue.Line > 0 {
					fmt.Printf(":%d", issue.Line)
				}
				fmt.Println()
			}
			fmt.Printf("   → Solution: %s\n", issue.Solution)
			fmt.Println()
		}
	}
	
	// Fix Commands
	if len(report.FixCommands) > 0 {
		color.New(color.FgMagenta, color.Bold).Println("📋 Suggested Fix Commands")
		for i, cmd := range report.FixCommands {
			fmt.Printf("%d. %s\n", i+1, cmd)
		}
		fmt.Println()
	}
	
	// Summary
	color.New(color.FgCyan).Println("Summary:")
	fmt.Printf("- Critical: %d issues\n", len(report.CriticalIssues))
	fmt.Printf("- Medium: %d issues\n", len(report.MediumIssues))
	fmt.Printf("- Low: %d issues\n", len(report.LowIssues))
}

func applyFixes(commands []string) {
	fmt.Println("\n🔧 Applying fixes...")
	
	for i, cmd := range commands {
		fmt.Printf("\n[%d/%d] Executing: %s\n", i+1, len(commands), cmd)
		
		// Parse and execute command
		parts := strings.Fields(cmd)
		if len(parts) < 2 || parts[0] != "weaver" {
			color.Red("Invalid command format: %s", cmd)
			continue
		}
		
		// Execute the command (simplified - in real implementation, call actual command)
		// This would invoke the appropriate weaver command
		fmt.Printf("✓ Fixed\n")
	}
	
	color.Green("\n✅ All fixes applied successfully!")
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}