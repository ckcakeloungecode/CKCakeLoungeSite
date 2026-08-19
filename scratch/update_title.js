import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const oldTitle = 'Velvet Red Rose & Gold Two-Tier Birthday Cake';
const newTitle = 'Red Rose & Gold Two-Tier Birthday Cake';

// 1. Update customDesignsData.js
const filePath = 'src/utils/customDesignsData.js';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(oldTitle, newTitle);

// Re-sort array alphabetically
const regex = /export const CUSTOM_DESIGNS = (\[[\s\S]*?\]);\s*export const CATEGORIES/;
const match = content.match(regex);
if (match) {
  const designs = eval(match[1]);
  designs.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));
  const newDesignsStr = 'export const CUSTOM_DESIGNS = ' + JSON.stringify(designs, null, 2) + ';\n\nexport const CATEGORIES';
  content = content.replace(regex, newDesignsStr);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated customDesignsData.js title to:', newTitle);
}

// 2. Update Supabase products table
const envText = fs.readFileSync('./.env.local', 'utf-8');
const env = {};
envText.split('\n').forEach(line => {
  const [k, v] = line.split('=');
  if (k && v) env[k.trim()] = v.trim();
});

const url = env['NEXT_PUBLIC_SUPABASE_URL'];
const key = env['SUPABASE_SERVICE_ROLE_KEY'] || env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
const client = createClient(url, key);

client.from('products').update({ name: newTitle }).eq('name', oldTitle).then(({ error }) => {
  if (error) console.error('Supabase update error:', error);
  else console.log('Successfully updated product title in Supabase database!');
});
