const fs = require('fs');

const data = JSON.parse(fs.readFileSync('scratch/openapi_spec.json', 'utf-8'));
const definitions = data.definitions;

Object.keys(definitions).forEach(tableName => {
  console.log(`\nTable: ${tableName}`);
  const properties = definitions[tableName].properties;
  if (properties) {
    Object.keys(properties).forEach(colName => {
      const col = properties[colName];
      console.log(`  - ${colName}: type=${col.type}, format=${col.format || ''}, desc=${col.description || ''}`);
    });
  }
});
