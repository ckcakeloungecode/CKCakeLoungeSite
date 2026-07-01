const { createClient } = require('@supabase/supabase-js');

const oldUrl = 'https://ekmbxjhwhokxnneavllb.supabase.co';
const oldServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrbWJ4amh3aG9reG5uZWF2bGxiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTk5MzA0NSwiZXhwIjoyMDkxNTY5MDQ1fQ._U5uTTqKVxG_7gKrQHousWIFbZG_wYgzWNOCxyxfDgY';

const oldSupabase = createClient(oldUrl, oldServiceRoleKey);

async function checkUsers() {
  console.log('Fetching users from old public.users table...');
  const { data: users, error: usersError } = await oldSupabase
    .from('users')
    .select('*');

  if (usersError) {
    console.error('Error fetching public.users:', usersError.message);
  } else {
    console.log(`Found ${users.length} users in public.users:`);
    users.forEach(u => {
      console.log(`  - ID: ${u.id}, Name: ${u.first_name} ${u.last_name}, Email: ${u.email}`);
    });
  }

  console.log('\nFetching users from old auth.users via admin API...');
  const { data: { users: authUsers }, error: authError } = await oldSupabase.auth.admin.listUsers();

  if (authError) {
    console.error('Error fetching auth.users:', authError.message);
  } else {
    console.log(`Found ${authUsers.length} users in auth.users:`);
    authUsers.forEach(u => {
      console.log(`  - ID: ${u.id}, Email: ${u.email}`);
    });
  }
}

checkUsers();
