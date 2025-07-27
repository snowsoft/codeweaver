# Dosyaların varlığını kontrol et
$files = @(
    "src/components/layout/Sidebar/index.tsx",
    "src/components/layout/StatusBar/index.tsx",
    "src/components/layout/MainLayout/index.tsx",
    "src/views/Dashboard/index.tsx",
    "src/views/Generate/index.tsx",
    "src/views/Refactor/index.tsx",
    "src/views/Document/index.tsx",
    "src/views/Test/index.tsx",
    "src/views/Review/index.tsx",
    "src/views/History/index.tsx",
    "src/views/Settings/index.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✓ $file exists" -ForegroundColor Green
    } else {
        Write-Host "✗ $file missing" -ForegroundColor Red
    }
}