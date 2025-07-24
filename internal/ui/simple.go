package ui

import (
    "fmt"
    "github.com/fatih/color"
)

// SimpleSpinner is a basic spinner that just prints status
type SimpleSpinner struct {
    message string
}

// Start starts the spinner (just prints the message)
func (s *SimpleSpinner) Start() error {
    fmt.Printf("⏳ %s\n", s.message)
    return nil
}

// Success marks success
func (s *SimpleSpinner) Success(message string) {
    fmt.Printf("✅ %s\n", color.GreenString(message))
}

// Fail marks failure  
func (s *SimpleSpinner) Fail(message string) {
    fmt.Printf("❌ %s\n", color.RedString(message))
}

// StartSpinner creates and starts a spinner
func StartSpinner(message string) (*SimpleSpinner, error) {
    s := &SimpleSpinner{message: message}
    return s, s.Start()
}

// PrintSuccess prints a success message
func PrintSuccess(format string, args ...interface{}) {
    message := fmt.Sprintf(format, args...)
    fmt.Printf("✅ %s\n", color.GreenString(message))
}

// PrintWarning prints a warning message
func PrintWarning(format string, args ...interface{}) {
    message := fmt.Sprintf(format, args...)
    fmt.Printf("⚠️  %s\n", color.YellowString(message))
}

// PrintError prints an error message
func PrintError(format string, args ...interface{}) {
    message := fmt.Sprintf(format, args...)
    fmt.Printf("❌ %s\n", color.RedString(message))
}

// PrintInfo prints an info message
func PrintInfo(format string, args ...interface{}) {
    message := fmt.Sprintf(format, args...)
    fmt.Printf("ℹ️  %s\n", color.CyanString(message))
}

// PrintHeader prints a header
func PrintHeader(text string) {
    fmt.Println()
    fmt.Println(color.New(color.Bold, color.FgCyan).Sprint(text))
    fmt.Println(color.CyanString(repeatChar("=", len(text))))
}

// repeatChar repeats a character n times
func repeatChar(char string, n int) string {
    var result string
    for i := 0; i < n; i++ {
        result += char
    }
    return result
}

// UpdateText updates the spinner message
func (s *SimpleSpinner) UpdateText(message string) {
    s.message = message
    fmt.Printf("⏳ %s\n", s.message)
}