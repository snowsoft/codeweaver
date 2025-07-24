#!/bin/bash
# Replace pterm with alternative libraries

echo "Replacing pterm with alternative UI libraries..."

# Step 1: Update imports in all files
echo "Step 1: Updating imports..."

# Replace pterm imports
find . -name "*.go" -type f -exec sed -i 's|"github.com/pterm/pterm"|"github.com/snowsoft/codeweaver/internal/ui"|g' {} \;

# Step 2: Replace pterm usage patterns
echo "Step 2: Updating code patterns..."

# Replace pterm.DefaultSpinner.Start with ui.NewSpinner
find . -name "*.go" -type f -exec sed -i 's|pterm\.DefaultSpinner\.Start(\(.*\))|ui.NewSpinner(\1).Start()|g' {} \;

# Replace spinner.Success
find . -name "*.go" -type f -exec sed -i 's|spinner\.Success(\(.*\))|if spinner != nil { spinner.Success(\1) }|g' {} \;

# Replace spinner.Fail
find . -name "*.go" -type f -exec sed -i 's|spinner\.Fail(\(.*\))|if spinner != nil { spinner.Fail(\1) }|g' {} \;

# Replace pterm.Warning
find . -name "*.go" -type f -exec sed -i 's|pterm\.Warning\.|ui.Warning|g' {} \;

# Replace pterm.Info
find . -name "*.go" -type f -exec sed -i 's|pterm\.Info\.|ui.Info|g' {} \;

# Replace pterm.Success
find . -name "*.go" -type f -exec sed -i 's|pterm\.Success\.|color.Green|g' {} \;
find . -name "*.go" -type f -exec sed -i 's|color\.Green\.Printf|fmt.Printf("%s", color.GreenString|g' {} \;

# Step 3: Update go.mod
echo "Step 3: Updating go.mod..."
cat > go.mod << 'EOF'
module github.com/snowsoft/codeweaver

go 1.21

require (
    github.com/AlecAivazis/survey/v2 v2.3.7
    github.com/fatih/color v1.16.0
    github.com/schollz/progressbar/v3 v3.14.1
    github.com/sergi/go-diff v1.3.1
    github.com/spf13/cobra v1.8.0
    github.com/spf13/viper v1.18.2
    gopkg.in/yaml.v3 v3.0.1
)
EOF

# Step 4: Get new dependencies
echo "Step 4: Installing new dependencies..."
go mod download
go mod tidy

echo "Done! pterm has been replaced with alternative libraries."