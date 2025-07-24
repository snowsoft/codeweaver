// Package main is the entry point for the Weaver CLI tool
package main

import (
    "fmt"
    "os"
    
    "github.com/snowsoft/weaver/cmd"
)

func main() {
    if err := cmd.Execute(); err != nil {
        fmt.Fprintf(os.Stderr, "Error: %v\n", err)
        os.Exit(1)
    }
}