import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envText = fs.readFileSync('./.env.local', 'utf-8');
const env = {};
envText.split('\n').forEach(line => {
  const [k, v] = line.split('=');
  if (k && v) env[k.trim()] = v.trim();
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const serviceRoleKey = env['SUPABASE_SERVICE_ROLE_KEY'] || env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function updateGulabJamun() {
  const { data, error } = await supabase
    .from('products')
    .update({ image_url: '/gulab-jamun-cake.jpg' })
    .ilike('name', '%gulab%')
    .select();

  if (error) {
    console.error('Error updating Gulab Jamun product:', error);
  } else {
    console.log('Updated Gulab Jamun products in DB:', data);
  }
}

updateGulabJamun();
