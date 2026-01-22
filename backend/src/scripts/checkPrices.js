import initSqlJs from 'sql.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../../database.sqlite');

async function checkPrices() {
  const SQL = await initSqlJs();
  const db = new SQL.Database(readFileSync(dbPath));
  
  console.log('=== Current Prices in LOCAL Database ===\n');
  
  const results = db.exec('SELECT name, wholesale_price, price FROM products ORDER BY name');
  
  if (results.length > 0) {
    console.log('Product Name | Wholesale | Retail');
    console.log('-'.repeat(70));
    for (const row of results[0].values) {
      console.log(`${row[0]} | $${row[1]} | $${row[2]}`);
    }
    console.log('\nTotal products:', results[0].values.length);
  }
}

checkPrices().catch(console.error);
