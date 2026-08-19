import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envText = fs.readFileSync('./.env.local', 'utf-8');
const env = {};
envText.split('\n').forEach(line => {
  const [k, v] = line.split('=');
  if (k && v) env[k.trim()] = v.trim();
});

const supabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['NEXT_PUBLIC_SUPABASE_ANON_KEY']);

async function testFilter() {
  let query = supabase
    .from('products')
    .select('id, name, category')
    .eq('is_available', true)
    .eq('is_special_cake', false)
    .neq('category', 'Cakes')
    .neq('category', 'International Flavors')
    .neq('category', 'Ready to Go Cakes')
    .neq('category', 'Festive Cakes')
    .neq('category', 'Birthday Celebrations')
    .neq('category', 'Wedding & Anniversary')
    .neq('category', 'Fusion Cakes')
    .neq('category', 'Baby Shower & Kids');

  const { data, error } = await query;
  if (error) console.error(error);
  else console.log('Filtered Everyday Treats:', data);
}

testFilter();
