import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const filePath = 'src/utils/customDesignsData.js';
let content = fs.readFileSync(filePath, 'utf8');

const newDesign = {
  id: 'design-red-rose-tier-birthday',
  title: 'Velvet Red Rose & Gold Two-Tier Birthday Cake',
  category: 'Birthday Celebrations',
  startingPrice: 175,
  themeMessage: 'Stunning two-tier celebration cake featuring a white buttercream top tier and hot pink bottom tier, decorated with vibrant red roses, gold leaf accents, gold pearls, and acrylic gold Happy Birthday lettering.',
  defaultSize: '6 LB 2-Tier (Serves 50-60)',
  leadTime: '3 Days Notice',
  imageUrl: '/designs/red-rose-tier-birthday.jpg',
  placeholderCode: 'red-rose-tier-birthday.jpg'
};

// Parse existing array
const regex = /export const CUSTOM_DESIGNS = (\[[\s\S]*?\]);\s*export const CATEGORIES/;
const match = content.match(regex);

if (match) {
  const designs = eval(match[1]);
  
  // Remove duplicate if exists
  const filtered = designs.filter(d => d.id !== newDesign.id && d.title !== newDesign.title);
  filtered.push(newDesign);
  
  // Sort alphabetically
  filtered.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));

  const newDesignsStr = 'export const CUSTOM_DESIGNS = ' + JSON.stringify(filtered, null, 2) + ';\n\nexport const CATEGORIES';
  content = content.replace(regex, newDesignsStr);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully updated customDesignsData.js with new Velvet Red Rose Two-Tier Birthday Cake!');
}

// Add to Supabase
const envText = fs.readFileSync('./.env.local', 'utf-8');
const env = {};
envText.split('\n').forEach(line => {
  const [k, v] = line.split('=');
  if (k && v) env[k.trim()] = v.trim();
});

if (env['NEXT_PUBLIC_SUPABASE_URL'] && env['NEXT_PUBLIC_SUPABASE_ANON_KEY']) {
  const supabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['NEXT_PUBLIC_SUPABASE_ANON_KEY']);
  
  const productData = {
    name: newDesign.title,
    category: 'Birthday Celebrations',
    description: newDesign.themeMessage,
    price: newDesign.startingPrice,
    image_url: newDesign.imageUrl,
    is_available: true
  };

  supabase.from('products').insert([productData]).then(({ data, error }) => {
    if (error) {
      console.log('Supabase insert error (or record exists):', error.message);
    } else {
      console.log('Successfully inserted new design product into Supabase products table!');
    }
  });
}
