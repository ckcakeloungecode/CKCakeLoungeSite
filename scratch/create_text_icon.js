import fs from 'fs';

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="28" fill="#ffffff"/>
  <text x="64" y="86" font-family="Georgia, 'Times New Roman', serif" font-size="72" font-weight="bold" fill="#543b32" text-anchor="middle" letter-spacing="-2">CK</text>
</svg>`;

fs.writeFileSync('src/app/icon.svg', svgContent, 'utf8');
fs.writeFileSync('public/icon.svg', svgContent, 'utf8');
fs.writeFileSync('src/app/icon.png', svgContent, 'utf8');
fs.writeFileSync('public/icon.png', svgContent, 'utf8');

console.log('Successfully generated clean text tab icons!');
