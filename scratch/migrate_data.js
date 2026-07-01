const { createClient } = require('@supabase/supabase-js');

// Old Supabase credentials
const oldUrl = 'https://ekmbxjhwhokxnneavllb.supabase.co';
const oldServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrbWJ4amh3aG9reG5uZWF2bGxiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTk5MzA0NSwiZXhwIjoyMDkxNTY5MDQ1fQ._U5uTTqKVxG_7gKrQHousWIFbZG_wYgzWNOCxyxfDgY';

// New Supabase credentials (provided by user)
const newUrl = 'https://hcsrihbhqyepylwcvatp.supabase.co';
const newServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhjc3JpaGJocXllcHlsd2N2YXRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTk0MDIwMiwiZXhwIjoyMDk3NTE2MjAyfQ.E2YmbvwNsZ4_AQ0r4uV5jzJdMmdksZ_fmwfHeN9mxZs';

const oldSupabase = createClient(oldUrl, oldServiceRoleKey);
const newSupabase = createClient(newUrl, newServiceRoleKey);

// Order is crucial: users and products first, then product_variants
const tables = [
  'users',
  'products',
  'product_variants',
  'store_blocked_dates',
  'store_coupons',
  'store_orders'
];

async function migrateTable(tableName) {
  console.log(`\n--- Migrating Table: ${tableName} ---`);
  
  // 1. Fetch all data from the old table (page by page to support large tables)
  let allRows = [];
  let page = 0;
  const pageSize = 1000;
  let keepFetching = true;
  
  while (keepFetching) {
    const { data, error } = await oldSupabase
      .from(tableName)
      .select('*')
      .range(page * pageSize, (page + 1) * pageSize - 1);
      
    if (error) {
      console.error(`Failed to fetch from old ${tableName}:`, error.message);
      return;
    }
    
    if (data && data.length > 0) {
      allRows = allRows.concat(data);
      page++;
      if (data.length < pageSize) keepFetching = false;
    } else {
      keepFetching = false;
    }
  }
  
  console.log(`Fetched ${allRows.length} rows from old project.`);
  if (allRows.length === 0) return;
  
  // 2. Clear any pre-existing rows in the new table to prevent unique violations
  console.log(`Clearing existing records in new table ${tableName}...`);
  const { error: clearError } = await newSupabase
    .from(tableName)
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
    
  if (clearError) {
    console.error(`Failed to clear new table ${tableName}:`, clearError.message);
    return;
  }
  
  // 3. Batch insert the rows into the new table
  console.log(`Inserting ${allRows.length} rows into new table...`);
  // Insert in chunks of 200 to prevent payload limit issues
  const chunkSize = 200;
  for (let i = 0; i < allRows.length; i += chunkSize) {
    const chunk = allRows.slice(i, i + chunkSize);
    const { error: insertError } = await newSupabase
      .from(tableName)
      .insert(chunk);
      
    if (insertError) {
      console.error(`Failed to insert chunk in new ${tableName}:`, insertError.message);
      return;
    }
  }
  
  console.log(`Successfully migrated table ${tableName}!`);
}

async function migrateStorage() {
  console.log('\n--- Migrating Storage: cake_photos ---');
  
  // 1. List files in the old bucket
  const { data: fileList, error: listError } = await oldSupabase
    .storage
    .from('cake_photos')
    .list();
    
  if (listError) {
    console.error("Failed to list files in old storage:", listError.message);
    return;
  }
  
  if (!fileList || fileList.length === 0) {
    console.log("No files found in storage bucket.");
    return;
  }
  
  console.log(`Found ${fileList.length} files in old storage bucket.`);
  
  // Ensure bucket exists in new project (creating it if list fails or is empty)
  // Note: we assume the user already created it, but we can verify by listing
  const { error: newBucketCheckError } = await newSupabase
    .storage
    .from('cake_photos')
    .list();
    
  if (newBucketCheckError) {
    console.log("Bucket 'cake_photos' might not exist or be empty in new project. Creating it...");
    const { error: createBucketError } = await newSupabase
      .storage
      .createBucket('cake_photos', { public: true });
    if (createBucketError) {
      console.error("Failed to create new bucket 'cake_photos':", createBucketError.message);
      return;
    }
    console.log("Bucket 'cake_photos' created successfully.");
  }
  
  // 2. Download and upload each file
  for (const fileInfo of fileList) {
    if (fileInfo.name === '.emptyFolderPlaceholder') continue;
    
    console.log(`Copying file: ${fileInfo.name} (${fileInfo.metadata?.size || 'unknown'} bytes)...`);
    
    // Download
    const { data: fileBlob, error: downloadError } = await oldSupabase
      .storage
      .from('cake_photos')
      .download(fileInfo.name);
      
    if (downloadError) {
      console.error(`  Failed to download ${fileInfo.name}:`, downloadError.message);
      continue;
    }
    
    // Upload
    const { error: uploadError } = await newSupabase
      .storage
      .from('cake_photos')
      .upload(fileInfo.name, fileBlob, {
        upsert: true,
        contentType: fileBlob.type
      });
      
    if (uploadError) {
      console.error(`  Failed to upload ${fileInfo.name}:`, uploadError.message);
    } else {
      console.log(`  Successfully transferred ${fileInfo.name}!`);
    }
  }
}

async function migrateAuthUsers() {
  console.log('\n--- Migrating Auth Users ---');
  
  // 1. Fetch all users from old auth system
  const { data: { users: oldUsers }, error: fetchError } = await oldSupabase.auth.admin.listUsers();
  if (fetchError) {
    console.error("Failed to fetch old auth users:", fetchError.message);
    return;
  }
  
  console.log(`Found ${oldUsers.length} users in old auth system.`);
  
  // 2. Fetch all users in new auth system to avoid duplicates
  const { data: { users: newUsers }, error: newFetchError } = await newSupabase.auth.admin.listUsers();
  if (newFetchError) {
    console.error("Failed to fetch new auth users:", newFetchError.message);
    return;
  }
  
  const newUserEmails = new Set(newUsers.map(u => u.email.toLowerCase()));
  
  // 3. For each old user, if they don't exist in the new auth system, create them
  for (const user of oldUsers) {
    const email = user.email.toLowerCase();
    if (newUserEmails.has(email)) {
      console.log(`User ${user.email} already exists in new auth system. Skipping.`);
      continue;
    }
    
    console.log(`Creating user: ${user.email} with ID: ${user.id}...`);
    
    const { data: createdUser, error: createError } = await newSupabase.auth.admin.createUser({
      id: user.id,
      email: user.email,
      password: 'CKLoungeChangeMe123!',
      email_confirm: true,
      user_metadata: user.user_metadata || {}
    });
    
    if (createError) {
      console.error(`  Failed to create auth user ${user.email}:`, createError.message);
    } else {
      console.log(`  Successfully created auth user ${user.email}!`);
    }
  }
}

async function run() {
  console.log("Starting Supabase Migration...");
  
  // Migrate auth users
  await migrateAuthUsers();
  
  // Migrate databases tables
  for (const table of tables) {
    await migrateTable(table);
  }
  
  // Migrate storage files
  await migrateStorage();
  
  console.log("\nSupabase Migration Completed Successfully!");
}

run();
