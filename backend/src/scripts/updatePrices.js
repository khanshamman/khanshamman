import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../../database.sqlite');

// New price list with wholesale and retail prices
const productsToUpdate = [
  // Body Oil
  { name: 'Body Oil Passion Fruits', category: 'Body Oil', wholesale_price: 7.3, price: 11.3 },
  { name: 'Body Oil Green Tea', category: 'Body Oil', wholesale_price: 7.5, price: 11.5 },
  { name: 'Body Oil Coconut Milk Rose', category: 'Body Oil', wholesale_price: 7.3, price: 11.3 },
  { name: 'Body Oil Coconut Milk', category: 'Body Oil', wholesale_price: 7.3, price: 11.3 },
  { name: 'Body Oil Papaya', category: 'Body Oil', wholesale_price: 7.3, price: 11.3 },
  { name: 'Body Oil Dove', category: 'Body Oil', wholesale_price: 7.3, price: 11.3 },
  { name: 'Body Oil Rose Vanilla', category: 'Body Oil', wholesale_price: 7.3, price: 11.3 },
  { name: 'Body Oil Musk Tahara', category: 'Body Oil', wholesale_price: 7.3, price: 11.3 },
  { name: 'Body Oil Blooming Rose', category: 'Body Oil', wholesale_price: 8, price: 12 },

  // Body Lotion
  { name: 'Body Lotion Coconut Milk Rose', category: 'Body Lotion', wholesale_price: 6, price: 10 },
  { name: 'Body Lotion Rose Vanilla', category: 'Body Lotion', wholesale_price: 6, price: 10 },
  { name: 'Body Lotion Musk Tahara', category: 'Body Lotion', wholesale_price: 6.5, price: 10 },
  { name: 'Body Lotion Coconut Milk', category: 'Body Lotion', wholesale_price: 6, price: 10 },
  { name: 'Body Lotion Passion Fruits', category: 'Body Lotion', wholesale_price: 6, price: 10 },
  { name: 'Body Lotion Dove', category: 'Body Lotion', wholesale_price: 6.5, price: 10 },
  { name: 'Body Lotion Green Tea', category: 'Body Lotion', wholesale_price: 6.5, price: 10 },
  { name: 'Body Lotion Blooming Rose', category: 'Body Lotion', wholesale_price: 6.8, price: 11 },

  // Hair Mist
  { name: 'Hair Mist Musk Tahara', category: 'Hair Mist', wholesale_price: 5.5, price: 8.5 },
  { name: 'Hair Mist Paradise', category: 'Hair Mist', wholesale_price: 5, price: 8.5 },
  { name: 'Hair Mist Rose Island', category: 'Hair Mist', wholesale_price: 5, price: 8.5 },
  { name: 'Hair Mist Green Tea', category: 'Hair Mist', wholesale_price: 5.5, price: 8.5 },
  { name: 'Hair Mist Blooming Rose', category: 'Hair Mist', wholesale_price: 6, price: 10 },
  { name: 'Hair Mist White Angel', category: 'Hair Mist', wholesale_price: 5, price: 8.5 },
  { name: 'Hair Mist Coconut Milk Rose', category: 'Hair Mist', wholesale_price: 5, price: 8.5 },

  // Body Mist
  { name: 'Body Mist Musk Tahara', category: 'Body Mist', wholesale_price: 5.5, price: 8.5 },
  { name: 'Body Mist Paradise', category: 'Body Mist', wholesale_price: 5, price: 8.5 },
  { name: 'Body Mist White Angel', category: 'Body Mist', wholesale_price: 5, price: 8.5 },
  { name: 'Body Mist Green Tea', category: 'Body Mist', wholesale_price: 5.5, price: 8.5 },
  { name: 'Body Mist Coconut Milk Rose', category: 'Body Mist', wholesale_price: 5, price: 8.5 },
  { name: 'Body Mist Rose Island', category: 'Body Mist', wholesale_price: 5, price: 8.5 },
  { name: 'Body Mist Blooming Rose', category: 'Body Mist', wholesale_price: 6, price: 10 },

  // Air Freshener
  { name: 'Air Freshener Pine', category: 'Air Freshener', wholesale_price: 3.75, price: 5.5 },
  { name: 'Air Freshener Lavender', category: 'Air Freshener', wholesale_price: 3.75, price: 5.5 },
  { name: 'Air Freshener Dove', category: 'Air Freshener', wholesale_price: 3.75, price: 5.5 },
  { name: 'Air Freshener Green Tea', category: 'Air Freshener', wholesale_price: 3.75, price: 5.5 },
  { name: 'Air Freshener Fa', category: 'Air Freshener', wholesale_price: 3.75, price: 5.5 },
  { name: 'Air Freshener Vanilla', category: 'Air Freshener', wholesale_price: 3.75, price: 5.5 },

  // Diffuser
  { name: 'Diffuser Tulip', category: 'Diffuser', wholesale_price: 5, price: 7 },
  { name: 'Diffuser Blue Wave', category: 'Diffuser', wholesale_price: 5, price: 7 },
  { name: 'Diffuser Dove', category: 'Diffuser', wholesale_price: 5, price: 7 },
  { name: 'Diffuser Fa', category: 'Diffuser', wholesale_price: 5, price: 7 },

  // Hair & Skincare
  { name: 'Hair Oil Rosemary', category: 'Hair & Skincare', wholesale_price: 14, price: 18 },
  { name: 'Hair Serum', category: 'Hair & Skincare', wholesale_price: 7, price: 11 },
  { name: 'Aloe Vera Night Cream', category: 'Hair & Skincare', wholesale_price: 7, price: 10 },
  { name: 'Aloe Vera Night Gel', category: 'Hair & Skincare', wholesale_price: 7, price: 9 },
  { name: 'Collagen Gel', category: 'Hair & Skincare', wholesale_price: 15, price: 20 },
  { name: 'Collagen Gel Lemon', category: 'Hair & Skincare', wholesale_price: 18, price: 23 },
  { name: 'Vitamin C Gel', category: 'Hair & Skincare', wholesale_price: 18, price: 23 },
  { name: 'Vitamin E Gel', category: 'Hair & Skincare', wholesale_price: 18, price: 23 },
  { name: 'Shea Butter Cream', category: 'Hair & Skincare', wholesale_price: 16, price: 20 },
  { name: 'Shampoo', category: 'Hair & Skincare', wholesale_price: 4.5, price: 6.5 },
  { name: 'Shower Gel', category: 'Hair & Skincare', wholesale_price: 3.5, price: 5 },
  { name: 'Tanning Oil', category: 'Hair & Skincare', wholesale_price: 5.5, price: 8 },
  { name: 'Eye Brows Soap', category: 'Hair & Skincare', wholesale_price: 3, price: 5 },

  // Soap (130g)
  { name: 'Soap Coconut (130g)', category: 'Soap (130g)', wholesale_price: 2.2, price: 3 },
  { name: 'Soap Oud (130g)', category: 'Soap (130g)', wholesale_price: 2.2, price: 3 },
  { name: 'Soap Tulip (130g)', category: 'Soap (130g)', wholesale_price: 2.2, price: 3 },
  { name: 'Soap Gar (130g)', category: 'Soap (130g)', wholesale_price: 2.2, price: 3 },
  { name: 'Soap Black Seed (130g)', category: 'Soap (130g)', wholesale_price: 2.2, price: 3.5 },
  { name: 'Soap Jasmine (130g)', category: 'Soap (130g)', wholesale_price: 2.2, price: 3 },

  // Soap (78g)
  { name: 'Soap Honey (78g)', category: 'Soap (78g)', wholesale_price: 1.95, price: 3 },
  { name: 'Soap Black Seed (78g)', category: 'Soap (78g)', wholesale_price: 1.95, price: 3 },
  { name: 'Soap Oud (78g)', category: 'Soap (78g)', wholesale_price: 1.8, price: 2.8 },
  { name: 'Soap Jourry (78g)', category: 'Soap (78g)', wholesale_price: 1.8, price: 2.8 },
  { name: 'Soap Babonij (78g)', category: 'Soap (78g)', wholesale_price: 1.95, price: 3 },
  { name: 'Soap Ikleel Jabal (78g)', category: 'Soap (78g)', wholesale_price: 1.95, price: 3 },
  { name: 'Soap Gar (78g)', category: 'Soap (78g)', wholesale_price: 1.8, price: 2.8 },
  { name: 'Soap Louban Dakar', category: 'Soap', wholesale_price: 5, price: 8 },
  { name: 'Soap Alarousa', category: 'Soap', wholesale_price: 3.5, price: 5.5 },

  // Sets
  { name: 'Set Soap 6 pcs (Black)', category: 'Sets', wholesale_price: 9, price: 15 },
  { name: 'Set Soap 9 pcs', category: 'Sets', wholesale_price: 12, price: 18 },
  { name: 'Set (Soap + Toula)', category: 'Sets', wholesale_price: 4, price: 6 },
  { name: 'Set Soap + Oil', category: 'Sets', wholesale_price: 6, price: 8.5 },
];

