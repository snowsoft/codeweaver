# Makefile for Code Weaver
# Cross-platform build and installation

# Variables
BINARY_NAME=weaver
VERSION=$(shell git describe --tags --always --dirty 2>/dev/null || echo "dev")
GOBASE=$(shell pwd)
GOBIN=$(GOBASE)/bin
GOOS=$(shell go env GOOS)
GOARCH=$(shell go env GOARCH)

# Build flags
LDFLAGS=-ldflags "-X main.version=$(VERSION)"

# Platform specific
ifeq ($(GOOS),windows)
    BINARY_NAME := $(BINARY_NAME).exe
endif

# Colors for output
RED=\033[0;31m
GREEN=\033[0;32m
YELLOW=\033[0;33m
NC=\033[0m # No Color

.PHONY: all build clean test install uninstall setup help

# Default target
all: build

## help: Show this help message
help:
	@echo 'Usage:'
	@echo '  make <target>'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

## build: Build the binary
build:
	@echo "$(GREEN)Building $(BINARY_NAME)...$(NC)"
	@go mod download
	@go mod tidy
	@go build $(LDFLAGS) -o $(BINARY_NAME) .
	@echo "$(GREEN)✅ Build complete: $(BINARY_NAME)$(NC)"

## clean: Clean build artifacts
clean:
	@echo "$(YELLOW)Cleaning...$(NC)"
	@go clean
	@rm -f $(BINARY_NAME)
	@rm -rf dist/
	@echo "$(GREEN)✅ Clean complete$(NC)"

## test: Run tests
test:
	@echo "$(GREEN)Running tests...$(NC)"
	@go test -v ./...

## install: Install binary to system
install: build
	@echo "$(GREEN)Installing $(BINARY_NAME)...$(NC)"
ifeq ($(GOOS),windows)
	@echo "$(YELLOW)Windows detected. Installing to user directory...$(NC)"
	@if not exist "%USERPROFILE%\.local\bin" mkdir "%USERPROFILE%\.local\bin"
	@copy $(BINARY_NAME) "%USERPROFILE%\.local\bin\"
	@echo "$(YELLOW)⚠️  Add %USERPROFILE%\.local\bin to your PATH$(NC)"
else
	@echo "$(YELLOW)Installing to /usr/local/bin (requires sudo)...$(NC)"
	@sudo cp $(BINARY_NAME) /usr/local/bin/
	@sudo chmod 755 /usr/local/bin/$(BINARY_NAME)
endif
	@echo "$(GREEN)✅ Installation complete$(NC)"

## uninstall: Remove installed binary
uninstall:
	@echo "$(RED)Uninstalling $(BINARY_NAME)...$(NC)"
ifeq ($(GOOS),windows)
	@del "%USERPROFILE%\.local\bin\$(BINARY_NAME)" 2>nul || true
else
	@sudo rm -f /usr/local/bin/$(BINARY_NAME)
endif
	@echo "$(GREEN)✅ Uninstall complete$(NC)"

## setup: Setup configuration
setup:
	@echo "$(GREEN)Setting up configuration...$(NC)"
ifeq ($(GOOS),windows)
	@if not exist "%USERPROFILE%\.config\weaver" mkdir "%USERPROFILE%\.config\weaver"
	@if not exist "%USERPROFILE%\.config\weaver\config.yaml" copy config.yaml.example "%USERPROFILE%\.config\weaver\config.yaml"
else
	@mkdir -p ~/.config/weaver
	@[ -f ~/.config/weaver/config.yaml ] || cp config.yaml.example ~/.config/weaver/config.yaml
endif
	@echo "$(GREEN)✅ Configuration setup complete$(NC)"

## run: Build and run
run: build
	@echo "$(GREEN)Running $(BINARY_NAME)...$(NC)"
	@./$(BINARY_NAME)

## deps: Download dependencies
deps:
	@echo "$(GREEN)Downloading dependencies...$(NC)"
	@go mod download
	@go mod tidy
	@echo "$(GREEN)✅ Dependencies downloaded$(NC)"

## lint: Run linter
lint:
	@echo "$(GREEN)Running linter...$(NC)"
	@golangci-lint run --enable-all || true

## fmt: Format code
fmt:
	@echo "$(GREEN)Formatting code...$(NC)"
	@go fmt ./...
	@echo "$(GREEN)✅ Code formatted$(NC)"

## build-all: Build for all platforms
build-all:
	@echo "$(GREEN)Building for all platforms...$(NC)"
	@mkdir -p dist
	
	@echo "Building for Linux..."
	@GOOS=linux GOARCH=amd64 go build $(LDFLAGS) -o dist/weaver-linux-amd64 .
	@GOOS=linux GOARCH=arm64 go build $(LDFLAGS) -o dist/weaver-linux-arm64 .
	
	@echo "Building for macOS..."
	@GOOS=darwin GOARCH=amd64 go build $(LDFLAGS) -o dist/weaver-darwin-amd64 .
	@GOOS=darwin GOARCH=arm64 go build $(LDFLAGS) -o dist/weaver-darwin-arm64 .
	
	@echo "Building for Windows..."
	@GOOS=windows GOARCH=amd64 go build $(LDFLAGS) -o dist/weaver-windows-amd64.exe .
	@GOOS=windows GOARCH=arm64 go build $(LDFLAGS) -o dist/weaver-windows-arm64.exe .
	
	@echo "$(GREEN)✅ All platforms built$(NC)"

## docker-build: Build Docker image
docker-build:
	@echo "$(GREEN)Building Docker image...$(NC)"
	@docker build -t codeweaver:latest .
	@echo "$(GREEN)✅ Docker image built$(NC)"

## docker-run: Run Docker container
docker-run: docker-build
	@docker run --rm -it -v $(PWD):/workspace codeweaver:latest

## docker-compose-up: Start all services with Docker Compose
docker-compose-up:
	@echo "$(GREEN)Starting services...$(NC)"
	@docker-compose up -d
	@echo "$(GREEN)✅ Services started$(NC)"
	@echo "Ollama UI: http://localhost:3000"

## docker-compose-down: Stop all services
docker-compose-down:
	@echo "$(YELLOW)Stopping services...$(NC)"
	@docker-compose down
	@echo "$(GREEN)✅ Services stopped$(NC)"

## release: Create release archives
release: build-all
	@echo "$(GREEN)Creating release archives...$(NC)"
	@cd dist && tar -czf weaver-linux-amd64.tar.gz weaver-linux-amd64
	@cd dist && tar -czf weaver-linux-arm64.tar.gz weaver-linux-arm64
	@cd dist && tar -czf weaver-darwin-amd64.tar.gz weaver-darwin-amd64
	@cd dist && tar -czf weaver-darwin-arm64.tar.gz weaver-darwin-arm64
	@cd dist && zip weaver-windows-amd64.zip weaver-windows-amd64.exe
	@cd dist && zip weaver-windows-arm64.zip weaver-windows-arm64.exe
	@echo "$(GREEN)✅ Release archives created$(NC)"

## quick: Quick build without dependencies
quick:
	@go build -o $(BINARY_NAME) .