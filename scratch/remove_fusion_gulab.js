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

async function removeFusionGulab() {
  const { data, error } = await supabase
    .from('products')
    .delete()
    .eq('name', 'Royal Indian Fusion Gulab Jamun Festive Cake')
    .select();

  if (error) {
    console.error('Error deleting product from DB:', error);
  } else {
    console.log('Deleted product from DB:', data);
  }
}

removeFusionGulab();
