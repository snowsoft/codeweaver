package cmd

import (
	"fmt"
	"strings"

	"github.com/pterm/pterm"
	"github.com/snowsoft/codeweaver/internal/diff"
	"github.com/snowsoft/codeweaver/internal/ollama"
	"github.com/snowsoft/codeweaver/internal/ui"
	"github.com/snowsoft/codeweaver/internal/utils"
	"github.com/spf13/cobra"
)

var documentStyle string

// documentCmd represents the document command
var documentCmd = &cobra.Command{
	Use:   "document <file_name>",
	Short: "Add documentation to code",
	Long: `Analyze code and add appropriate documentation comments.
    
The tool will detect the programming language and add documentation
in the appropriate style (JSDoc, PHPDoc, GoDoc, etc.).`,
	Args: cobra.ExactArgs(1),
	RunE: runDocument,
}

func init() {
	rootCmd.AddCommand(documentCmd)

	documentCmd.Flags().StringVarP(&documentStyle, "style", "s", "", "Documentation style (jsdoc, phpdoc, godoc, etc.)")
}

func runDocument(cmd *cobra.Command, args []string) error {
	fileName := args[0]

	// Check if file exists
	if !utils.FileExists(fileName) {
		return fmt.Errorf("file %s does not exist", fileName)
	}

	// Create spinner
	spinner, err := pterm.DefaultSpinner.Start("Analyzing code structure...")
	if err != nil {
		// Continue without spinner
		pterm.Warning.Println("Failed to start spinner")
	}

	// Read original file
	originalCode, err := utils.ReadFile(fileName)
	if err != nil {
		spinner.Fail(fmt.Sprintf("Failed to read file: %v", err))
		return err
	}

	// Detect language
	language := utils.DetectLanguage(fileName)

	// Determine documentation style
	if documentStyle == "" {
		documentStyle = getDefaultDocStyle(language)
	}

	spinner.UpdateText("Generating documentation...")

	// Initialize Ollama client
	client := ollama.NewClient(cfg.Ollama.APIURL, cfg.Ollama.Model, cfg.Ollama.Temperature)

	// Build prompt
	prompt := buildDocumentPrompt(language, documentStyle, originalCode)

	// Generate documented code
	documentedCode, err := client.Generate(cmd.Context(), prompt)
	if err != nil {
		spinner.Fail(fmt.Sprintf("Failed to generate documentation: %v", err))
		return err
	}

	spinner.Success("Documentation generated successfully!")

	// Show diff
	diffViewer := diff.NewViewer()
	diffOutput := diffViewer.GenerateDiff(originalCode, documentedCode, fileName)

	pterm.DefaultHeader.Println("Proposed Documentation")
	fmt.Println(diffOutput)

	// Interactive confirmation
	action := ui.AskForAction()

	switch action {
	case ui.ActionAccept:
		// Apply changes
		if err := utils.WriteFile(fileName, documentedCode); err != nil {
			return fmt.Errorf("failed to write file: %w", err)
		}
		pterm.Success.Printf("Documentation added to %s\n", fileName)

	case ui.ActionDecline:
		pterm.Warning.Println("Documentation cancelled.")

	case ui.ActionEdit:
		// Open editor for manual editing
		editedCode, err := ui.OpenEditor(documentedCode)
		if err != nil {
			return fmt.Errorf("failed to open editor: %w", err)
		}

		if ui.ConfirmAction("Apply edited documentation?") {
			if err := utils.WriteFile(fileName, editedCode); err != nil {
				return fmt.Errorf("failed to write file: %w", err)
			}
			pterm.Success.Printf("Edited documentation applied to %s\n", fileName)
		}
	}

	return nil
}

func buildDocumentPrompt(language, style, code string) string {
	styleGuide := getStyleGuide(style)

	prompt := fmt.Sprintf(`You are an expert %s developer. Add comprehensive documentation to the following code.

Documentation style: %s
%s

Current code:
%s

Requirements:
1. Document all public functions, methods, and classes
2. Include parameter descriptions and return value documentation
3. Add examples where appropriate
4. Document complex logic with inline comments
5. Follow the %s documentation conventions exactly
6. Do not change the code logic, only add documentation

Generate the complete file with documentation added, without any explanations or markdown formatting.`,
		language, style, styleGuide, code, style)

	return prompt
}

func getDefaultDocStyle(language string) string {
	switch strings.ToLower(language) {
	case "javascript", "typescript":
		return "jsdoc"
	case "php":
		return "phpdoc"
	case "go":
		return "godoc"
	case "python":
		return "google"
	case "java":
		return "javadoc"
	case "c#", "csharp":
		return "xmldoc"
	default:
		return "standard"
	}
}

func getStyleGuide(style string) string {
	switch strings.ToLower(style) {
	case "jsdoc":
		return `
JSDoc style example:
/**
 * Description of the function.
 * @param {string} param1 - Description of param1
 * @param {number} param2 - Description of param2
 * @returns {boolean} Description of return value
 * @example
 * functionName("test", 123);
 */`
	case "phpdoc":
		return `
PHPDoc style example:
/**
 * Description of the function.
 *
 * @param string $param1 Description of param1
 * @param int $param2 Description of param2
 * @return bool Description of return value
 * @throws Exception When something goes wrong
 */`
	case "godoc":
		return `
GoDoc style example:
// FunctionName does something important.
// It takes param1 and param2 and returns a boolean value.
//
// Example:
//
//	result := FunctionName("test", 123)
//	if result {
//		// handle success
//	}`
	case "google":
		return `
Google Python style example:
"""Brief description of the function.

Longer description if needed.

Args:
    param1 (str): Description of param1.
    param2 (int): Description of param2.

Returns:
    bool: Description of return value.

Raises:
    ValueError: When invalid input is provided.

Example:
    >>> function_name("test", 123)
    True
"""`
	default:
		return "Use appropriate documentation style for the language."
	}
}
