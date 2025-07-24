package cmd

import (
    "fmt"
    "path/filepath"
    "strings"
    "time"
    
    "github.com/pterm/pterm"
    "github.com/spf13/cobra"
    "github.com/snowsoft/codeweaver/internal/ollama"
    "github.com/snowsoft/codeweaver/internal/ui"
    "github.com/snowsoft/codeweaver/internal/utils"
)

var reviewTask string

// reviewCmd represents the review command
var reviewCmd = &cobra.Command{
    Use:   "review <file_name>",
    Short: "Review code for issues and improvements",
    Long: `Perform a comprehensive code review, checking for bugs, security issues,
performance problems, and adherence to best practices.
    
The review will provide detailed feedback without modifying the original file.`,
    Args: cobra.ExactArgs(1),
    RunE: runReview,
}

func init() {
    rootCmd.AddCommand(reviewCmd)
    
    reviewCmd.Flags().StringVarP(&reviewTask, "task", "t", "", "Specific review focus (e.g., 'security', 'performance', 'best-practices')")
}

func runReview(cmd *cobra.Command, args []string) error {
    fileName := args[0]
    
    // Check if file exists
    if !utils.FileExists(fileName) {
        return fmt.Errorf("file %s does not exist", fileName)
    }
    
    // Create spinner
    spinner, _ := pterm.DefaultSpinner.Start("Reviewing code...")
    
    // Read file
    code, err := utils.ReadFile(fileName)
    if err != nil {
        spinner.Fail(fmt.Sprintf("Failed to read file: %v", err))
        return err
    }
    
    // Detect language
    language := utils.DetectLanguage(fileName)
    
    // Initialize Ollama client
    client := ollama.NewClient(cfg.Ollama.APIURL, cfg.Ollama.Model, cfg.Ollama.Temperature)
    
    // Build prompt
    prompt := buildReviewPrompt(language, code, reviewTask)
    
    // Perform review
    review, err := client.Generate(cmd.Context(), prompt)
    if err != nil {
        spinner.Fail(fmt.Sprintf("Failed to review code: %v", err))
        return err
    }
    
    spinner.Success("Code review completed!")
    
    // Display review results
    displayReview(fileName, review)
    
    // Offer to save review
    if ui.ConfirmAction("Save review to file?") {
        reviewFileName := strings.TrimSuffix(fileName, filepath.Ext(fileName)) + "_review.md"
        reviewContent := fmt.Sprintf("# Code Review: %s\n\nDate: %s\n\n%s",
            fileName,
            time.Now().Format("2006-01-02 15:04:05"),
            review)
        
        if err := utils.WriteFile(reviewFileName, reviewContent); err != nil {
            pterm.Warning.Printf("Failed to save review: %v\n", err)
        } else {
            pterm.Success.Printf("Review saved to %s\n", reviewFileName)
        }
    }
    
    return nil
}

func buildReviewPrompt(language, code, focus string) string {
    reviewAreas := []string{
        "Code quality and readability",
        "Potential bugs and logic errors",
        "Security vulnerabilities",
        "Performance issues",
        "Best practices and conventions",
        "Error handling",
        "Code duplication",
        "Maintainability",
    }
    
    if focus != "" {
        reviewAreas = append([]string{fmt.Sprintf("Focus area: %s", focus)}, reviewAreas...)
    }
    
    prompt := fmt.Sprintf(`You are an expert %s developer performing a code review. Review the following code thoroughly.

Code to review:
%s

Review the code for:
%s

Provide a detailed review with:
1. Overall assessment
2. Specific issues found (with line references where applicable)
3. Suggestions for improvement
4. Examples of how to fix critical issues
5. Positive aspects of the code

Format your response as a structured review with clear sections and bullet points.
Be constructive and specific in your feedback.`, 
        language, code, strings.Join(reviewAreas, "\n- "))
    
    return prompt
}

func displayReview(fileName string, review string) {
    pterm.DefaultHeader.WithFullWidth().Printf("Code Review: %s", fileName)
    
    // Parse and display review sections
    sections := strings.Split(review, "\n\n")
    for _, section := range sections {
        if strings.HasPrefix(section, "#") {
            // Section header
            pterm.DefaultSection.Println(strings.TrimPrefix(section, "# "))
        } else if strings.HasPrefix(section, "-") || strings.HasPrefix(section, "*") {
            // Bullet points
            lines := strings.Split(section, "\n")
            for _, line := range lines {
                if strings.TrimSpace(line) != "" {
                    pterm.DefaultBasicText.WithStyle(pterm.NewStyle(pterm.FgDefault)).Println("• " + strings.TrimLeft(line, "-* "))
                }
            }
        } else {
            // Regular paragraph
            pterm.DefaultParagraph.Println(section)
        }
    }
}