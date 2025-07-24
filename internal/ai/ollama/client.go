package ollama

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/snowsoft/codeweaver/internal/ai"
)

// Client represents an Ollama API client
type Client struct {
	baseURL    string
	httpClient *http.Client
	config     ai.Config
}

// NewClient creates a new Ollama client
func NewClient(config ai.Config) *Client {
	if config.APIURL == "" {
		config.APIURL = "http://localhost:11434"
	}
	
	if config.Timeout == 0 {
		config.Timeout = 120 * time.Second
	}

	return &Client{
		baseURL: strings.TrimRight(config.APIURL, "/"),
		httpClient: &http.Client{
			Timeout: config.Timeout,
		},
		config: config,
	}
}

// GetName returns the provider name
func (c *Client) GetName() ai.Provider {
	return ai.ProviderOllama
}

// Generate creates a completion
func (c *Client) Generate(ctx context.Context, req ai.GenerateRequest) (*ai.GenerateResponse, error) {
	// Build the Ollama request
	ollamaReq := GenerateRequest{
		Model:  req.Model,
		Prompt: req.Prompt,
		Stream: false,
		Options: Options{
			Temperature: req.Temperature,
			NumPredict:  req.MaxTokens,
		},
	}

	// If model not specified, use default
	if ollamaReq.Model == "" {
		ollamaReq.Model = c.config.Model
		if ollamaReq.Model == "" {
			ollamaReq.Model = "codellama:13b-instruct"
		}
	}

	// Add context if provided
	if len(req.Context) > 0 {
		contextStr := strings.Join(req.Context, "\n\n")
		ollamaReq.Prompt = fmt.Sprintf("Context:\n%s\n\nTask:\n%s", contextStr, req.Prompt)
	}

	// Marshal request
	body, err := json.Marshal(ollamaReq)
	if err != nil {
		return nil, &ai.ProviderError{
			Provider: ai.ProviderOllama,
			Code:     "MARSHAL_ERROR",
			Message:  "Failed to marshal request",
			Err:      err,
		}
	}

	// Create HTTP request
	httpReq, err := http.NewRequestWithContext(ctx, "POST", c.baseURL+"/api/generate", bytes.NewReader(body))
	if err != nil {
		return nil, &ai.ProviderError{
			Provider: ai.ProviderOllama,
			Code:     "REQUEST_ERROR",
			Message:  "Failed to create request",
			Err:      err,
		}
	}
	httpReq.Header.Set("Content-Type", "application/json")

	// Send request
	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return nil, &ai.ProviderError{
			Provider: ai.ProviderOllama,
			Code:     "NETWORK_ERROR",
			Message:  "Failed to send request",
			Err:      err,
		}
	}
	defer resp.Body.Close()

	// Check status
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, &ai.ProviderError{
			Provider: ai.ProviderOllama,
			Code:     fmt.Sprintf("HTTP_%d", resp.StatusCode),
			Message:  fmt.Sprintf("API error: %s", string(body)),
		}
	}

	// Parse response
	var ollamaResp GenerateResponse
	if err := json.NewDecoder(resp.Body).Decode(&ollamaResp); err != nil {
		return nil, &ai.ProviderError{
			Provider: ai.ProviderOllama,
			Code:     "PARSE_ERROR",
			Message:  "Failed to parse response",
			Err:      err,
		}
	}

	// Convert to standard response
	return &ai.GenerateResponse{
		Content:      ollamaResp.Response,
		Model:        ollamaResp.Model,
		Provider:     ai.ProviderOllama,
		FinishReason: "stop",
		Usage: ai.Usage{
			PromptTokens:     ollamaResp.PromptEvalCount,
			CompletionTokens: ollamaResp.EvalCount,
			TotalTokens:      ollamaResp.PromptEvalCount + ollamaResp.EvalCount,
		},
	}, nil
}

