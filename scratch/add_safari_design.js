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
  const newProducts = [
    {
      name: 'Safari Lion 1st Birthday Celebration Cake',
      description: 'Adorable jungle safari theme cake featuring a handcrafted lion figure, tropical monstera & palm leaves, a golden number 1 crown topper, Happy Birthday sign, and custom plaque.',
      price: 50,
      category: 'Birthday Celebrations',
      image_url: '/designs/safari-lion-birthday.jpg',
      is_available: true,
      is_special_cake: false,
      allows_photo: false
    },
    {
      name: 'Safari Lion 1st Birthday Celebration Cake',
      description: 'Adorable jungle safari theme cake featuring a handcrafted lion figure, tropical monstera & palm leaves, a golden number 1 crown topper, Happy Birthday sign, and custom plaque.',
      price: 50,
      category: 'Baby Shower & Kids',
      image_url: '/designs/safari-lion-birthday.jpg',
      is_available: true,
      is_special_cake: false,
      allows_photo: false
    }
  ];

  const { data, error } = await supabase
    .from('products')
    .insert(newProducts)
    .select();

  if (error) {
    console.error('Error inserting design into DB:', error);
  } else {
    console.log('Inserted Safari Lion design into DB:', data);
  }
}

addDesignToDB();
