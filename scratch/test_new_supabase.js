const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Parse .env.local file to read environment variables manually
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let val = match[2].trim();
    // remove quotes if any
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.substring(1, val.length - 1);
    }
    env[key] = val;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing connection to:', supabaseUrl);

async function testConnection() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

  // 1. Test Anon read products
  const { data: anonProducts, error: anonError } = await supabase
    .from('products')
    .select('id, name')
    .limit(5);

  if (anonError) {
    console.error('❌ Anon client products select failed:', anonError.message);
  } else {
    console.log(`✅ Anon client products select succeeded. Found ${anonProducts.length} products.`);
    anonProducts.forEach(p => console.log(`  - ${p.name}`));
  }

  // 2. Test Admin read orders
  const { data: adminOrders, error: adminError } = await supabaseAdmin
    .from('store_orders')
    .select('id, customer_name, total_amount')
    .limit(5);

  if (adminError) {
    console.error('❌ Admin client orders select failed:', adminError.message);
  } else {
    console.log(`✅ Admin client orders select succeeded. Found ${adminOrders.length} orders.`);
    adminOrders.forEach(o => console.log(`  - Order for ${o.customer_name}: $${o.total_amount}`));
  }

  // 2.5 Test Admin read users
  const { data: adminUsers, error: usersError } = await supabaseAdmin
    .from('users')
    .select('id, first_name, email')
    .limit(5);

  if (usersError) {
    console.error('❌ Admin client users select failed:', usersError.message);
  } else {
    console.log(`✅ Admin client users select succeeded. Found ${adminUsers.length} users.`);
    adminUsers.forEach(u => console.log(`  - User: ${u.first_name} (${u.email})`));
  }

  // 3. Test storage client file list
  const { data: bucketFiles, error: storageError } = await supabase
    .storage
    .from('cake_photos')
    .list();

  if (storageError) {
    console.error('❌ Storage bucket read failed:', storageError.message);
  } else {
    console.log(`✅ Storage bucket read succeeded. Found ${bucketFiles.length} files.`);
    bucketFiles.forEach(f => console.log(`  - File: ${f.name}`));
  }
}

testConnection();
