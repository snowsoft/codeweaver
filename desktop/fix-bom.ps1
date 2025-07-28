# Fix BOM issues in all text files
param(
    [string]$Path = "."
)

Write-Host "Fixing BOM issues in files..." -ForegroundColor Yellow

# Function to remove BOM
function Remove-BOM {
    param([string]$FilePath)

    if (Test-Path $FilePath) {
        $content = Get-Content $FilePath -Raw -Encoding UTF8
        [System.IO.File]::WriteAllText($FilePath, $content, [System.Text.UTF8Encoding]::new($false))
        Write-Host "Fixed: $FilePath" -ForegroundColor Green
    }
}

# Fix all config files
$files = @(
    "package.json",
    "tsconfig.json",
    "tsconfig.node.json",
    "vite.config.ts",
    "tailwind.config.js",
    "postcss.config.js",
    ".prettierrc",
    ".eslintrc.json",
    "index.html"
)

foreach ($file in $files) {
    $filePath = Join-Path $Path $file
    if (Test-Path $filePath) {
        Remove-BOM $filePath
    }
}

# Fix all .ts, .tsx, .js, .jsx, .css files
Get-ChildItem -Path $Path -Include *.ts,*.tsx,*.js,*.jsx,*.css,*.json -Recurse | ForEach-Object {
    Remove-BOM $_.FullName
}

Write-Host "BOM removal completed!" -ForegroundColor Green