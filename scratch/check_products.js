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

async function checkProducts() {
  const { data, error } = await supabase.from('products').select('id, name, category, image_url');
  if (error) {
    console.error('Error fetching products:', error);
  } else {
    console.log('Products in DB:', JSON.stringify(data, null, 2));
  }
}

checkProducts();
