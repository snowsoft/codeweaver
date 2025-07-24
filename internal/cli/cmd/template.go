package cmd

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/AlecAivazis/survey/v2"
	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
	"github.com/snowsoft/codeweaver/internal/cli/templates"
)

// TemplateCmd represents the template command
var TemplateCmd = &cobra.Command{
	Use:   "template",
	Short: "Manage and use project templates",
	Long:  `Create projects from predefined templates or save your own templates for reuse.`,
}

// Template subcommands
var (
	templateListCmd = &cobra.Command{
		Use:   "list",
		Short: "List available templates",
		RunE:  runTemplateList,
	}

	templateUseCmd = &cobra.Command{
		Use:   "use <template-name> [project-name]",
		Short: "Create a project from a template",
		Args:  cobra.RangeArgs(1, 2),
		RunE:  runTemplateUse,
	}

	templateSaveCmd = &cobra.Command{
		Use:   "save <name> <directory>",
		Short: "Save a directory as a template",
		Args:  cobra.ExactArgs(2),
		RunE:  runTemplateSave,
	}
)

func init() {
	TemplateCmd.AddCommand(templateListCmd)
	TemplateCmd.AddCommand(templateUseCmd)
	TemplateCmd.AddCommand(templateSaveCmd)
}

func runTemplateList(cmd *cobra.Command, args []string) error {
	pterm.DefaultHeader.Println("Available Templates")
	
	// Get all categories
	categories := templates.GetCategories()
	
	// Display by category
	for _, category := range categories {
		categoryTemplates := templates.GetTemplatesByCategory(category)
		if len(categoryTemplates) > 0 {
			pterm.DefaultSection.Printf("%s Templates\n", category)
			for _, tmpl := range categoryTemplates {
				pterm.Info.Printf("  • %s - %s\n", tmpl.Name, tmpl.Description)
			}
		}
	}
	
	// Check for custom templates
	customDir := getTemplateDir()
	if entries, err := os.ReadDir(customDir); err == nil && len(entries) > 0 {
		pterm.DefaultSection.Println("Custom Templates")
		for _, entry := range entries {
			if entry.IsDir() {
				pterm.Info.Printf("  • %s (custom)\n", entry.Name())
			}
		}
	}
	
	pterm.DefaultSection.Println("Usage")
	pterm.Info.Println("Use 'weaver template use <template-name> [project-name]' to create a project")
	
	return nil
}

func runTemplateUse(cmd *cobra.Command, args []string) error {
	templateName := args[0]
	projectName := templateName
	if len(args) > 1 {
		projectName = args[1]
	}
	
	// Check if template exists
	template, exists := templates.GetTemplate(templateName)
	if !exists {
		// Try custom templates
		customPath := filepath.Join(getTemplateDir(), templateName)
		if _, err := os.Stat(customPath); err != nil {
			return fmt.Errorf("template '%s' not found", templateName)
		}
		// Load custom template
		return loadAndUseCustomTemplate(templateName, projectName)
	}
	
	pterm.DefaultHeader.Printf("Creating project from template: %s\n", templateName)
	
	// Collect variable values
	values := make(map[string]string)
	values["PROJECT_NAME"] = projectName
	
	for _, variable := range template.Variables {
		if variable.Name == "PROJECT_NAME" {
			continue
		}
		
		var value string
		prompt := &survey.Input{
			Message: variable.Description,
			Default: variable.Default,
		}
		survey.AskOne(prompt, &value)
		
		if value == "" && variable.Required {
			return fmt.Errorf("variable %s is required", variable.Name)
		}
		if value == "" {
			value = variable.Default
		}
		values[variable.Name] = value
	}
	
	// Create project directory
	if err := os.MkdirAll(projectName, 0755); err != nil {
		return fmt.Errorf("failed to create project directory: %w", err)
	}
	
	// Create files
	pterm.DefaultSection.Println("Creating Files")
	
	progressbar, _ := pterm.DefaultProgressbar.
		WithTotal(len(template.Files)).
		WithTitle("Creating files").
		Start()
	
	successCount := 0
	
	for path, content := range template.Files {
		progressbar.UpdateTitle(fmt.Sprintf("Creating %s", path))
		
		fullPath := filepath.Join(projectName, path)
		
		// Replace variables in path
		for key, value := range values {
			fullPath = strings.ReplaceAll(fullPath, "{{"+key+"}}", value)
		}
		
		// Replace variables in content
		processedContent := content
		for key, value := range values {
			processedContent = strings.ReplaceAll(processedContent, "{{"+key+"}}", value)
		}
		
		// Create directory if needed
		dir := filepath.Dir(fullPath)
		if err := os.MkdirAll(dir, 0755); err != nil {
			pterm.Error.Printf("Failed to create directory %s: %v\n", dir, err)
			progressbar.Increment()
			continue
		}
		
		// Write file
		if err := os.WriteFile(fullPath, []byte(processedContent), 0644); err != nil {
			pterm.Error.Printf("Failed to create %s: %v\n", path, err)
			progressbar.Increment()
			continue
		}
		
		successCount++
		progressbar.Increment()
	}
	
	progressbar.Stop()
	
	pterm.DefaultSection.Println("Summary")
	pterm.Success.Printf("Successfully created %d/%d files\n", successCount, len(template.Files))
	
	// Show setup commands
	if len(template.Commands) > 0 {
		pterm.DefaultSection.Println("Next Steps")
		pterm.Info.Printf("cd %s\n", projectName)
		for _, cmd := range template.Commands {
			// Replace variables in commands
			processedCmd := cmd
			for key, value := range values {
				processedCmd = strings.ReplaceAll(processedCmd, "{{"+key+"}}", value)
			}
			pterm.Info.Println(processedCmd)
		}
	}
	
	return nil
}

