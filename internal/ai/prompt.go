// internal/ai/prompt.go
package ai

import (
	"fmt"
	"strings"
)

// PromptType represents different types of prompts
type PromptType string

const (
	PromptTypeNew           PromptType = "new"
	PromptTypeRefactor      PromptType = "refactor"
	PromptTypeDocument      PromptType = "document"
	PromptTypeTest          PromptType = "test"
	PromptTypeReview        PromptType = "review"
	PromptTypeHealProject   PromptType = "heal-project"
	PromptTypeAsk           PromptType = "ask"
	PromptTypeAnalyzeImpact PromptType = "analyze-impact"
	PromptTypePlanFeature   PromptType = "plan-feature"
)

// SystemPromptConfig holds configuration for system prompts
type SystemPromptConfig struct {
	ModelType      string // "local" or "cloud"
	Language       string
	Framework      string
	ProjectType    string
	StyleGuide     string
	ContextWindow  int
}

// PromptBuilder constructs prompts based on configuration
type PromptBuilder struct {
	config SystemPromptConfig
}

// NewPromptBuilder creates a new prompt builder
func NewPromptBuilder(config SystemPromptConfig) *PromptBuilder {
	return &PromptBuilder{
		config: config,
	}
}

// GetSystemPrompt returns the base system prompt
func (pb *PromptBuilder) GetSystemPrompt() string {
	if pb.config.ModelType == "local" {
		return pb.getLocalModelPrompt()
	}
	return pb.getCloudModelPrompt()
}

// getLocalModelPrompt returns optimized prompt for local models
func (pb *PromptBuilder) getLocalModelPrompt() string {
	return `# CodeWeaver AI Assistant

## Identity
You are CodeWeaver AI assistant. Act as a proactive software development partner to generate, analyze, and improve code.

## Core Rules

### 1. CODE GENERATION
- ALWAYS: Apply best practices
- ALWAYS: Add type hints/annotations
- ALWAYS: Include error handling
- ALWAYS: Add docstrings/comments
- NEVER: Generate insecure code
- NEVER: Hardcode secrets/passwords

### 2. PROJECT CONTEXT
When context provided:
- Follow existing code style
- Use same naming conventions
- Match project structure
- Keep import patterns

### 3. PROACTIVE BEHAVIOR
For each command:
- Suggest next steps
- Identify missing parts
- Propose improvements
- Warn about risks

## Output Formats

### Code Generation
- Include comprehensive error handling
- Add type annotations
- Document with docstrings
- Follow project conventions

### Analysis Reports
🔍 Analysis Complete

🔴 Critical: Security risks, crash potential
🟡 Medium: Performance, deprecated code
🟢 Low: Style issues, unused code

### Proactive Suggestions
✨ Suggestions:
- Missing tests → weaver test <file>
- Missing docs → weaver document <file>
- Type hints needed → weaver refactor --add-types

REMEMBER: Be proactive, suggest improvements, identify risks, provide solutions.`
}

// getCloudModelPrompt returns full prompt for cloud models
func (pb *PromptBuilder) getCloudModelPrompt() string {
	// Return the full detailed prompt for cloud models with larger context windows
	return getFullSystemPrompt()
}

// BuildPrompt constructs a complete prompt for a specific command
func (pb *PromptBuilder) BuildPrompt(cmdType PromptType, task string, context map[string]interface{}) string {
	systemPrompt := pb.GetSystemPrompt()
	
	var taskPrompt string
	switch cmdType {
	case PromptTypeNew:
		taskPrompt = pb.buildNewPrompt(task, context)
	case PromptTypeRefactor:
		taskPrompt = pb.buildRefactorPrompt(task, context)
	case PromptTypeHealProject:
		taskPrompt = pb.buildHealProjectPrompt(task, context)
	case PromptTypeAsk:
		taskPrompt = pb.buildAskPrompt(task, context)
	case PromptTypeAnalyzeImpact:
		taskPrompt = pb.buildAnalyzeImpactPrompt(task, context)
	default:
		taskPrompt = fmt.Sprintf("Task: %s", task)
	}
	
	// Add context information
	contextPrompt := pb.buildContextPrompt(context)
	
	// Combine all parts
	return fmt.Sprintf("%s\n\n%s\n\n%s", systemPrompt, contextPrompt, taskPrompt)
}

