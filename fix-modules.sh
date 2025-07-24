#!/bin/bash
# Script to fix Go module issues

echo "Fixing Go module issues..."

# Step 1: Clean everything
echo "Step 1: Cleaning module cache..."
go clean -modcache

# Step 2: Remove go.mod and go.sum
echo "Step 2: Removing old module files..."
rm -f go.mod go.sum

# Step 3: Create new go.mod
echo "Step 3: Creating clean go.mod..."
cat > go.mod << 'EOF'
module github.com/snowsoft/codeweaver

go 1.21

require (
    github.com/AlecAivazis/survey/v2 v2.3.7
    github.com/pterm/pterm v0.12.79
    github.com/sergi/go-diff v1.3.1
    github.com/spf13/cobra v1.8.0
    github.com/spf13/viper v1.18.2
    gopkg.in/yaml.v3 v3.0.1
)
EOF

# Step 4: Download dependencies
echo "Step 4: Downloading dependencies..."
go mod download

# Step 5: Tidy
echo "Step 5: Running go mod tidy..."
go mod tidy

# Step 6: Verify
echo "Step 6: Verifying..."
go mod verify

echo "Done! Module issues should be fixed."