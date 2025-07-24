// Package ui provides user interface functionality
package ui

import (
    "fmt"
    "os"
    "os/exec"
    "strings"
    
    "github.com/AlecAivazis/survey/v2"
    "github.com/pterm/pterm"
)

// Action represents user action choices
type Action int

const (
    ActionAccept Action = iota
    ActionDecline
    ActionEdit
)

// ConfirmAction asks for a yes/no confirmation
func ConfirmAction(message string) bool {
    confirm := false
    prompt := &survey.Confirm{
        Message: message,
    }
    err := survey.AskOne(prompt, &confirm)
    if err != nil {
        return false
    }
    return confirm
}

// AskForAction presents multiple action choices to the user
func AskForAction() Action {
    var action string
    prompt := &survey.Select{
        Message: "What would you like to do?",
        Options: []string{
            "Accept changes",
            "Decline changes",
            "Edit manually",
        },
    }
    
    err := survey.AskOne(prompt, &action)
    if err != nil {
        return ActionDecline
    }
    
    switch action {
    case "Accept changes":
        return ActionAccept
    case "Edit manually":
        return ActionEdit
    default:
        return ActionDecline
    }
}

// AskForInput gets text input from the user
func AskForInput(message string) string {
    var input string
    prompt := &survey.Input{
        Message: message,
    }
    err := survey.AskOne(prompt, &input)
    if err != nil {
        return ""
    }
    return strings.TrimSpace(input)
}

// OpenEditor opens the system editor for manual editing
func OpenEditor(content string) (string, error) {
    // Create temporary file
    tmpFile, err := os.CreateTemp("", "weaver-edit-*.txt")
    if err != nil {
        return "", fmt.Errorf("failed to create temp file: %w", err)
    }
    defer os.Remove(tmpFile.Name())
    
    // Write content to temp file
    if _, err := tmpFile.WriteString(content); err != nil {
        tmpFile.Close()
        return "", fmt.Errorf("failed to write temp file: %w", err)
    }
    tmpFile.Close()
    
    // Determine editor
    editor := os.Getenv("EDITOR")
    if editor == "" {
        editor = "nano" // fallback
        if _, err := exec.LookPath("code"); err == nil {
            editor = "code"
        } else if _, err := exec.LookPath("vim"); err == nil {
            editor = "vim"
        }
    }
    
    // Open editor
    cmd := exec.Command(editor, tmpFile.Name())
    cmd.Stdin = os.Stdin
    cmd.Stdout = os.Stdout
    cmd.Stderr = os.Stderr
    
    if err := cmd.Run(); err != nil {
        return "", fmt.Errorf("failed to run editor: %w", err)
    }
    
    // Read edited content
    editedContent, err := os.ReadFile(tmpFile.Name())
    if err != nil {
        return "", fmt.Errorf("failed to read edited file: %w", err)
    }
    
    return string(editedContent), nil
}

// ShowProgress displays a progress bar
func ShowProgress(title string, total int) *pterm.ProgressbarPrinter {
    bar, _ := pterm.DefaultProgressbar.
        WithTotal(total).
        WithTitle(title).
        Start()
    return bar
}