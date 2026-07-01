const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually
let supabaseUrl = '';
let supabaseKey = '';

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
      if (key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') supabaseKey = val;
    }
  }
} catch (err) {
  console.error("Failed to read .env.local:", err);
  process.exit(1);
}

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Anon Key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Testing upload to cake_photos bucket...");
  const dummyBuffer = Buffer.from("hello world");
  const fileName = `test-${Date.now()}.txt`;
  
  const { data, error } = await supabase.storage
    .from('cake_photos')
    .upload(fileName, dummyBuffer, {
      contentType: 'text/plain'
    });
    
  if (error) {
    console.error("❌ Upload failed!");
    console.error(error);
  } else {
    console.log("✅ Upload succeeded!", data);
    // clean up
    const { error: delError } = await supabase.storage
      .from('cake_photos')
      .remove([fileName]);
    console.log("Cleanup status:", delError ? "Failed to delete" : "Deleted successfully");
  }
}

run();
