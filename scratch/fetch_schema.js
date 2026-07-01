const axios = require('axios');
const fs = require('fs');

const oldUrl = 'https://ekmbxjhwhokxnneavllb.supabase.co';
const oldServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrbWJ4amh3aG9reG5uZWF2bGxiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTk5MzA0NSwiZXhwIjoyMDkxNTY5MDQ1fQ._U5uTTqKVxG_7gKrQHousWIFbZG_wYgzWNOCxyxfDgY';

async function run() {
  try {
    console.log("Fetching OpenAPI spec with service_role auth headers...");
    const response = await axios.get(`${oldUrl}/rest/v1/`, {
      headers: {
        'apikey': oldServiceRoleKey,
        'Authorization': `Bearer ${oldServiceRoleKey}`
      }
    });
    
    // Write the raw JSON output to verify
    fs.writeFileSync('scratch/openapi_spec.json', JSON.stringify(response.data, null, 2));
    console.log("OpenAPI spec saved to scratch/openapi_spec.json");
    
    const definitions = response.data.definitions;
    if (!definitions) {
      console.error("No definitions found in OpenAPI spec.");
      return;
    }
    
    console.log("Tables found:");
    Object.keys(definitions).forEach(tableName => {
      console.log(`- ${tableName}`);
    });
  } catch (error) {
    console.error("Error fetching schema:", error.response ? error.response.data : error.message);
  }
}

run();
