#!/bin/bash
# Fix atomicgo module conflict

echo "Fixing atomicgo module conflict..."

# Step 1: Clean everything
echo "Step 1: Cleaning module cache..."
go clean -modcache

# Step 2: Remove go.mod and go.sum
echo "Step 2: Removing module files..."
rm -f go.mod go.sum

# Step 3: Create clean go.mod
echo "Step 3: Creating clean go.mod..."
go mod init github.com/snowsoft/codeweaver

# Step 4: Add specific versions that work together
echo "Step 4: Adding dependencies with specific versions..."
go get github.com/spf13/cobra@v1.8.0
go get github.com/spf13/viper@v1.18.2
go get github.com/sergi/go-diff@v1.3.1
go get github.com/AlecAivazis/survey/v2@v2.3.7
go get gopkg.in/yaml.v3@v3.0.1

# Try different pterm version
echo "Step 5: Trying pterm v0.12.79..."
go get github.com/pterm/pterm@v0.12.79

# If that fails, try latest
if [ $? -ne 0 ]; then
    echo "Trying latest pterm..."
    go get github.com/pterm/pterm@latest
fi

# Step 6: Tidy
echo "Step 6: Running go mod tidy..."
go mod tidy

# Step 7: Build test
echo "Step 7: Testing build..."
go build -o test-build .

if [ $? -eq 0 ]; then
    echo "Success! Build works."
    rm test-build
else
    echo "Build failed. Trying alternative solution..."
fi

echo "Done!"