# Tüm dizinleri oluştur
$dirs = @(
    "src/components/layout/Sidebar",
    "src/components/layout/StatusBar",
    "src/components/layout/MainLayout",
    "src/views/Dashboard",
    "src/views/Generate",
    "src/views/Refactor",
    "src/views/Document",
    "src/views/Test",
    "src/views/Review",
    "src/views/History",
    "src/views/Settings"
)

foreach ($dir in $dirs) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
        Write-Host "Created directory: $dir"
    }
}