// GenerateStream creates a streaming completion
func (c *Client) GenerateStream(ctx context.Context, req ai.GenerateRequest) (<-chan ai.StreamChunk, error) {
	ch := make(chan ai.StreamChunk)
	
	go func() {
		defer close(ch)
		
		// Build request (similar to Generate)
		ollamaReq := GenerateRequest{
			Model:  req.Model,
			Prompt: req.Prompt,
			Stream: true,
			Options: Options{
				Temperature: req.Temperature,
				NumPredict:  req.MaxTokens,
			},
		}

		if ollamaReq.Model == "" {
			ollamaReq.Model = c.config.Model
			if ollamaReq.Model == "" {
				ollamaReq.Model = "codellama:13b-instruct"
			}
		}

		body, err := json.Marshal(ollamaReq)
		if err != nil {
			ch <- ai.StreamChunk{Error: err}
			return
		}

		httpReq, err := http.NewRequestWithContext(ctx, "POST", c.baseURL+"/api/generate", bytes.NewReader(body))
		if err != nil {
			ch <- ai.StreamChunk{Error: err}
			return
		}
		httpReq.Header.Set("Content-Type", "application/json")

		resp, err := c.httpClient.Do(httpReq)
		if err != nil {
			ch <- ai.StreamChunk{Error: err}
			return
		}
		defer resp.Body.Close()

		decoder := json.NewDecoder(resp.Body)
		for {
			var chunk GenerateResponse
			if err := decoder.Decode(&chunk); err != nil {
				if err != io.EOF {
					ch <- ai.StreamChunk{Error: err}
				}
				break
			}

			ch <- ai.StreamChunk{
				Content: chunk.Response,
				Done:    chunk.Done,
			}

			if chunk.Done {
				break
			}
		}
	}()

	return ch, nil
}

// ListModels returns available models
func (c *Client) ListModels(ctx context.Context) ([]ai.Model, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", c.baseURL+"/api/tags", nil)
	if err != nil {
		return nil, &ai.ProviderError{
			Provider: ai.ProviderOllama,
			Code:     "REQUEST_ERROR",
			Message:  "Failed to create request",
			Err:      err,
		}
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, &ai.ProviderError{
			Provider: ai.ProviderOllama,
			Code:     "NETWORK_ERROR",
			Message:  "Failed to list models",
			Err:      err,
		}
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, &ai.ProviderError{
			Provider: ai.ProviderOllama,
			Code:     fmt.Sprintf("HTTP_%d", resp.StatusCode),
			Message:  fmt.Sprintf("API error: %s", string(body)),
		}
	}

	var result ModelsResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, &ai.ProviderError{
			Provider: ai.ProviderOllama,
			Code:     "PARSE_ERROR",
			Message:  "Failed to parse models response",
			Err:      err,
		}
	}

	// Convert to standard models
	models := make([]ai.Model, len(result.Models))
	for i, m := range result.Models {
		models[i] = ai.Model{
			ID:          m.Name,
			Name:        m.Name,
			Provider:    ai.ProviderOllama,
			Description: fmt.Sprintf("Size: %s, Modified: %s", formatBytes(m.Size), m.ModifiedAt.Format(time.RFC3339)),
			Context:     4096, // Default, could be parsed from model info
			CreatedAt:   m.ModifiedAt,
		}
	}

	return models, nil
}

// HealthCheck verifies Ollama is accessible
func (c *Client) HealthCheck(ctx context.Context) error {
	req, err := http.NewRequestWithContext(ctx, "GET", c.baseURL+"/api/tags", nil)
	if err != nil {
		return &ai.ProviderError{
			Provider: ai.ProviderOllama,
			Code:     "REQUEST_ERROR",
			Message:  "Failed to create health check request",
			Err:      err,
		}
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return &ai.ProviderError{
			Provider: ai.ProviderOllama,
			Code:     "CONNECTION_ERROR",
			Message:  "Cannot connect to Ollama. Make sure Ollama is running (ollama serve)",
			Err:      err,
		}
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return &ai.ProviderError{
			Provider: ai.ProviderOllama,
			Code:     fmt.Sprintf("HTTP_%d", resp.StatusCode),
			Message:  "Ollama API is not responding correctly",
		}
	}

	return nil
}

// Helper function to format bytes
func formatBytes(bytes int64) string {
	const unit = 1024
	if bytes < unit {
		return fmt.Sprintf("%d B", bytes)
	}
	div, exp := int64(unit), 0
	for n := bytes / unit; n >= unit; n /= unit {
		div *= unit
		exp++
	}
	return fmt.Sprintf("%.1f %cB", float64(bytes)/float64(div), "KMGTPE"[exp])
}