// buildNewPrompt constructs prompt for new code generation
func (pb *PromptBuilder) buildNewPrompt(task string, context map[string]interface{}) string {
	prompt := fmt.Sprintf(`## Command: NEW - Generate Code

Task: %s

Requirements:
1. Generate production-ready code
2. Include error handling
3. Add type hints/annotations
4. Include docstrings/comments
5. Follow project conventions if context provided

After generating code, suggest:
- Test file creation
- Documentation needs
- Required dependencies
- Next implementation steps`, task)

	if file, ok := context["filename"].(string); ok {
		prompt += fmt.Sprintf("\n\nTarget file: %s", file)
	}
	
	return prompt
}

// buildRefactorPrompt constructs prompt for code refactoring
func (pb *PromptBuilder) buildRefactorPrompt(task string, context map[string]interface{}) string {
	prompt := fmt.Sprintf(`## Command: REFACTOR - Improve Code

Task: %s

Process:
1. Analyze existing code
2. Identify improvement areas
3. Apply refactoring
4. Maintain functionality
5. Improve readability

Focus on:
- Code quality
- Performance optimization
- Security improvements
- Modern syntax
- Best practices`, task)

	if code, ok := context["current_code"].(string); ok {
		prompt += fmt.Sprintf("\n\nCurrent code:\n```\n%s\n```", code)
	}
	
	return prompt
}

// buildHealProjectPrompt constructs prompt for project healing
func (pb *PromptBuilder) buildHealProjectPrompt(task string, context map[string]interface{}) string {
	return `## Command: HEAL-PROJECT - Analyze and Fix Project Issues

Analyze the entire project for:

🔴 CRITICAL Issues:
- Security vulnerabilities (SQL injection, XSS, exposed secrets)
- Crash risks and unhandled exceptions
- Memory leaks and resource management

🟡 MEDIUM Issues:
- Performance problems (N+1 queries, inefficient loops)
- Deprecated dependencies or functions
- Missing error handling

🟢 LOW Priority:
- Code style inconsistencies
- Unused imports or dead code
- Missing documentation

Output Format:
1. Categorized issue list with locations
2. Specific fix commands for each issue
3. Priority-ordered action plan
4. Estimated time for fixes`
}

// buildAskPrompt constructs prompt for natural language queries
func (pb *PromptBuilder) buildAskPrompt(query string, context map[string]interface{}) string {
	return fmt.Sprintf(`## Command: ASK - Natural Language Query

Question: %s

Process:
1. Understand the question intent
2. Search through codebase
3. Find relevant files and functions
4. Provide specific locations

Output Format:
📍 Relevant locations:
- File paths with line numbers
- Function/class names
- Brief explanation
- Related files

Include actionable suggestions when appropriate.`, query)
}

// buildAnalyzeImpactPrompt constructs prompt for impact analysis
func (pb *PromptBuilder) buildAnalyzeImpactPrompt(scenario string, context map[string]interface{}) string {
	return fmt.Sprintf(`## Command: ANALYZE-IMPACT - Change Impact Analysis

Scenario: %s

Analyze:
1. Directly affected files
2. Dependent components
3. Test coverage impact
4. API contract changes
5. Database schema changes

Output Format:
📊 Impact Analysis Report:

Affected Areas:
- Files: List with specific changes needed
- APIs: Endpoints that need updates
- Database: Schema migrations required
- Tests: Test files requiring updates

Risk Assessment: [Low|Medium|High]
Estimated Effort: [Hours|Days|Weeks]
Recommended Approach: Step-by-step plan`, scenario)
}

// buildContextPrompt builds the context section of the prompt
func (pb *PromptBuilder) buildContextPrompt(context map[string]interface{}) string {
	if len(context) == 0 {
		return ""
	}
	
	var parts []string
	parts = append(parts, "## Project Context")
	
	// Add configuration context
	if pb.config.Language != "" {
		parts = append(parts, fmt.Sprintf("Language: %s", pb.config.Language))
	}
	if pb.config.Framework != "" {
		parts = append(parts, fmt.Sprintf("Framework: %s", pb.config.Framework))
	}
	if pb.config.ProjectType != "" {
		parts = append(parts, fmt.Sprintf("Project Type: %s", pb.config.ProjectType))
	}
	if pb.config.StyleGuide != "" {
		parts = append(parts, fmt.Sprintf("Style Guide: %s", pb.config.StyleGuide))
	}
	
	// Add dynamic context
	if projectPath, ok := context["project_path"].(string); ok {
		parts = append(parts, fmt.Sprintf("Project Path: %s", projectPath))
	}
	if dependencies, ok := context["dependencies"].([]string); ok {
		parts = append(parts, fmt.Sprintf("Dependencies: %s", strings.Join(dependencies, ", ")))
	}
	
	return strings.Join(parts, "\n")
}

