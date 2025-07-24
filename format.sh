#!/bin/bash
# Format all Go code files

echo "Formatting Go code..."

# Format all .go files
find . -name "*.go" -not -path "./vendor/*" -not -path "./installer/*" -exec gofmt -w {} \;

# Run goimports
echo "Running goimports..."
if command -v goimports &> /dev/null; then
    find . -name "*.go" -not -path "./vendor/*" -not -path "./installer/*" -exec goimports -w -local github.com/snowsoft/codeweaver {} \;
else
    echo "goimports not found. Install with: go install golang.org/x/tools/cmd/goimports@latest"
fi

echo "Done!"