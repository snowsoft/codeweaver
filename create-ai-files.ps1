# Create AI Provider Files - create-ai-files.ps1

Write-Host "Creating AI Provider files..." -ForegroundColor Cyan

# Create provider.go
Write-Host "Creating internal\ai\provider.go..." -ForegroundColor Yellow
@"
package ai

import (
    "context"
    "time"
)

// Provider represents an AI service provider
type Provider string

const (
    ProviderOllama Provider = "ollama"
    ProviderClaude Provider = "claude"
    ProviderOpenAI Provider = "openai"
    ProviderGemini Provider = "gemini"
)

// Model represents an AI model
type Model struct {
    ID          string    ``json:"id"``
    Name        string    ``json:"name"``
    Provider    Provider  ``json:"provider"``
    Description string    ``json:"description"``
    Context     int       ``json:"context_window"``
    CreatedAt   time.Time ``json:"created_at"``
}

// GenerateRequest represents a code generation request
type GenerateRequest struct {
    Prompt      string            ``json:"prompt"``
    Model       string            ``json:"model"``
    Temperature float64           ``json:"temperature"``
    MaxTokens   int               ``json:"max_tokens"``
    Context     []string          ``json:"context,omitempty"``
    Metadata    map[string]string ``json:"metadata,omitempty"``
}

// GenerateResponse represents the AI response
type GenerateResponse struct {
    Content      string            ``json:"content"``
    Model        string            ``json:"model"``
    Provider     Provider          ``json:"provider"``
    Usage        Usage             ``json:"usage"``
    FinishReason string            ``json:"finish_reason"``
    Metadata     map[string]string ``json:"metadata,omitempty"``
}

// Usage tracks token/resource usage
type Usage struct {
    PromptTokens     int     ``json:"prompt_tokens"``
    CompletionTokens int     ``json:"completion_tokens"``
    TotalTokens      int     ``json:"total_tokens"``
    Cost             float64 ``json:"cost,omitempty"``
}

// AIProvider defines the interface for AI providers
type AIProvider interface {
    // Generate creates a completion based on the request
    Generate(ctx context.Context, req GenerateRequest) (*GenerateResponse, error)

    // GenerateStream creates a streaming completion
    GenerateStream(ctx context.Context, req GenerateRequest) (<-chan StreamChunk, error)

    // ListModels returns available models
    ListModels(ctx context.Context) ([]Model, error)

    // HealthCheck verifies the provider is accessible
    HealthCheck(ctx context.Context) error

    // GetName returns the provider name
    GetName() Provider
}

// StreamChunk represents a chunk in streaming response
type StreamChunk struct {
    Content string ``json:"content"``
    Error   error  ``json:"error,omitempty"``
    Done    bool   ``json:"done"``
}

// Config represents provider configuration
type Config struct {
    Provider    Provider          ``yaml:"provider"``
    APIKey      string            ``yaml:"api_key,omitempty"``
    APIURL      string            ``yaml:"api_url,omitempty"``
    Model       string            ``yaml:"model"``
    Temperature float64           ``yaml:"temperature"``
    MaxTokens   int               ``yaml:"max_tokens"``
    Timeout     time.Duration     ``yaml:"timeout"``
    Extra       map[string]string ``yaml:"extra,omitempty"``
}

// ProviderError represents provider-specific errors
type ProviderError struct {
    Provider Provider
    Code     string
    Message  string
    Err      error
}

func (e *ProviderError) Error() string {
    if e.Err != nil {
        return string(e.Provider) + ": " + e.Message + ": " + e.Err.Error()
    }
    return string(e.Provider) + ": " + e.Message
}

func (e *ProviderError) Unwrap() error {
    return e.Err
}
"@ | Out-File -FilePath "internal\ai\provider.go" -Encoding UTF8

# Create ollama types.go
Write-Host "Creating internal\ai\ollama\types.go..." -ForegroundColor Yellow
@"
package ollama

import "time"

// GenerateRequest represents an Ollama generation request
type GenerateRequest struct {
    Model   string  ``json:"model"``
    Prompt  string  ``json:"prompt"``
    Stream  bool    ``json:"stream"``
    Options Options ``json:"options,omitempty"``
    System  string  ``json:"system,omitempty"``
    Context []int   ``json:"context,omitempty"``
}

// Options for generation
type Options struct {
    Temperature float64 ``json:"temperature,omitempty"``
    NumPredict  int     ``json:"num_predict,omitempty"``
    TopK        int     ``json:"top_k,omitempty"``
    TopP        float64 ``json:"top_p,omitempty"``
    RepeatPenalty float64 ``json:"repeat_penalty,omitempty"``
    Seed        int     ``json:"seed,omitempty"``
    NumCtx      int     ``json:"num_ctx,omitempty"``
}

// GenerateResponse represents an Ollama generation response
type GenerateResponse struct {
    Model              string    ``json:"model"``
    CreatedAt          time.Time ``json:"created_at"``
    Response           string    ``json:"response"``
    Done               bool      ``json:"done"``
    Context            []int     ``json:"context,omitempty"``
    TotalDuration      int64     ``json:"total_duration,omitempty"``
    LoadDuration       int64     ``json:"load_duration,omitempty"``
    PromptEvalCount    int       ``json:"prompt_eval_count,omitempty"``
    PromptEvalDuration int64     ``json:"prompt_eval_duration,omitempty"``
    EvalCount          int       ``json:"eval_count,omitempty"``
    EvalDuration       int64     ``json:"eval_duration,omitempty"``
}

// ModelsResponse represents the response from /api/tags
type ModelsResponse struct {
    Models []ModelInfo ``json:"models"``
}

// ModelInfo represents information about a model
type ModelInfo struct {
    Name       string    ``json:"name"``
    ModifiedAt time.Time ``json:"modified_at"``
    Size       int64     ``json:"size"``
    Digest     string    ``json:"digest"``
    Details    Details   ``json:"details,omitempty"``
}

// Details about a model
type Details struct {
    Format            string   ``json:"format"``
    Family            string   ``json:"family"``
    Families          []string ``json:"families"``
    ParameterSize     string   ``json:"parameter_size"``
    QuantizationLevel string   ``json:"quantization_level"``
}
"@ | Out-File -FilePath "internal\ai\ollama\types.go" -Encoding UTF8

Write-Host "AI Provider files created successfully!" -ForegroundColor Green