async function updatePrices() {
  console.log('Starting price update...\n');

  const SQL = await initSqlJs();
  
  if (!existsSync(dbPath)) {
    console.error('Database file not found at:', dbPath);
    process.exit(1);
  }

  const fileBuffer = readFileSync(dbPath);
  const db = new SQL.Database(fileBuffer);

  // Add wholesale_price column if it doesn't exist
  console.log('Checking database schema...');
  try {
    db.run('ALTER TABLE products ADD COLUMN wholesale_price REAL');
    console.log('Added wholesale_price column');
  } catch (e) {
    console.log('wholesale_price column already exists');
  }

  // Add category column if it doesn't exist
  try {
    db.run('ALTER TABLE products ADD COLUMN category TEXT');
    console.log('Added category column');
  } catch (e) {
    console.log('category column already exists');
  }

  // First, clear all existing products
  console.log('\nClearing existing products...');
  db.run('DELETE FROM products');
  db.run("DELETE FROM sqlite_sequence WHERE name='products'");

  console.log('Adding products with new prices...\n');
  
  let addedCount = 0;
  
  for (const product of productsToUpdate) {
    try {
      db.run(
        `INSERT INTO products (name, description, price, wholesale_price, category, active, stock_quantity)
         VALUES (?, ?, ?, ?, ?, 1, 100)`,
        [product.name, null, product.price, product.wholesale_price, product.category]
      );
      console.log(`Added: ${product.category} - ${product.name} (Wholesale: $${product.wholesale_price} | Retail: $${product.price})`);
      addedCount++;
    } catch (error) {
      console.error(`Error adding ${product.name}:`, error.message);
    }
  }

  // Save the database
  const data = db.export();
  const buffer = Buffer.from(data);
  writeFileSync(dbPath, buffer);

  console.log('\n========================================');
  console.log('Price update completed!');
  console.log(`Total products added: ${addedCount}`);
  console.log('========================================\n');

  // Show summary by category
  console.log('Products by category:');
  const categories = {};
  for (const p of productsToUpdate) {
    categories[p.category] = (categories[p.category] || 0) + 1;
  }
  for (const [cat, count] of Object.entries(categories)) {
    console.log(`  ${cat}: ${count} products`);
  }
}

updatePrices().catch(console.error);

