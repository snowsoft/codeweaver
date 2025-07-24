#!/bin/bash
# Fix import ordering with goimports

echo "Installing goimports..."
go install golang.org/x/tools/cmd/goimports@latest

echo "Fixing imports..."
# Run goimports with local prefix
goimports -w -local github.com/snowsoft/codeweaver .

echo "Running gofmt..."
gofmt -w .

echo "Done! Import ordering fixed."

# Show changed files
git diff --name-only