// getFullSystemPrompt returns the complete system prompt for cloud models
func getFullSystemPrompt() string {
	// This would contain the full detailed prompt from the original artifact
	// Truncated here for brevity, but would include all sections from the detailed prompt
	return `[Full detailed system prompt would go here...]`
}

// OptimizeForModel adjusts prompt based on model capabilities
func (pb *PromptBuilder) OptimizeForModel(prompt string, modelName string) string {
	modelConfigs := map[string]struct {
		maxTokens int
		style     string
	}{
		"codellama:7b": {
			maxTokens: 4096,
			style:     "concise",
		},
		"codellama:13b": {
			maxTokens: 8192,
			style:     "balanced",
		},
		"codellama:34b": {
			maxTokens: 16384,
			style:     "detailed",
		},
		"llama2:7b": {
			maxTokens: 4096,
			style:     "concise",
		},
		"mixtral:8x7b": {
			maxTokens: 32768,
			style:     "detailed",
		},
	}
	
	config, exists := modelConfigs[modelName]
	if !exists {
		return prompt // Return unchanged if model not recognized
	}
	
	// Truncate if needed
	if len(prompt) > config.maxTokens*3 { // Rough estimate: 1 token ≈ 3 chars
		prompt = prompt[:config.maxTokens*3]
		prompt += "\n\n[Prompt truncated due to model context limit]"
	}
	
	// Adjust style based on model
	switch config.style {
	case "concise":
		// Add instruction for concise output
		prompt = "Provide concise, code-focused responses. Minimize explanations.\n\n" + prompt
	case "detailed":
		// Allow more detailed explanations
		prompt = "Provide comprehensive responses with explanations where helpful.\n\n" + prompt
	}
	
	return prompt
}

// internal/ai/client.go additions
package ai

import (
	"context"
	"fmt"
)

// ClientConfig holds AI client configuration
type ClientConfig struct {
	Provider      string // "ollama", "openai", "anthropic"
	Model         string
	Temperature   float64
	MaxTokens     int
	SystemPrompt  string
	PromptBuilder *PromptBuilder
}

// EnhancedClient wraps the basic AI client with prompt management
type EnhancedClient struct {
	*Client
	promptBuilder *PromptBuilder
}

// NewEnhancedClient creates a new enhanced AI client
func NewEnhancedClient(config ClientConfig) (*EnhancedClient, error) {
	// Create base client
	baseClient, err := NewClient(config.Provider, config.Model, config.Temperature)
	if err != nil {
		return nil, err
	}
	
	// Create prompt builder
	promptConfig := SystemPromptConfig{
		ModelType:     "local",
		Language:      "", // Will be set per request
		Framework:     "", // Will be set per request
		ProjectType:   "", // Will be set per request
		StyleGuide:    "", // Will be set per request
		ContextWindow: config.MaxTokens,
	}
	
	if config.Provider == "openai" || config.Provider == "anthropic" {
		promptConfig.ModelType = "cloud"
	}
	
	promptBuilder := NewPromptBuilder(promptConfig)
	
	return &EnhancedClient{
		Client:        baseClient,
		promptBuilder: promptBuilder,
	}, nil
}

// GenerateWithCommand generates content using a specific command type
func (ec *EnhancedClient) GenerateWithCommand(
	ctx context.Context,
	cmdType PromptType,
	task string,
	context map[string]interface{},
) (string, error) {
	// Build the complete prompt
	prompt := ec.promptBuilder.BuildPrompt(cmdType, task, context)
	
	// Optimize for specific model
	prompt = ec.promptBuilder.OptimizeForModel(prompt, ec.Model)
	
	// Generate using base client
	return ec.Generate(ctx, prompt)
}

// UpdateProjectContext updates the prompt builder's configuration
func (ec *EnhancedClient) UpdateProjectContext(
	language, framework, projectType, styleGuide string,
) {
	ec.promptBuilder.config.Language = language
	ec.promptBuilder.config.Framework = framework
	ec.promptBuilder.config.ProjectType = projectType
	ec.promptBuilder.config.StyleGuide = styleGuide
}