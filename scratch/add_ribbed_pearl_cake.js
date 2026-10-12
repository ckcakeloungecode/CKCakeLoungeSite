import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const filePath = 'src/utils/customDesignsData.js';
let content = fs.readFileSync(filePath, 'utf8');

const newDesign = {
  id: 'design-white-ribbed-pearl-birthday',
  title: 'White Ribbed Pearl Birthday Cake',
  category: 'Birthday Celebrations',
  startingPrice: 50,
  themeMessage: 'Minimalist cream buttercream cake styled with horizontal ribbed piping, delicate white sugar pearls, a gold cake board, and a gold Happy Birthday topper.',
  defaultSize: '2 LB (Serves 10-13)',
  leadTime: '2 Days Notice',
  imageUrl: '/designs/white-ribbed-pearl-birthday.jpg',
  placeholderCode: 'white-ribbed-pearl-birthday.jpg'
};

// Update customDesignsData.js
const regex = /export const CUSTOM_DESIGNS = (\[[\s\S]*?\]);\s*export const CATEGORIES/;
const match = content.match(regex);

if (match) {
  const designs = eval(match[1]);
  const filtered = designs.filter(d => d.id !== newDesign.id && d.title !== newDesign.title);
  filtered.push(newDesign);
  filtered.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));

  const newDesignsStr = 'export const CUSTOM_DESIGNS = ' + JSON.stringify(filtered, null, 2) + ';\n\nexport const CATEGORIES';
  content = content.replace(regex, newDesignsStr);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully updated customDesignsData.js with White Ribbed Pearl Birthday Cake!');
}

// Update Supabase
const envText = fs.readFileSync('./.env.local', 'utf-8');
const env = {};
envText.split('\n').forEach(line => {
  const [k, v] = line.split('=');
  if (k && v) env[k.trim()] = v.trim();
});

const url = env['NEXT_PUBLIC_SUPABASE_URL'];
const key = env['SUPABASE_SERVICE_ROLE_KEY'] || env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
const client = createClient(url, key);

client.from('products').insert([{
  name: newDesign.title,
  category: 'Birthday Celebrations',
  description: newDesign.themeMessage,
  price: newDesign.startingPrice,
  image_url: newDesign.imageUrl,
  is_available: true
}]).then(({ error }) => {
  if (error) console.error('Supabase error:', error);
  else console.log('Successfully inserted White Ribbed Pearl Birthday Cake into Supabase database!');
});
