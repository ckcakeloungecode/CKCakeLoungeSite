const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually
let supabaseUrl = '';
let serviceKey = '';

try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('#') || !trimmed) continue;
    const parts = trimmed.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      if (key === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = val;
      if (key === 'SUPABASE_SERVICE_ROLE_KEY') serviceKey = val;
    }
  }
} catch (err) {
  console.error("Failed to read .env.local:", err);
  process.exit(1);
}

if (!supabaseUrl || !serviceKey) {
  console.error("Missing Supabase URL or Service Key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function run() {
  console.log("Checking storage buckets...");
  const { data: buckets, error } = await supabase.storage.listBuckets();
  
  if (error) {
    console.error("❌ Failed to list buckets!");
    console.error(error);
  } else {
    console.log("✅ Configured Buckets:", buckets);
  }
}

run();
