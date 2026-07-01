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

// Use service role key to query raw SQL
const supabase = createClient(supabaseUrl, serviceKey);

async function run() {
  console.log("Fetching policies on storage.objects...");
  
  // We can query pg_policies using RPC or a direct query if we have a function.
  // Wait, does the Supabase client have access to pg_policies?
  // Let's run a query to inspect the policies if we can, or query the REST API.
  // Since we don't have a direct raw SQL API through the JS client unless we created a function,
  // let's check what functions we have in the database, or see if we can read the SQL setup script.
  // Wait, let's check if we can query pg_policies using standard table select (it might not be exposed on API).
  // Instead, let's write a script that connects via postgres if pg is installed, or try to run a command.
  
  // Let's see if pg package is installed. We saw package.json doesn't list pg.
  // But wait! We can just use pg_policies through supabase client by creating a temporary function, or check if we can call it.
  // Wait! Let's check if the project has direct pg access or if we can run psql.
  // Since we are on windows, does the system have psql or other postgres tools?
  // Let's check if we can connect.
  // Actually, let's check if we can find the old policies from our files.
  console.log("No pg package. We will inspect the sql setup file and run a script to see if the database responds to simple selects.");
  
  const { data, error } = await supabase.from('products').select('*').limit(1);
  if (error) {
    console.error("Database connection failed:", error);
  } else {
    console.log("Database connection succeeded. Products fetched:", data);
  }
}

run();