func runTemplateSave(cmd *cobra.Command, args []string) error {
	name := args[0]
	sourceDir := args[1]
	
	// Validate source directory
	if _, err := os.Stat(sourceDir); err != nil {
		return fmt.Errorf("source directory does not exist: %w", err)
	}
	
	pterm.DefaultHeader.Printf("Saving template: %s\n", name)
	
	// Collect template metadata
	var description string
	prompt := &survey.Input{
		Message: "Template description:",
	}
	survey.AskOne(prompt, &description)
	
	var category string
	prompt2 := &survey.Select{
		Message: "Category:",
		Options: []string{"Frontend", "Backend", "CLI", "Library", "Other"},
	}
	survey.AskOne(prompt2, &category)
	
	// Create template directory
	templateDir := filepath.Join(getTemplateDir(), name)
	if err := os.MkdirAll(templateDir, 0755); err != nil {
		return fmt.Errorf("failed to create template directory: %w", err)
	}
	
	// Save template metadata
	metadata := map[string]interface{}{
		"name":        name,
		"description": description,
		"category":    category,
		"created":     time.Now().Format(time.RFC3339),
	}
	
	metadataFile := filepath.Join(templateDir, "template.json")
	metadataJSON, _ := json.MarshalIndent(metadata, "", "  ")
	if err := os.WriteFile(metadataFile, metadataJSON, 0644); err != nil {
		return fmt.Errorf("failed to save template metadata: %w", err)
	}
	
	// Copy files
	spinner, _ := pterm.DefaultSpinner.Start("Copying files...")
	
	fileCount := 0
	err := filepath.Walk(sourceDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		
		// Skip hidden files and directories
		if strings.HasPrefix(info.Name(), ".") && info.Name() != ".gitignore" {
			if info.IsDir() {
				return filepath.SkipDir
			}
			return nil
		}
		
		// Skip common ignore patterns
		if info.IsDir() && (info.Name() == "node_modules" || info.Name() == "vendor" || info.Name() == "dist" || info.Name() == "build") {
			return filepath.SkipDir
		}
		
		if !info.IsDir() {
			relPath, _ := filepath.Rel(sourceDir, path)
			destPath := filepath.Join(templateDir, "files", relPath)
			
			// Create directory
			os.MkdirAll(filepath.Dir(destPath), 0755)
			
			// Copy file
			content, err := os.ReadFile(path)
			if err != nil {
				return err
			}
			
			if err := os.WriteFile(destPath, content, info.Mode()); err != nil {
				return err
			}
			
			fileCount++
		}
		
		return nil
	})
	
	if err != nil {
		spinner.Fail("Failed to copy files")
		return err
	}
	
	spinner.Success(fmt.Sprintf("Copied %d files", fileCount))
	
	pterm.Success.Printf("Template '%s' saved successfully!\n", name)
	pterm.Info.Printf("Location: %s\n", templateDir)
	
	return nil
}

func getTemplateDir() string {
	home, _ := os.UserHomeDir()
	return filepath.Join(home, ".config", "weaver", "templates")
}

func loadAndUseCustomTemplate(templateName, projectName string) error {
	templateDir := filepath.Join(getTemplateDir(), templateName)
	
	// Load metadata
	metadataFile := filepath.Join(templateDir, "template.json")
	metadataBytes, err := os.ReadFile(metadataFile)
	if err != nil {
		return fmt.Errorf("failed to load template metadata: %w", err)
	}
	
	var metadata map[string]interface{}
	if err := json.Unmarshal(metadataBytes, &metadata); err != nil {
		return fmt.Errorf("failed to parse template metadata: %w", err)
	}
	
	pterm.DefaultHeader.Printf("Creating project from custom template: %s\n", templateName)
	
	// Create project directory
	if err := os.MkdirAll(projectName, 0755); err != nil {
		return fmt.Errorf("failed to create project directory: %w", err)
	}
	
	// Copy files
	filesDir := filepath.Join(templateDir, "files")
	
	spinner, _ := pterm.DefaultSpinner.Start("Copying template files...")
	
	fileCount := 0
	err = filepath.Walk(filesDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		
		if !info.IsDir() {
			relPath, _ := filepath.Rel(filesDir, path)
			destPath := filepath.Join(projectName, relPath)
			
			// Create directory
			os.MkdirAll(filepath.Dir(destPath), 0755)
			
			// Copy file
			content, err := os.ReadFile(path)
			if err != nil {
				return err
			}
			
			// Simple variable replacement
			processedContent := string(content)
			processedContent = strings.ReplaceAll(processedContent, "{{PROJECT_NAME}}", projectName)
			
			if err := os.WriteFile(destPath, []byte(processedContent), info.Mode()); err != nil {
				return err
			}
			
			fileCount++
		}
		
		return nil
	})
	
	if err != nil {
		spinner.Fail("Failed to copy files")
		return err
	}
	
	spinner.Success(fmt.Sprintf("Created %d files", fileCount))
	
	pterm.Success.Printf("Project '%s' created successfully!\n", projectName)
	
	return nil
}