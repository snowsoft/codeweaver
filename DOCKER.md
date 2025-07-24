# Docker Usage Guide for Code Weaver

## 🐳 Quick Start with Docker

### 1. Using Pre-built Image

```bash
# Pull the latest image
docker pull ghcr.io/snowsoft/codeweaver:latest

# Run weaver command
docker run --rm -it ghcr.io/snowsoft/codeweaver:latest --help

# Work with local files
docker run --rm -it -v $(pwd):/workspace ghcr.io/snowsoft/codeweaver:latest new hello.py --task "Create hello world"
```

### 2. Using Docker Compose (Recommended)

```bash
# Start all services (Ollama + Weaver)
docker-compose up -d

# Pull a model
docker-compose exec ollama ollama pull codellama:13b-instruct

# Use weaver
docker-compose exec weaver weaver new test.py --task "Create a test script"

# Interactive shell
docker-compose exec weaver sh
```

### 3. Building Custom Image

```bash
# Build image
docker build -t my-weaver .

# Run with custom config
docker run --rm -it \
  -v $(pwd)/config.yaml:/home/weaver/.config/weaver/config.yaml \
  -v $(pwd):/workspace \
  my-weaver refactor /workspace/code.py --task "Add type hints"
```

## 🔧 Configuration

### Environment Variables

```bash
# Custom Ollama host
docker run --rm -it \
  -e OLLAMA_HOST=http://my-ollama:11434 \
  ghcr.io/snowsoft/codeweaver:latest

# Custom config path
docker run --rm -it \
  -e WEAVER_CONFIG=/custom/config.yaml \
  -v $(pwd)/my-config.yaml:/custom/config.yaml \
  ghcr.io/snowsoft/codeweaver:latest
```

### Docker Compose Override

Create `docker-compose.override.yml`:

```yaml
version: '3.8'

services:
  weaver:
    environment:
      - OLLAMA_HOST=http://ollama:11434
      - WEAVER_CONFIG=/config/custom.yaml
    volumes:
      - ./custom-config.yaml:/config/custom.yaml
      - /path/to/my/project:/workspace
```

## 🚀 Advanced Usage

### Multi-Platform Build

```bash
# Build for multiple platforms
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t ghcr.io/snowsoft/codeweaver:latest \
  --push .
```

### Using with GPU (for Ollama)

```bash
# With NVIDIA GPU
docker-compose up -d

# Check GPU is detected
docker-compose exec ollama nvidia-smi
```

### Development Mode

```bash
# Mount source code for development
docker run --rm -it \
  -v $(pwd):/app \
  -w /app \
  golang:1.21-alpine \
  sh -c "go mod download && go run . --help"
```

## 📝 Useful Aliases

Add to your shell profile:

```bash
# Weaver docker alias
alias weaver-docker='docker run --rm -it -v $(pwd):/workspace ghcr.io/snowsoft/codeweaver:latest'

# Quick commands
alias wnew='weaver-docker new'
alias wrefactor='weaver-docker refactor'
alias wdoc='weaver-docker document'
alias wtest='weaver-docker test'
alias wreview='weaver-docker review'

# Usage
wnew hello.py --task "Create a hello world script"
```

## 🔍 Troubleshooting

### Connection to Ollama Failed

```bash
# Check Ollama is running
docker-compose ps
docker-compose logs ollama

# Test connection
docker-compose exec weaver wget -O- http://ollama:11434/api/tags
```

### Permission Issues

```bash
# Fix ownership
docker-compose exec weaver chown -R weaver:weaver /workspace

# Run as root (not recommended)
docker run --rm -it --user root ghcr.io/snowsoft/codeweaver:latest
```

### Building Behind Proxy

```bash
docker build \
  --build-arg HTTP_PROXY=http://proxy:8080 \
  --build-arg HTTPS_PROXY=http://proxy:8080 \
  -t my-weaver .
```