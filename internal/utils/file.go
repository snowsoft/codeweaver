// Package utils provides utility functions
package utils

import (
    "fmt"
    "io"
    "os"
    "path/filepath"
    "strings"
)

// ReadFile reads the contents of a file
func ReadFile(path string) (string, error) {
    content, err := os.ReadFile(path)
    if err != nil {
        return "", fmt.Errorf("failed to read file: %w", err)
    }
    return string(content), nil
}

// WriteFile writes content to a file with secure permissions
func WriteFile(path string, content string) error {
    return os.WriteFile(path, []byte(content), 0600)
}

// FileExists checks if a file exists
func FileExists(path string) bool {
    _, err := os.Stat(path)
    return !os.IsNotExist(err)
}

// CreateBackup creates a backup of a file
func CreateBackup(sourcePath, backupPath string) error {
    // Create backup directory if it doesn't exist
    backupDir := filepath.Dir(backupPath)
    if err := os.MkdirAll(backupDir, 0755); err != nil {
        return fmt.Errorf("failed to create backup directory: %w", err)
    }
    
    // Copy file
    source, err := os.Open(sourcePath)
    if err != nil {
        return fmt.Errorf("failed to open source file: %w", err)
    }
    defer source.Close()
    
    backup, err := os.Create(backupPath)
    if err != nil {
        return fmt.Errorf("failed to create backup file: %w", err)
    }
    defer backup.Close()
    
    if _, err := io.Copy(backup, source); err != nil {
        return fmt.Errorf("failed to copy file: %w", err)
    }
    
    return nil
}

// DetectLanguage detects the programming language from file extension
func DetectLanguage(fileName string) string {
    ext := strings.ToLower(filepath.Ext(fileName))
    
    languageMap := map[string]string{
        ".py":   "python",
        ".js":   "javascript",
        ".jsx":  "javascript",
        ".ts":   "typescript",
        ".tsx":  "typescript",
        ".go":   "go",
        ".rs":   "rust",
        ".php":  "php",
        ".java": "java",
        ".cs":   "csharp",
        ".cpp":  "cpp",
        ".c":    "c",
        ".rb":   "ruby",
        ".swift": "swift",
        ".kt":   "kotlin",
        ".scala": "scala",
        ".r":    "r",
        ".jl":   "julia",
        ".lua":  "lua",
        ".dart": "dart",
        ".ex":   "elixir",
        ".exs":  "elixir",
    }
    
    if lang, ok := languageMap[ext]; ok {
        return lang
    }
    
    return "unknown"
}

// GetDirectoryTree returns a tree representation of a directory
func GetDirectoryTree(root string, maxDepth int) (string, error) {
    var tree strings.Builder
    
    err := filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
        if err != nil {
            return err
        }
        
        // Calculate depth
        relPath, err := filepath.Rel(root, path)
        if err != nil {
            return err
        }
        depth := strings.Count(relPath, string(filepath.Separator))
        
        // Skip if too deep
        if depth > maxDepth {
            if info.IsDir() {
                return filepath.SkipDir
            }
            return nil
        }
        
        // Skip hidden files and directories
        if strings.HasPrefix(filepath.Base(path), ".") && path != root {
            if info.IsDir() {
                return filepath.SkipDir
            }
            return nil
        }
        
        // Skip common ignore directories
        ignoreDirs := []string{"node_modules", "__pycache__", "vendor", ".git", "dist", "build"}
        for _, ignore := range ignoreDirs {
            if strings.Contains(path, ignore) {
                if info.IsDir() {
                    return filepath.SkipDir
                }
                return nil
            }
        }
        
        // Build tree line
        indent := strings.Repeat("  ", depth)
        prefix := "├── "
        if depth == 0 {
            prefix = ""
        }
        
        if info.IsDir() {
            tree.WriteString(fmt.Sprintf("%s%s%s/\n", indent, prefix, filepath.Base(path)))
        } else {
            tree.WriteString(fmt.Sprintf("%s%s%s\n", indent, prefix, filepath.Base(path)))
        }
        
        return nil
    })
    
    if err != nil {
        return "", fmt.Errorf("failed to walk directory: %w", err)
    }
    
    return tree.String(), nil
}

// GetFileSize returns the size of a file in a human-readable format
func GetFileSize(path string) (string, error) {
    info, err := os.Stat(path)
    if err != nil {
        return "", err
    }
    
    size := info.Size()
    const unit = 1024
    if size < unit {
        return fmt.Sprintf("%d B", size), nil
    }
    
    div, exp := int64(unit), 0
    for n := size / unit; n >= unit; n /= unit {
        div *= unit
        exp++
    }
    
    return fmt.Sprintf("%.1f %cB", float64(size)/float64(div), "KMGTPE"[exp]), nil
}