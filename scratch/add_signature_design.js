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

async function addDesignToDB() {
  const newProduct = {
    name: 'Teal Floral Rose & Pearl Birthday Cake',
    description: 'Elegant light teal textured cake topped with white roses, baby\'s breath flowers, edible pearls, a golden "Happy Birthday" topper, and a custom banner inscription.',
    price: 50,
    category: 'Birthday Celebrations',
    image_url: '/designs/teal-rose-birthday.jpg',
    is_available: true,
    is_special_cake: false,
    allows_photo: false
  };

  const { data, error } = await supabase
    .from('products')
    .insert([newProduct])
    .select();

  if (error) {
    console.error('Error inserting design into DB:', error);
  } else {
    console.log('Inserted new signature design into DB:', data);
  }
}

addDesignToDB();
