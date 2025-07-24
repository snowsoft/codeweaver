package cmd

import (
    "fmt"
    "os"
    "path/filepath"
    "strings"
    
    "github.com/pterm/pterm"
    "github.com/spf13/cobra"
    "github.com/snowsoft/codeweaver/internal/ollama"
    "github.com/snowsoft/codeweaver/internal/ui"
    "github.com/snowsoft/codeweaver/internal/utils"
)

var testFramework string

// testCmd represents the test command
var testCmd = &cobra.Command{
    Use:   "test <file_name>",
    Short: "Generate unit tests for code",
    Long: `Analyze code and generate comprehensive unit tests.
    
The tool will create test files following the conventions of the specified
testing framework (Jest, pytest, PHPUnit, etc.).`,
    Args: cobra.ExactArgs(1),
    RunE: runTest,
}

func init() {
    rootCmd.AddCommand(testCmd)
    
    testCmd.Flags().StringVarP(&testFramework, "framework", "f", "", "Testing framework (jest, pytest, phpunit, etc.)")
}

func runTest(cmd *cobra.Command, args []string) error {
    fileName := args[0]
    
    // Check if file exists
    if !utils.FileExists(fileName) {
        return fmt.Errorf("file %s does not exist", fileName)
    }
    
    // Create spinner
    spinner, _ := pterm.DefaultSpinner.Start("Analyzing code for test generation...")
    
    // Read source file
    sourceCode, err := utils.ReadFile(fileName)
    if err != nil {
        spinner.Fail(fmt.Sprintf("Failed to read file: %v", err))
        return err
    }
    
    // Detect language
    language := utils.DetectLanguage(fileName)
    
    // Determine test framework
    if testFramework == "" {
        testFramework = getDefaultTestFramework(language)
    }
    
    // Generate test file name
    testFileName := generateTestFileName(fileName, language)
    
    spinner.UpdateText("Generating unit tests...")
    
    // Initialize Ollama client
    client := ollama.NewClient(cfg.Ollama.APIURL, cfg.Ollama.Model, cfg.Ollama.Temperature)
    
    // Build prompt
    prompt := buildTestPrompt(language, testFramework, sourceCode, fileName)
    
    // Generate tests
    testCode, err := client.Generate(cmd.Context(), prompt)
    if err != nil {
        spinner.Fail(fmt.Sprintf("Failed to generate tests: %v", err))
        return err
    }
    
    spinner.Success("Tests generated successfully!")
    
    // Display generated tests
    pterm.DefaultHeader.Println("Generated Tests")
    pterm.DefaultBox.Println(testCode)
    
    // Ask for confirmation
    suggestedPath := testFileName
    pterm.Info.Printf("Suggested test file: %s\n", suggestedPath)
    
    if !ui.ConfirmAction("Save tests to this file?") {
        // Ask for custom path
        customPath := ui.AskForInput("Enter custom path for test file:")
        if customPath != "" {
            suggestedPath = customPath
        } else {
            pterm.Warning.Println("Test generation cancelled.")
            return nil
        }
    }
    
    // Check if test file exists
    if utils.FileExists(suggestedPath) {
        if !ui.ConfirmAction(fmt.Sprintf("File %s already exists. Overwrite?", suggestedPath)) {
            pterm.Warning.Println("Operation cancelled.")
            return nil
        }
    }
    
    // Create directory if needed
    dir := filepath.Dir(suggestedPath)
    if dir != "." && dir != "" {
        if err := os.MkdirAll(dir, 0755); err != nil {
            return fmt.Errorf("failed to create directory: %w", err)
        }
    }
    
    // Save test file
    if err := utils.WriteFile(suggestedPath, testCode); err != nil {
        return fmt.Errorf("failed to write test file: %w", err)
    }
    
    pterm.Success.Printf("Tests saved to %s\n", suggestedPath)
    
    // Show next steps
    showTestingInstructions(language, testFramework, suggestedPath)
    
    return nil
}

