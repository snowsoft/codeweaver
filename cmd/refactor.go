package cmd

import (
    "fmt"
    "os"
    "path/filepath"
    
    "github.com/pterm/pterm"
    "github.com/spf13/cobra"
    "github.com/snowsoft/codeweaver/internal/diff"
    "github.com/snowsoft/codeweaver/internal/ollama"
    "github.com/snowsoft/codeweaver/internal/ui"
    "github.com/snowsoft/codeweaver/internal/utils"
)

var (
    refactorTask       string
    refactorContextDir string
)

// refactorCmd represents the refactor command
var refactorCmd = &cobra.Command{
    Use:   "refactor <file_name>",
    Short: "Refactor existing code",
    Long: `Refactor existing code based on a task description.
    
The tool will show a diff of the proposed changes and ask for confirmation
before applying them to the file.`,
    Args: cobra.ExactArgs(1),
    RunE: runRefactor,
}

func init() {
    rootCmd.AddCommand(refactorCmd)
    
    refactorCmd.Flags().StringVarP(&refactorTask, "task", "t", "", "Refactoring task description (required)")
    refactorCmd.Flags().StringVarP(&refactorContextDir, "context-dir", "c", "", "Context directory for project structure")
    if err := refactorCmd.MarkFlagRequired("task"); err != nil {
        fmt.Fprintf(os.Stderr, "Error marking flag as required: %v\n", err)
    }
}

func runRefactor(cmd *cobra.Command, args []string) error {
    fileName := args[0]
    
    // Check if file exists
    if !utils.FileExists(fileName) {
        return fmt.Errorf("file %s does not exist", fileName)
    }
    
    // Create spinner
    spinner, err := pterm.DefaultSpinner.Start("Analyzing code...")
    if err != nil {
        // Continue without spinner
        pterm.Warning.Println("Failed to start spinner")
    }
    
    // Read original file
    originalCode, err := utils.ReadFile(fileName)
    if err != nil {
        spinner.Fail(fmt.Sprintf("Failed to read file: %v", err))
        return err
    }
    
    // Get project context if specified
    var projectContext string
    if refactorContextDir != "" {
        tree, err := utils.GetDirectoryTree(refactorContextDir, 3)
        if err != nil {
            spinner.Warning(fmt.Sprintf("Failed to read context directory: %v", err))
        } else {
            projectContext = fmt.Sprintf("Project structure:\n%s\n", tree)
        }
    }
    
    spinner.UpdateText("Refactoring code...")
    
    // Initialize Ollama client
    client := ollama.NewClient(cfg.Ollama.APIURL, cfg.Ollama.Model, cfg.Ollama.Temperature)
    
    // Detect language
    language := utils.DetectLanguage(fileName)
    
    // Build prompt
    prompt := buildRefactorPrompt(refactorTask, language, originalCode, projectContext)
    
    // Generate refactored code
    refactoredCode, err := client.Generate(cmd.Context(), prompt)
    if err != nil {
        spinner.Fail(fmt.Sprintf("Failed to refactor code: %v", err))
        return err
    }
    
    spinner.Success("Code refactored successfully!")
    
    // Show diff
    diffViewer := diff.NewViewer()
    diffOutput := diffViewer.GenerateDiff(originalCode, refactoredCode, fileName)
    
    pterm.DefaultHeader.Println("Proposed Changes")
    fmt.Println(diffOutput)
    
    // Interactive confirmation
    action := ui.AskForAction()
    
    switch action {
    case ui.ActionAccept:
        // Create backup if configured
        if cfg.Defaults.AutoBackup {
            backupPath := filepath.Join(cfg.Defaults.BackupDir, fileName+".backup")
            if err := utils.CreateBackup(fileName, backupPath); err != nil {
                pterm.Warning.Printf("Failed to create backup: %v\n", err)
            } else {
                pterm.Info.Printf("Backup created: %s\n", backupPath)
            }
        }
        
        // Apply changes
        if err := utils.WriteFile(fileName, refactoredCode); err != nil {
            return fmt.Errorf("failed to write file: %w", err)
        }
        pterm.Success.Printf("Changes applied to %s\n", fileName)
        
    case ui.ActionDecline:
        pterm.Warning.Println("Refactoring cancelled.")
        
    case ui.ActionEdit:
        // Open editor for manual editing
        editedCode, err := ui.OpenEditor(refactoredCode)
        if err != nil {
            return fmt.Errorf("failed to open editor: %w", err)
        }
        
        // Show diff again with edited code
        diffOutput = diffViewer.GenerateDiff(originalCode, editedCode, fileName)
        fmt.Println(diffOutput)
        
        if ui.ConfirmAction("Apply edited changes?") {
            if err := utils.WriteFile(fileName, editedCode); err != nil {
                return fmt.Errorf("failed to write file: %w", err)
            }
            pterm.Success.Printf("Edited changes applied to %s\n", fileName)
        } else {
            pterm.Warning.Println("Edit cancelled.")
        }
    }
    
    return nil
}

func buildRefactorPrompt(task, language, code, context string) string {
    prompt := fmt.Sprintf(`You are an expert %s developer. Refactor the following code based on the given task.

Task: %s

Current code:
%s

Requirements:
1. Maintain the same functionality unless the task explicitly requires changes
2. Follow %s best practices and conventions
3. Improve code quality, readability, and maintainability
4. Preserve existing comments unless they need updating
5. Ensure the refactored code is production-ready

`, language, task, code, language)
    
    if context != "" {
        prompt += fmt.Sprintf("Project context:\n%s\n", context)
    }
    
    prompt += `
Generate only the refactored code, without any explanations or markdown formatting.
The output should be the complete file content after refactoring.`
    
    return prompt
}