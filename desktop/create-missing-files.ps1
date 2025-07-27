# Create missing files directly

# Create tsconfig.node.json
$tsconfigNodeContent = '{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}'

# Write file without BOM
$Utf8NoBomEncoding = New-Object System.Text.UTF8Encoding $False
[System.IO.File]::WriteAllText("tsconfig.node.json", $tsconfigNodeContent, $Utf8NoBomEncoding)
Write-Host "Created: tsconfig.node.json" -ForegroundColor Green

# Check if package.json has "type": "module"
$packageJsonPath = "package.json"
if (Test-Path $packageJsonPath) {
    $packageContent = Get-Content $packageJsonPath -Raw
    if ($packageContent -notmatch '"type":\s*"module"') {
        # Add "type": "module" after "version" line
        $packageContent = $packageContent -replace '("version":\s*"[^"]+",)', '$1
  "type": "module",'
        [System.IO.File]::WriteAllText($packageJsonPath, $packageContent, $Utf8NoBomEncoding)
        Write-Host "Updated: package.json (added type: module)" -ForegroundColor Green
    }
}

Write-Host "Done!" -ForegroundColor Green