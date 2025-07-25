# Fix Tailwind CSS styles

# Update globals.css with proper Tailwind directives
$globalsCss = @"
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-background: 255 255 255;
    --color-foreground: 0 0 0;
  }

  .dark {
    --color-background: 30 30 30;
    --color-foreground: 204 204 204;
  }
}

@layer utilities {
  .bg-background {
    background-color: rgb(var(--color-background));
  }

  .text-foreground {
    color: rgb(var(--color-foreground));
  }
}

/* Base styles */
body {
  @apply bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100;
}
"@

$Utf8NoBomEncoding = New-Object System.Text.UTF8Encoding $False
[System.IO.File]::WriteAllText("src/styles/globals.css", $globalsCss, $Utf8NoBomEncoding)
Write-Host "Updated: src/styles/globals.css" -ForegroundColor Green

# Update tailwind.config.js to use the CSS variables
$tailwindConfig = @"
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--color-background) / <alpha-value>)",
        foreground: "rgb(var(--color-foreground) / <alpha-value>)",
      }
    },
  },
  plugins: [],
}
"@

[System.IO.File]::WriteAllText("tailwind.config.js", $tailwindConfig, $Utf8NoBomEncoding)
Write-Host "Updated: tailwind.config.js" -ForegroundColor Green

Write-Host ""
Write-Host "Styles fixed! The app should now load without CSS errors." -ForegroundColor Green