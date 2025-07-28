# Simple fix - Remove "type": "module" from package.json

Write-Host "Removing ES module configuration..." -ForegroundColor Yellow

# Read package.json
$packagePath = "package.json"
$content = Get-Content $packagePath -Raw

# Remove "type": "module" line
$newContent = $content -replace '\s*"type":\s*"module",?\s*', ''

# Fix any double commas that might result
$newContent = $newContent -replace ',\s*,', ','
$newContent = $newContent -replace ',\s*}', '}'

# Write back
[System.IO.File]::WriteAllText($packagePath, $newContent, [System.Text.UTF8Encoding]::new($false))

Write-Host "Updated package.json - removed type: module" -ForegroundColor Green

# Make sure electron points to correct file
$package = Get-Content $packagePath -Raw | ConvertFrom-Json
$package.main = "electron/main/index.js"
$package | ConvertTo-Json -Depth 10 | Set-Content -Path $packagePath -Encoding UTF8

Write-Host "Set main entry point to electron/main/index.js" -ForegroundColor Green

# Rename .mjs back to .js if needed
if (Test-Path "postcss.config.mjs") {
    Move-Item "postcss.config.mjs" "postcss.config.js" -Force
    Write-Host "Renamed postcss.config.mjs back to .js" -ForegroundColor Green
}

Write-Host ""
Write-Host "Done! Now run:" -ForegroundColor Green
Write-Host "1. npm run dev (in terminal 1)" -ForegroundColor Yellow
Write-Host "2. npm run electron (in terminal 2)" -ForegroundColor Yellow