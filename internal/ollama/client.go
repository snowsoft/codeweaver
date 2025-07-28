// Package ollama provides a client for interacting with the Ollama API
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
)

// Client represents an Ollama API client
type Client struct {
    baseURL     string
    model       string
    temperature float32
    httpClient  *http.Client
}

// GenerateRequest represents a request to the Ollama generate endpoint
type GenerateRequest struct {
    Model       string  `json:"model"`
    Prompt      string  `json:"prompt"`
    Temperature float32 `json:"temperature,omitempty"`
    Stream      bool    `json:"stream"`
}

// GenerateResponse represents a response from the Ollama generate endpoint
type GenerateResponse struct {
    Model      string    `json:"model"`
    Response   string    `json:"response"`
    Done       bool      `json:"done"`
    Context    []int     `json:"context,omitempty"`
    CreatedAt  time.Time `json:"created_at"`
    TotalDuration   int64     `json:"total_duration,omitempty"`
    LoadDuration    int64     `json:"load_duration,omitempty"`
    PromptEvalCount int       `json:"prompt_eval_count,omitempty"`
    EvalCount       int       `json:"eval_count,omitempty"`
}

// NewClient creates a new Ollama API client
func NewClient(baseURL, model string, temperature float32, timeout time.Duration) *Client {
    if timeout == 0 {
        timeout = 120 * time.Second
    }
    return &Client{
        baseURL:     strings.TrimRight(baseURL, "/"),
        model:       model,
        temperature: temperature,
        httpClient: &http.Client{
            Timeout: timeout,
        },
    }
}

// Generate sends a generation request to Ollama and returns the response
func (c *Client) Generate(ctx context.Context, prompt string) (string, error) {
    req := GenerateRequest{
        Model:       c.model,
        Prompt:      prompt,
        Temperature: c.temperature,
        Stream:      false,
    }
    
    jsonData, err := json.Marshal(req)
    if err != nil {
        return "", fmt.Errorf("failed to marshal request: %w", err)
    }
    
    httpReq, err := http.NewRequestWithContext(ctx, "POST", c.baseURL+"/api/generate", bytes.NewBuffer(jsonData))
    if err != nil {
        return "", fmt.Errorf("failed to create request: %w", err)
    }
    
    httpReq.Header.Set("Content-Type", "application/json")
    
    resp, err := c.httpClient.Do(httpReq)
    if err != nil {
        return "", fmt.Errorf("failed to send request: %w", err)
    }
    defer resp.Body.Close()
    
    if resp.StatusCode != http.StatusOK {
        body, err := io.ReadAll(resp.Body)
        if err != nil {
            return "", fmt.Errorf("API returned status %d and failed to read body: %w", resp.StatusCode, err)
        }
        return "", fmt.Errorf("API returned status %d: %s", resp.StatusCode, string(body))
    }
    
    var generateResp GenerateResponse
    if err := json.NewDecoder(resp.Body).Decode(&generateResp); err != nil {
        return "", fmt.Errorf("failed to decode response: %w", err)
    }
    
    return cleanResponse(generateResp.Response), nil
}

// cleanResponse removes any markdown code block markers that might be in the response
func cleanResponse(response string) string {
    // Remove markdown code block markers if present
    response = strings.TrimSpace(response)
    
    // Remove opening code block with language identifier
    if strings.HasPrefix(response, "```") {
        lines := strings.Split(response, "\n")
        if len(lines) > 1 {
            // Remove first line (```language)
            lines = lines[1:]
            response = strings.Join(lines, "\n")
        }
    }
    
    // Remove closing code block
    response = strings.TrimSuffix(response, "```")
    
    return strings.TrimSpace(response)
}

// TestConnection tests if the Ollama API is accessible
func (c *Client) TestConnection() error {
    resp, err := c.httpClient.Get(c.baseURL + "/api/tags")
    if err != nil {
        return fmt.Errorf("failed to connect to Ollama API: %w", err)
    }
    defer resp.Body.Close()
    
    if resp.StatusCode != http.StatusOK {
        return fmt.Errorf("Ollama API returned status %d", resp.StatusCode)
    }
    
    return nil
}