func buildTestPrompt(language, framework, code, fileName string) string {
    prompt := fmt.Sprintf(`You are an expert %s developer specializing in testing. Generate comprehensive unit tests for the following code using %s.

Source file: %s
Testing framework: %s

Source code:
%s

Requirements:
1. Test all public functions and methods
2. Include edge cases and error conditions
3. Use descriptive test names that explain what is being tested
4. Follow %s testing best practices
5. Include setup and teardown when necessary
6. Aim for high code coverage
7. Use mocking/stubbing where appropriate
8. Include both positive and negative test cases

Generate only the test code, ready to be saved as a test file, without any explanations or markdown formatting.`,
        language, framework, fileName, framework, code, framework)
    
    return prompt
}

func generateTestFileName(sourceFile, language string) string {
    dir := filepath.Dir(sourceFile)
    base := filepath.Base(sourceFile)
    ext := filepath.Ext(base)
    nameWithoutExt := strings.TrimSuffix(base, ext)
    
    switch strings.ToLower(language) {
    case "javascript", "typescript":
        // test.js or spec.js pattern
        return filepath.Join(dir, "__tests__", nameWithoutExt+".test"+ext)
    case "python":
        // test_*.py pattern
        return filepath.Join(dir, "tests", "test_"+base)
    case "go":
        // *_test.go pattern
        return filepath.Join(dir, nameWithoutExt+"_test"+ext)
    case "php":
        // *Test.php pattern
        baseName := strings.TrimSuffix(base, ext)
        // Capitalize first letter manually
        className := strings.ToUpper(baseName[:1]) + baseName[1:]
        return filepath.Join(dir, "tests", className+"Test"+ext)
    case "java":
        // *Test.java pattern
        return filepath.Join(dir, nameWithoutExt+"Test"+ext)
    default:
        return filepath.Join(dir, "tests", "test_"+base)
    }
}

func getDefaultTestFramework(language string) string {
    // Check config first
    if cfg != nil && cfg.Languages != nil {
        if langConfig, ok := cfg.Languages[strings.ToLower(language)]; ok {
            if langConfig.TestFramework != "" {
                return langConfig.TestFramework
            }
        }
    }
    
    // Fallback to defaults
    switch strings.ToLower(language) {
    case "javascript", "typescript":
        return "jest"
    case "python":
        return "pytest"
    case "go":
        return "testing"
    case "php":
        return "phpunit"
    case "java":
        return "junit"
    case "c#", "csharp":
        return "nunit"
    case "ruby":
        return "rspec"
    default:
        return "native"
    }
}

func showTestingInstructions(_ string, framework, testFile string) {
    pterm.DefaultSection.Println("Next Steps")
    
    instructions := map[string]map[string]string{
        "jest": {
            "install": "npm install --save-dev jest",
            "run":     fmt.Sprintf("npx jest %s", testFile),
        },
        "pytest": {
            "install": "pip install pytest",
            "run":     fmt.Sprintf("pytest %s", testFile),
        },
        "phpunit": {
            "install": "composer require --dev phpunit/phpunit",
            "run":     fmt.Sprintf("./vendor/bin/phpunit %s", testFile),
        },
        "testing": {
            "install": "No installation needed (built-in)",
            "run":     fmt.Sprintf("go test %s", filepath.Dir(testFile)),
        },
    }
    
    if inst, ok := instructions[framework]; ok {
        pterm.Info.Println("To run the tests:")
        if inst["install"] != "No installation needed (built-in)" {
            pterm.DefaultBasicText.Printf("1. Install %s: %s\n", framework, inst["install"])
            pterm.DefaultBasicText.Printf("2. Run tests: %s\n", inst["run"])
        } else {
            pterm.DefaultBasicText.Printf("Run tests: %s\n", inst["run"])
        }
    }
}