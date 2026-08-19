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
    name: 'Gilded Chocolate Overload Drip Birthday Cake',
    description: 'Decadent chocolate ganache drip cake decorated with mini chocolate bars, gold edible glitter shimmer, a golden script "Happy Birthday" topper, a crowned number topper, and custom lettering.',
    price: 50,
    category: 'Birthday Celebrations',
    image_url: '/designs/chocolate-drip-16-birthday.jpg',
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
    console.log('Inserted Gilded Chocolate Drip design into DB:', data);
  }
}

addDesignToDB();
