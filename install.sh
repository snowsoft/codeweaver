#!/bin/bash

# Code Weaver Installation Script
set -e

echo "🧵 Code Weaver Installation Script"
echo "================================="

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo "❌ Go is not installed. Please install Go 1.21 or higher."
    echo "Visit: https://go.dev/dl/"
    exit 1
fi

GO_VERSION=$(go version | awk '{print $3}')
echo "✅ Found Go version: $GO_VERSION"

# Check Go version (simple check for 1.21+)
GO_MAJOR=$(echo $GO_VERSION | cut -d. -f1 | sed 's/go//')
GO_MINOR=$(echo $GO_VERSION | cut -d. -f2)

if [ "$GO_MAJOR" -eq 1 ] && [ "$GO_MINOR" -lt 21 ]; then
    echo "❌ Go version 1.21 or higher is required. Current version: $GO_VERSION"
    exit 1
fi

echo ""
echo "📦 Installing dependencies..."

# Clean up any existing module files
rm -f go.mod go.sum

# Initialize module
echo "Initializing Go module..."
go mod init github.com/snowsoft/codeweaver

# Add dependencies one by one
echo "Adding dependencies..."
go get github.com/spf13/cobra@v1.8.0
go get github.com/spf13/viper@v1.18.2
go get github.com/pterm/pterm@v0.12.71
go get github.com/sergi/go-diff@v1.3.1
go get github.com/AlecAivazis/survey/v2@v2.3.7
go get gopkg.in/yaml.v3@v3.0.1

# Tidy up
echo "Tidying up modules..."
go mod tidy

echo ""
echo "🔨 Building Code Weaver..."
go build -o weaver .

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please check the error messages above."
    exit 1
fi

echo ""
echo "📁 Setting up configuration..."

# Create config directory
CONFIG_DIR="$HOME/.config/weaver"
mkdir -p "$CONFIG_DIR"

# Copy example config if it doesn't exist
if [ ! -f "$CONFIG_DIR/config.yaml" ]; then
    if [ -f "config.yaml.example" ]; then
        cp config.yaml.example "$CONFIG_DIR/config.yaml"
        echo "✅ Configuration file created at: $CONFIG_DIR/config.yaml"
    else
        echo "⚠️  config.yaml.example not found. Please create it manually."
    fi
else
    echo "✅ Configuration file already exists at: $CONFIG_DIR/config.yaml"
fi

echo ""
echo "🚀 Installation Options:"
echo "1. Install globally (requires sudo)"
echo "2. Install locally (add to PATH manually)"
echo "3. Skip installation (use from current directory)"

read -p "Choose an option (1-3): " choice

case $choice in
    1)
        echo "Installing globally..."
        sudo mv weaver /usr/local/bin/
        echo "✅ Weaver installed to /usr/local/bin/weaver"
        ;;
    2)
        echo "Installing locally..."
        mkdir -p "$HOME/.local/bin"
        mv weaver "$HOME/.local/bin/"
        echo "✅ Weaver installed to $HOME/.local/bin/weaver"
        echo ""
        echo "⚠️  Add the following line to your shell configuration file (.bashrc, .zshrc, etc.):"
        echo "export PATH=\"\$HOME/.local/bin:\$PATH\""
        ;;
    3)
        echo "✅ Weaver binary created in current directory"
        echo "Run with: ./weaver"
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "🎉 Installation complete!"
echo ""
echo "📖 Next steps:"
echo "1. Install Ollama: curl -fsSL https://ollama.ai/install.sh | sh"
echo "2. Start Ollama: ollama serve"
echo "3. Pull a model: ollama pull codellama:13b-instruct"
echo "4. Test Weaver: weaver --version"
echo ""
echo "Happy coding! 🚀"