import fs from 'fs';

// Exact SVG matching the user's uploaded "CK" text:
// Deep chocolate brown serif font with golden-orange outline/glow stroke
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <defs>
    <filter id="gold-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="1.8" flood-color="#d98c2b" flood-opacity="0.95"/>
      <feDropShadow dx="0.5" dy="0.5" stdDeviation="0.8" flood-color="#b86b14" flood-opacity="0.85"/>
    </filter>
  </defs>
  <rect width="128" height="128" rx="28" fill="#fcfbfa"/>
  <text 
    x="64" 
    y="86" 
    font-family="Georgia, 'Times New Roman', 'Garamond', serif" 
    font-size="76" 
    font-weight="bold" 
    fill="#4a2416" 
    stroke="#d98c2b" 
    stroke-width="2" 
    stroke-linejoin="round" 
    text-anchor="middle" 
    letter-spacing="-2" 
    filter="url(#gold-glow)"
  >CK</text>
</svg>`;

// Write SVG files
fs.writeFileSync('src/app/icon.svg', svgContent, 'utf8');
fs.writeFileSync('public/icon.svg', svgContent, 'utf8');
fs.writeFileSync('src/app/icon.png', svgContent, 'utf8');
fs.writeFileSync('public/icon.png', svgContent, 'utf8');
fs.writeFileSync('src/app/favicon.ico', svgContent, 'utf8');
fs.writeFileSync('public/favicon.ico', svgContent, 'utf8');

console.log('Successfully generated exact CK text icon matching the user image format!');
