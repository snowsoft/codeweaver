// scripts/create-icon.js
const fs = require('fs');
const path = require('path');

// Create a simple SVG icon
const svgIcon = `
<svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
  <rect width="256" height="256" fill="#1e1e1e"/>
  <text x="128" y="128" font-family="Arial" font-size="120" font-weight="bold" text-anchor="middle" dominant-baseline="middle" fill="#007acc">CW</text>
</svg>
`;

// Create assets/icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '..', 'assets', 'icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

// Save SVG file
fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svgIcon);

console.log('Icon created successfully!');
console.log('Note: For production, you should convert this to PNG, ICO, and ICNS formats.');