package cmd

import (
    "fmt"
    "os"
    "path/filepath"
    
    "github.com/pterm/pterm"
    "github.com/spf13/cobra"
    "github.com/snowsoft/codeweaver/internal/ollama"
    "github.com/snowsoft/codeweaver/internal/ui"
    "github.com/snowsoft/codeweaver/internal/utils"
)

var (
    newTask        string
    newContextFile string
)

// newCmd represents the new command
var newCmd = &cobra.Command{
    Use:   "new <file_name>",
    Short: "Generate new code from scratch",
    Long: `Generate new code based on a task description. 
    
The generated code will be shown for review before saving to the specified file.`,
    Args: cobra.ExactArgs(1),
    RunE: runNew,
}

func init() {
    rootCmd.AddCommand(newCmd)
    
    newCmd.Flags().StringVarP(&newTask, "task", "t", "", "Task description for code generation (required)")
    newCmd.Flags().StringVarP(&newContextFile, "context-file", "c", "", "Context file to reference during generation")
    if err := newCmd.MarkFlagRequired("task"); err != nil {
        fmt.Fprintf(os.Stderr, "Error marking flag as required: %v\n", err)
    }
}

func runNew(cmd *cobra.Command, args []string) error {
    fileName := args[0]
    
    // Create spinner
    spinner, _ := pterm.DefaultSpinner.Start("Generating code...")
    
    // Initialize Ollama client
    client := ollama.NewClient(cfg.Ollama.APIURL, cfg.Ollama.Model, cfg.Ollama.Temperature)
    
    // Prepare context
    var context string
    if newContextFile != "" {
        contextContent, err := utils.ReadFile(newContextFile)
        if err != nil {
            spinner.Fail(fmt.Sprintf("Failed to read context file: %v", err))
            return err
        }
        context = fmt.Sprintf("Reference file (%s):\n%s\n\n", newContextFile, contextContent)
    }
    
    // Detect language from file extension
    language := utils.DetectLanguage(fileName)
    
    // Build prompt
    prompt := buildNewPrompt(newTask, language, context)
    
    // Generate code
    generatedCode, err := client.Generate(cmd.Context(), prompt)
    if err != nil {
        spinner.Fail(fmt.Sprintf("Failed to generate code: %v", err))
        return err
    }
    
    spinner.Success("Code generated successfully!")
    
    // Display generated code
    pterm.DefaultHeader.Println("Generated Code")
    pterm.DefaultBox.Println(generatedCode)
    
    // Ask for confirmation
    if !ui.ConfirmAction("Save this code to " + fileName + "?") {
        pterm.Warning.Println("Code generation cancelled.")
        return nil
    }
    
    // Check if file exists
    if utils.FileExists(fileName) {
        if !ui.ConfirmAction(fmt.Sprintf("File %s already exists. Overwrite?", fileName)) {
            pterm.Warning.Println("Operation cancelled.")
            return nil
        }
    }
    
    // Create directory if needed
    dir := filepath.Dir(fileName)
    if dir != "." && dir != "" {
        if err := os.MkdirAll(dir, 0755); err != nil {
            return fmt.Errorf("failed to create directory: %w", err)
        }
    }
    
    // Save file
    if err := utils.WriteFile(fileName, generatedCode); err != nil {
        return fmt.Errorf("failed to write file: %w", err)
    }
    
    pterm.Success.Printf("Code saved to %s\n", fileName)
    return nil
}

func buildNewPrompt(task, language, context string) string {
    prompt := fmt.Sprintf(`You are an expert %s developer. Generate clean, idiomatic, and well-documented code based on the following task.

Task: %s

Requirements:
1. Write production-ready code
2. Follow %s best practices and conventions
3. Include appropriate comments
4. Handle errors properly
5. Make the code modular and maintainable

`, language, task, language)
    
    if context != "" {
        prompt += fmt.Sprintf("Context:\n%s\n", context)
    }
    
    prompt += fmt.Sprintf(`
Generate only the code for the file, without any explanations or markdown formatting.
The code should be ready to save directly to a %s file.`, language)
    
    return prompt
}