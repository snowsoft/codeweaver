# Check and fix package.json

$packagePath = "package.json"

# Read current content
$content = Get-Content $packagePath -Raw

# Check if type: module exists
if ($content -match '"type":\s*"module"') {
    Write-Host "package.json already has type: module" -ForegroundColor Yellow
    Write-Host "Current content:" -ForegroundColor Cyan
    Write-Host $content
} else {
    Write-Host "Adding type: module to package.json" -ForegroundColor Green

    # Add type: module after name field
    $newContent = $content -replace '("name":\s*"[^"]+",)', '$1
  "type": "module",'

    # Write without BOM
    $Utf8NoBomEncoding = New-Object System.Text.UTF8Encoding $False
    [System.IO.File]::WriteAllText($packagePath, $newContent, $Utf8NoBomEncoding)

    Write-Host "Updated package.json" -ForegroundColor Green
}

# Also create a proper postcss.config.mjs to ensure ES module
$postcssContent = @"
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
"@

$Utf8NoBomEncoding = New-Object System.Text.UTF8Encoding $False
[System.IO.File]::WriteAllText("postcss.config.mjs", $postcssContent, $Utf8NoBomEncoding)
Write-Host "Created postcss.config.mjs (ES module version)" -ForegroundColor Green

# Remove old postcss.config.js if exists
if (Test-Path "postcss.config.js") {
    Remove-Item "postcss.config.js"
    Write-Host "Removed old postcss.config.js" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Done! Now run: npm run dev" -ForegroundColor Green