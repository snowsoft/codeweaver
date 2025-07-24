// Package diff provides diff viewing functionality
package diff

import (
    "fmt"
    "strings"
    
    "github.com/pterm/pterm"
    "github.com/sergi/go-diff/diffmatchpatch"
)

// Viewer handles diff display
type Viewer struct {
    dmp *diffmatchpatch.DiffMatchPatch
}

// NewViewer creates a new diff viewer
func NewViewer() *Viewer {
    return &Viewer{
        dmp: diffmatchpatch.New(),
    }
}

// GenerateDiff generates a colored diff between two texts
func (v *Viewer) GenerateDiff(original, modified, fileName string) string {
    diffs := v.dmp.DiffMain(original, modified, false)
    
    var output strings.Builder
    
    output.WriteString(pterm.DefaultHeader.Sprint("Diff for: " + fileName))
    output.WriteString("\n\n")
    
    lineNumOrig := 1
    lineNumMod := 1
    
    for _, diff := range diffs {
        lines := strings.Split(diff.Text, "\n")
        
        switch diff.Type {
        case diffmatchpatch.DiffDelete:
            for i, line := range lines {
                if i == len(lines)-1 && line == "" {
                    continue
                }
                output.WriteString(pterm.Red(fmt.Sprintf("-%4d | %s\n", lineNumOrig, line)))
                lineNumOrig++
            }
            
        case diffmatchpatch.DiffInsert:
            for i, line := range lines {
                if i == len(lines)-1 && line == "" {
                    continue
                }
                output.WriteString(pterm.Green(fmt.Sprintf("+%4d | %s\n", lineNumMod, line)))
                lineNumMod++
            }
            
        case diffmatchpatch.DiffEqual:
            for i, line := range lines {
                if i == len(lines)-1 && line == "" {
                    continue
                }
                output.WriteString(fmt.Sprintf(" %4d | %s\n", lineNumOrig, line))
                lineNumOrig++
                lineNumMod++
            }
        }
    }
    
    return output.String()
}

// GenerateUnifiedDiff generates a unified diff format
func (v *Viewer) GenerateUnifiedDiff(original, modified, fileName string) string {
    diffs := v.dmp.DiffMain(original, modified, false)
    patches := v.dmp.PatchMake(original, diffs)
    
    var output strings.Builder
    output.WriteString(fmt.Sprintf("--- %s\n", fileName))
    output.WriteString(fmt.Sprintf("+++ %s (modified)\n", fileName))
    
    for _, patch := range patches {
        output.WriteString(patch.String())
    }
    
    return output.String()
}