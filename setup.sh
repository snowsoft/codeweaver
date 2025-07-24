#!/bin/bash
# Simple setup script for Code Weaver

echo "🧵 Code Weaver Quick Setup"
echo "========================="

# Create config directory
CONFIG_DIR="$HOME/.config/weaver"
mkdir -p "$CONFIG_DIR"

# Create default config if not exists
if [ ! -f "$CONFIG_DIR/config.yaml" ]; then
    cat > "$CONFIG_DIR/config.yaml" << 'EOF'
# Weaver Configuration
ollama:
  api_url: "http://localhost:11434"
  model: "codellama:13b-instruct"
  temperature: 0.7

ui:
  theme: "dark"
  show_spinner: true

defaults:
  auto_backup: true
  backup_dir: ".weaver_backups"
EOF
    echo "✅ Config file created"
fi

# Check if weaver exists
if command -v weaver &> /dev/null; then
    echo "✅ Weaver is installed"
    weaver --version
else
    echo "❌ Weaver not found in PATH"
    echo ""
    echo "To install:"
    echo "  1. Download from: https://github.com/snowsoft/codeweaver/releases"
    echo "  2. Or build: go build -o weaver ."
    echo "  3. Move to PATH: sudo mv weaver /usr/local/bin/"
fi

# Check Ollama
if command -v ollama &> /dev/null; then
    echo "✅ Ollama is installed"
else
    echo "❌ Ollama not found"
    echo "Install from: https://ollama.ai/"
fi

echo ""
echo "Setup complete! Run: weaver --help"