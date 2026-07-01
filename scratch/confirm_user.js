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
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.substring(1, val.length - 1);
    }
    env[key] = val;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function confirmUser() {
  const targetEmail = 'poqweqwe@gmail.com';
  console.log(`Searching for user with email: ${targetEmail}...`);

  const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) {
    console.error('Error listing users:', listError.message);
    return;
  }

  const user = users.find(u => u.email.toLowerCase() === targetEmail.toLowerCase());
  if (!user) {
    console.error(`User with email ${targetEmail} not found.`);
    return;
  }

  console.log(`User found (ID: ${user.id}). Confirming email...`);

  const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
    user.id,
    { email_confirm: true }
  );

  if (updateError) {
    console.error('Error confirming user email:', updateError.message);
  } else {
    console.log(`✅ Success! Email for user ${targetEmail} has been confirmed. You can now log in!`);
  }
}

confirmUser();
