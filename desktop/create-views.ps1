# create-views.ps1
$views = @("Refactor", "Document", "Test", "Review", "History", "Settings")

foreach ($view in $views) {
    $content = @"
import React from 'react';

const $view = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        $view
      </h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-gray-600 dark:text-gray-400">
          $view functionality will be implemented here.
        </p>
      </div>
    </div>
  );
};

// Named export
export { $view };

// Default export
export default $view;
"@

    $path = "src/views/$view/index.tsx"
    if (Test-Path $path) {
        # Backup existing file
        Copy-Item $path "$path.bak"
    }

    Set-Content -Path $path -Value $content -Encoding UTF8
    Write-Host "Created/Updated: $path"
}

Write-Host "All view components have been updated with proper exports!"