package ollama

import "time"

// GenerateRequest represents an Ollama generation request
type GenerateRequest struct {
    Model   string  `json:"model"`
    Prompt  string  `json:"prompt"`
    Stream  bool    `json:"stream"`
    Options Options `json:"options,omitempty"`
    System  string  `json:"system,omitempty"`
    Context []int   `json:"context,omitempty"`
}

// Options for generation
type Options struct {
    Temperature float64 `json:"temperature,omitempty"`
    NumPredict  int     `json:"num_predict,omitempty"`
    TopK        int     `json:"top_k,omitempty"`
    TopP        float64 `json:"top_p,omitempty"`
    RepeatPenalty float64 `json:"repeat_penalty,omitempty"`
    Seed        int     `json:"seed,omitempty"`
    NumCtx      int     `json:"num_ctx,omitempty"`
}

// GenerateResponse represents an Ollama generation response
type GenerateResponse struct {
    Model              string    `json:"model"`
    CreatedAt          time.Time `json:"created_at"`
    Response           string    `json:"response"`
    Done               bool      `json:"done"`
    Context            []int     `json:"context,omitempty"`
    TotalDuration      int64     `json:"total_duration,omitempty"`
    LoadDuration       int64     `json:"load_duration,omitempty"`
    PromptEvalCount    int       `json:"prompt_eval_count,omitempty"`
    PromptEvalDuration int64     `json:"prompt_eval_duration,omitempty"`
    EvalCount          int       `json:"eval_count,omitempty"`
    EvalDuration       int64     `json:"eval_duration,omitempty"`
}

// ModelsResponse represents the response from /api/tags
type ModelsResponse struct {
    Models []ModelInfo `json:"models"`
}

// ModelInfo represents information about a model
type ModelInfo struct {
    Name       string    `json:"name"`
    ModifiedAt time.Time `json:"modified_at"`
    Size       int64     `json:"size"`
    Digest     string    `json:"digest"`
    Details    Details   `json:"details,omitempty"`
}

// Details about a model
type Details struct {
    Format            string   `json:"format"`
    Family            string   `json:"family"`
    Families          []string `json:"families"`
    ParameterSize     string   `json:"parameter_size"`
    QuantizationLevel string   `json:"quantization_level"`
}
