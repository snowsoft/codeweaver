package ui

import (
    "fmt"
    "time"

    "github.com/fatih/color"
    "github.com/schollz/progressbar/v3"
)

// Spinner provides a simple spinner interface
type Spinner struct {
    message string
    done    chan bool
    success bool
}

// NewSpinner creates a new spinner
func NewSpinner(message string) *Spinner {
    return &Spinner{
        message: message,
        done:    make(chan bool),
    }
}

// Start starts the spinner
func (s *Spinner) Start() error {
    go func() {
        chars := []string{"⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"}
        i := 0
        for {
            select {
            case <-s.done:
                return
            default:
                fmt.Printf("\r%s %s", color.YellowString(chars[i]), s.message)
                i = (i + 1) % len(chars)
                time.Sleep(100 * time.Millisecond)
            }
        }
    }()
    return nil
}

// Success stops the spinner with success
func (s *Spinner) Success(message string) {
    s.success = true
    s.done <- true
    fmt.Printf("\r%s %s\n", color.GreenString("✓"), message)
}

// Fail stops the spinner with failure
func (s *Spinner) Fail(message string) {
    s.success = false
    s.done <- true
    fmt.Printf("\r%s %s\n", color.RedString("✗"), message)
}

// Warning prints a warning message
func Warning(message string) {
    fmt.Printf("%s %s\n", color.YellowString("⚠"), message)
}

// Info prints an info message
func Info(message string) {
    fmt.Printf("%s %s\n", color.CyanString("ℹ"), message)
}

// CreateProgressBar creates a progress bar
func CreateProgressBar(total int, description string) *progressbar.ProgressBar {
    return progressbar.NewOptions(total,
        progressbar.OptionEnableColorCodes(true),
        progressbar.OptionShowBytes(false),
        progressbar.OptionSetDescription(description),
        progressbar.OptionSetTheme(progressbar.Theme{
            Saucer:        "[green]=[reset]",
            SaucerHead:    "[green]>[reset]",
            SaucerPadding: " ",
            BarStart:      "[",
            BarEnd:        "]",
        }),
    )
}