#!/bin/bash
# Complete removal of pterm and replacement with simple alternatives

echo "Removing pterm completely..."

# Step 1: Replace all pterm imports
echo "Step 1: Replacing imports..."
find . -name "*.go" -type f -exec sed -i 's|"github.com/pterm/pterm"||g' {} \;

# Step 2: Replace pterm usage with ui package calls
echo "Step 2: Updating code..."

# Replace spinner starts
find . -name "*.go" -type f -exec sed -i 's|pterm\.DefaultSpinner\.Start(\(.*\))|ui.StartSpinner(\1)|g' {} \;

# Replace pterm.Warning
find . -name "*.go" -type f -exec sed -i 's|pterm\.Warning\.Println(\(.*\))|ui.PrintWarning(\1)|g' {} \;
find . -name "*.go" -type f -exec sed -i 's|pterm\.Warning\.Printf(\(.*\))|ui.PrintWarning(\1)|g' {} \;

# Replace pterm.Success
find . -name "*.go" -type f -exec sed -i 's|pterm\.Success\.Printf(\(.*\))|ui.PrintSuccess(\1)|g' {} \;
find . -name "*.go" -type f -exec sed -i 's|pterm\.Success\.Println(\(.*\))|ui.PrintSuccess(\1)|g' {} \;

# Replace pterm.Info
find . -name "*.go" -type f -exec sed -i 's|pterm\.Info\.Printf(\(.*\))|ui.PrintInfo(\1)|g' {} \;
find . -name "*.go" -type f -exec sed -i 's|pterm\.Info\.Println(\(.*\))|ui.PrintInfo(\1)|g' {} \;

# Replace pterm.DefaultHeader
find . -name "*.go" -type f -exec sed -i 's|pterm\.DefaultHeader\.Println(\(.*\))|ui.PrintHeader(\1)|g' {} \;
find . -name "*.go" -type f -exec sed -i 's|pterm\.DefaultHeader\.WithFullWidth()\.Printf(\(.*\))|ui.PrintHeader(\1)|g' {} \;

# Replace pterm.DefaultSection
find . -name "*.go" -type f -exec sed -i 's|pterm\.DefaultSection\.Println(\(.*\))|fmt.Println(\1)|g' {} \;

# Replace pterm.DefaultBox
find . -name "*.go" -type f -exec sed -i 's|pterm\.DefaultBox\.Println(\(.*\))|fmt.Println(\1)|g' {} \;

# Replace pterm.DefaultParagraph
find . -name "*.go" -type f -exec sed -i 's|pterm\.DefaultParagraph\.Println(\(.*\))|fmt.Println(\1)|g' {} \;

# Replace pterm.DefaultBasicText
find . -name "*.go" -type f -exec sed -i 's|pterm\.DefaultBasicText\.[^(]*(\([^)]*\))\.Println(\(.*\))|fmt.Println(\2)|g' {} \;

# Replace color functions
find . -name "*.go" -type f -exec sed -i 's|pterm\.Red(|color.RedString(|g' {} \;
find . -name "*.go" -type f -exec sed -i 's|pterm\.Green(|color.GreenString(|g' {} \;
find . -name "*.go" -type f -exec sed -i 's|pterm\.Yellow(|color.YellowString(|g' {} \;

# Step 3: Update go.mod
echo "Step 3: Updating go.mod..."
cat > go.mod << 'EOF'
module github.com/snowsoft/codeweaver

go 1.21

require (
    github.com/AlecAivazis/survey/v2 v2.3.7
    github.com/fatih/color v1.16.0
    github.com/schollz/progressbar/v3 v3.14.1
    github.com/sergi/go-diff v1.3.1
    github.com/spf13/cobra v1.8.0
    github.com/spf13/viper v1.18.2
    gopkg.in/yaml.v3 v3.0.1
)
EOF

# Step 4: Clean and rebuild
echo "Step 4: Cleaning and rebuilding..."
rm -f go.sum
go mod download
go mod tidy

echo "Done! pterm has been completely removed."