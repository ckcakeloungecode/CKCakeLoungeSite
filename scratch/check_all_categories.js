import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envText = fs.readFileSync('./.env.local', 'utf-8');
const env = {};
envText.split('\n').forEach(line => {
  const [k, v] = line.split('=');
  if (k && v) env[k.trim()] = v.trim();
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseAnonKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectCategories() {
  const { data, error } = await supabase.from('products').select('id, name, category, is_special_cake');
  if (error) {
    console.error('Error:', error);
  } else {
    const categoriesMap = {};
    data.forEach(p => {
      if (!categoriesMap[p.category]) categoriesMap[p.category] = [];
      categoriesMap[p.category].push({ name: p.name, is_special_cake: p.is_special_cake });
    });
    console.log(JSON.stringify(categoriesMap, null, 2));
  }
}

inspectCategories();
