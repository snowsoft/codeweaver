# Find where border-border class is used

Write-Host "Searching for 'border-border' class usage..." -ForegroundColor Yellow
Write-Host ""

# Search in CSS files
Write-Host "Searching in CSS files:" -ForegroundColor Cyan
Get-ChildItem -Path "src" -Include "*.css", "*.scss" -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match "border-border") {
        Write-Host "Found in: $($_.FullName)" -ForegroundColor Green
        $lineNumber = 1
        $content -split "`n" | ForEach-Object {
            if ($_ -match "border-border") {
                Write-Host "  Line $lineNumber : $_" -ForegroundColor Yellow
            }
            $lineNumber++
        }
    }
}

# Search in TSX/JSX files
Write-Host ""
Write-Host "Searching in component files:" -ForegroundColor Cyan
Get-ChildItem -Path "src" -Include "*.tsx", "*.jsx", "*.ts", "*.js" -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match "border-border") {
        Write-Host "Found in: $($_.FullName)" -ForegroundColor Green
        $lineNumber = 1
        $content -split "`n" | ForEach-Object {
            if ($_ -match "border-border") {
                Write-Host "  Line $lineNumber : $_" -ForegroundColor Yellow
            }
            $lineNumber++
        }
    }
}

Write-Host ""
Write-Host "Search complete!" -ForegroundColor Green