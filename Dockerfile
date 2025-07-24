# Multi-stage Dockerfile for Code Weaver

# Build stage
FROM golang:1.24.5-alpine AS builder

# Install build dependencies
RUN apk add --no-cache git make

# Set working directory
WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN go build -ldflags="-w -s" -o weaver .

# Runtime stage
FROM alpine:latest

# Install runtime dependencies
RUN apk add --no-cache ca-certificates

# Create non-root user
RUN addgroup -g 1000 weaver && \
    adduser -D -u 1000 -G weaver weaver

# Create config directory
RUN mkdir -p /home/weaver/.config/weaver && \
    chown -R weaver:weaver /home/weaver

# Copy binary from builder
COPY --from=builder /app/weaver /usr/local/bin/weaver

# Copy example config
COPY --from=builder /app/config.yaml.example /home/weaver/.config/weaver/config.yaml

# Switch to non-root user
USER weaver
WORKDIR /home/weaver

# Set environment variables
ENV WEAVER_CONFIG=/home/weaver/.config/weaver/config.yaml

# Default command
ENTRYPOINT ["weaver"]
CMD ["--help"]