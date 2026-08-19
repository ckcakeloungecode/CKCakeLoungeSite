import fs from 'fs';

const filePath = 'src/utils/customDesignsData.js';
let content = fs.readFileSync(filePath, 'utf8');

const regex = /export const CUSTOM_DESIGNS = (\[[\s\S]*?\]);\s*export const CATEGORIES/;
const match = content.match(regex);

if (match) {
  const designs = eval(match[1]);
  designs.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));

  const newDesignsStr = 'export const CUSTOM_DESIGNS = ' + JSON.stringify(designs, null, 2) + ';\n\nexport const CATEGORIES';
  content = content.replace(regex, newDesignsStr);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully sorted customDesignsData.js alphabetically!');
} else {
  console.error('Could not match CUSTOM_DESIGNS array');
}
