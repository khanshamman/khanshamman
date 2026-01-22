import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../../database.sqlite');

// Updated price list from the new spreadsheet
const productsToUpdate = [
  // Body Oil
  { name: 'Body Oil Passion Fruits', category: 'Body Oil', wholesale_price: 7.30, price: 11.30 },
  { name: 'Body Oil Green Tea', category: 'Body Oil', wholesale_price: 7.50, price: 11.50 },
  { name: 'Body Oil Coconut Milk Rose', category: 'Body Oil', wholesale_price: 7.30, price: 11.30 },
  { name: 'Body Oil Coconut Milk', category: 'Body Oil', wholesale_price: 7.30, price: 11.30 },
  { name: 'Body Oil Papaya', category: 'Body Oil', wholesale_price: 7.30, price: 11.30 },
  { name: 'Body Oil Dove', category: 'Body Oil', wholesale_price: 7.30, price: 11.30 },
  { name: 'Body Oil Rose Vanilla', category: 'Body Oil', wholesale_price: 7.30, price: 11.30 },
  { name: 'Body Oil Musk Tahara', category: 'Body Oil', wholesale_price: 7.30, price: 11.30 },
  { name: 'Body Oil Blooming Rose', category: 'Body Oil', wholesale_price: 8, price: 12 },

  // Body Lotion
  { name: 'Body Lotion Coconut Milk Rose', category: 'Body Lotion', wholesale_price: 6, price: 10 },
  { name: 'Body Lotion Rose Vanilla', category: 'Body Lotion', wholesale_price: 6, price: 10 },
  { name: 'Body Lotion Musk Tahara', category: 'Body Lotion', wholesale_price: 6.50, price: 10 },
  { name: 'Body Lotion Coconut Milk', category: 'Body Lotion', wholesale_price: 6, price: 10 },
  { name: 'Body Lotion Passion Fruits', category: 'Body Lotion', wholesale_price: 6, price: 10 },
  { name: 'Body Lotion Dove', category: 'Body Lotion', wholesale_price: 6.50, price: 10 },
  { name: 'Body Lotion Green Tea', category: 'Body Lotion', wholesale_price: 6.50, price: 10 },
  { name: 'Body Lotion Blooming Rose', category: 'Body Lotion', wholesale_price: 6.80, price: 11 },

  // Hair Mist
  { name: 'Hair Mist Musk Tahara', category: 'Hair Mist', wholesale_price: 5.50, price: 8.50 },
  { name: 'Hair Mist Paradise', category: 'Hair Mist', wholesale_price: 5, price: 8.50 },
  { name: 'Hair Mist Rose Island', category: 'Hair Mist', wholesale_price: 5, price: 8.50 },
  { name: 'Hair Mist Green Tea', category: 'Hair Mist', wholesale_price: 5.50, price: 8.50 },
  { name: 'Hair Mist Blooming Rose', category: 'Hair Mist', wholesale_price: 6, price: 10 },
  { name: 'Hair Mist White Angle', category: 'Hair Mist', wholesale_price: 5, price: 8.50 },
  { name: 'Hair Mist White Angel', category: 'Hair Mist', wholesale_price: 5, price: 8.50 },
  { name: 'Hair Mist Coconut Milk Rose', category: 'Hair Mist', wholesale_price: 5, price: 8.50 },

  // Body Mist
  { name: 'Body Mist Musk Tahara', category: 'Body Mist', wholesale_price: 5.50, price: 8.50 },
  { name: 'Body Mist Paradise', category: 'Body Mist', wholesale_price: 5, price: 8.50 },
  { name: 'Body Mist White Angle', category: 'Body Mist', wholesale_price: 5, price: 8.50 },
  { name: 'Body Mist White Angel', category: 'Body Mist', wholesale_price: 5, price: 8.50 },
  { name: 'Body Mist Green Tea', category: 'Body Mist', wholesale_price: 5.50, price: 8.50 },
  { name: 'Body Mist Coconut Milk Rose', category: 'Body Mist', wholesale_price: 5, price: 8.50 },
  { name: 'Body Mist Rose Island', category: 'Body Mist', wholesale_price: 5, price: 8.50 },
  { name: 'Body Mist Blooming Rose', category: 'Body Mist', wholesale_price: 6, price: 10 },

  // Air Freshener / Air Refresher (trying both naming conventions)
  { name: 'Air Refresher Pine', category: 'Air Freshener', wholesale_price: 3.75, price: 5.50 },
  { name: 'Air Freshener Pine', category: 'Air Freshener', wholesale_price: 3.75, price: 5.50 },
  { name: 'Air Refresher Lavender', category: 'Air Freshener', wholesale_price: 3.75, price: 5.50 },
  { name: 'Air Freshener Lavender', category: 'Air Freshener', wholesale_price: 3.75, price: 5.50 },
  { name: 'Air Refresher Dove', category: 'Air Freshener', wholesale_price: 3.75, price: 5.50 },
  { name: 'Air Freshener Dove', category: 'Air Freshener', wholesale_price: 3.75, price: 5.50 },
  { name: 'Air Refresher Green Tea', category: 'Air Freshener', wholesale_price: 3.75, price: 5.50 },
  { name: 'Air Freshener Green Tea', category: 'Air Freshener', wholesale_price: 3.75, price: 5.50 },
  { name: 'Air Refresher Fa', category: 'Air Freshener', wholesale_price: 3.75, price: 5.50 },
  { name: 'Air Freshener Fa', category: 'Air Freshener', wholesale_price: 3.75, price: 5.50 },
  { name: 'Air Refresher Vanilla', category: 'Air Freshener', wholesale_price: 3.75, price: 5.50 },
  { name: 'Air Freshener Vanilla', category: 'Air Freshener', wholesale_price: 3.75, price: 5.50 },

  // Diffuser
  { name: 'Diffuser Tulip', category: 'Diffuser', wholesale_price: 5, price: 7 },
  { name: 'Diffuser Blue Wave', category: 'Diffuser', wholesale_price: 5, price: 7 },
  { name: 'Diffuser Blue wave', category: 'Diffuser', wholesale_price: 5, price: 7 },
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
  { name: 'Shampoo', category: 'Hair & Skincare', wholesale_price: 4.50, price: 6.50 },
  { name: 'Shower Gel', category: 'Hair & Skincare', wholesale_price: 3.50, price: 5.50 },
  { name: 'Shawer Gel', category: 'Hair & Skincare', wholesale_price: 3.50, price: 5.50 },
  { name: 'Shawer jel', category: 'Hair & Skincare', wholesale_price: 3.50, price: 5.50 },
  { name: 'Tanning Oil', category: 'Hair & Skincare', wholesale_price: 5.50, price: 8 },
  { name: 'Eye Brows Soap', category: 'Hair & Skincare', wholesale_price: 3, price: 5 },

  // Soap (130g)
  { name: 'Soap Coconut (130g)', category: 'Soap (130g)', wholesale_price: 2.20, price: 3 },
  { name: 'Soap Oud (130g)', category: 'Soap (130g)', wholesale_price: 2.20, price: 3 },
  { name: 'Soap Gar (130g)', category: 'Soap (130g)', wholesale_price: 2.20, price: 3 },
  { name: 'Soap Tulip (130g)', category: 'Soap (130g)', wholesale_price: 2.20, price: 3 },
  { name: 'Soap Black Seed (130g)', category: 'Soap (130g)', wholesale_price: 2.20, price: 3.50 },
  { name: 'Soap Blak Seed (130g)', category: 'Soap (130g)', wholesale_price: 2.20, price: 3.50 },
  { name: 'Soap Jasmine (130g)', category: 'Soap (130g)', wholesale_price: 2.20, price: 3 },

  // Soap (78g)
  { name: 'Soap Honey (78g)', category: 'Soap (78g)', wholesale_price: 1.95, price: 3 },
  { name: 'Soap Black Seed (78g)', category: 'Soap (78g)', wholesale_price: 1.95, price: 3 },
  { name: 'Soap Oud (78g)', category: 'Soap (78g)', wholesale_price: 1.80, price: 2.80 },
  { name: 'Soap Jourry (78g)', category: 'Soap (78g)', wholesale_price: 1.80, price: 2.80 },
  { name: 'Soap Babonij (78g)', category: 'Soap (78g)', wholesale_price: 1.95, price: 3 },
  { name: 'Soap Ikleel Jabal (78g)', category: 'Soap (78g)', wholesale_price: 1.95, price: 3 },
  { name: 'Soap Ikleel Jabali (78g)', category: 'Soap (78g)', wholesale_price: 1.95, price: 3 },
  { name: 'Soap ikleel jabali (78g)', category: 'Soap (78g)', wholesale_price: 1.95, price: 3 },
  { name: 'Soap Gar (78g)', category: 'Soap (78g)', wholesale_price: 1.80, price: 2.80 },
  { name: 'Soap Louban Dakar', category: 'Soap', wholesale_price: 5, price: 8 },
  { name: 'Soap Alarousa', category: 'Soap', wholesale_price: 3.50, price: 5.50 },
  { name: 'Soup Alarousa', category: 'Soap', wholesale_price: 3.50, price: 5.50 },

  // Sets
  { name: 'Set Soap 6 pcs (Black)', category: 'Sets', wholesale_price: 9, price: 15 },
  { name: 'Set Soap 6 pec (Black)', category: 'Sets', wholesale_price: 9, price: 15 },
  { name: 'Set Soap 9 pcs', category: 'Sets', wholesale_price: 12, price: 18 },
  { name: 'Set Soap 9 pec', category: 'Sets', wholesale_price: 12, price: 18 },
  { name: 'Set (Soap + Toula)', category: 'Sets', wholesale_price: 4, price: 6 },
  { name: 'Set (Soap+Toula)', category: 'Sets', wholesale_price: 4, price: 6 },
  { name: 'Set Soap + Oil', category: 'Sets', wholesale_price: 6, price: 8.50 },
  { name: 'Set Soap+Oil', category: 'Sets', wholesale_price: 6, price: 8.50 },
];

async function updatePricesOnly() {
  console.log('Starting price update (PRESERVING IMAGES)...\n');

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

  console.log('\nUpdating prices (images will be preserved)...\n');
  
  let updatedCount = 0;
  const updatedNames = new Set();
  const notFoundProducts = [];
  
  for (const product of productsToUpdate) {
    try {
      // Only update price, wholesale_price, and category - NOT image_url or other fields
      db.run(
        `UPDATE products 
         SET price = ?, wholesale_price = ?, category = ?
         WHERE LOWER(name) = LOWER(?)`,
        [product.price, product.wholesale_price, product.category, product.name]
      );
      
      // Check if any row was updated
      const changes = db.getRowsModified();
      if (changes > 0 && !updatedNames.has(product.name.toLowerCase())) {
        console.log(`✓ Updated: ${product.name} (Wholesale: $${product.wholesale_price} | Retail: $${product.price})`);
        updatedNames.add(product.name.toLowerCase());
        updatedCount++;
      } else if (changes === 0 && !updatedNames.has(product.name.toLowerCase())) {
        // Only add to not found if we haven't already found it with a different name variant
        const alreadyFound = Array.from(updatedNames).some(name => 
          name.replace(/\s+/g, '').toLowerCase() === product.name.replace(/\s+/g, '').toLowerCase()
        );
        if (!alreadyFound) {
          notFoundProducts.push(product);
        }
      }
    } catch (error) {
      console.error(`✗ Error updating ${product.name}:`, error.message);
    }
  }

  // Save the database
  const data = db.export();
  const buffer = Buffer.from(data);
  writeFileSync(dbPath, buffer);

  // Get unique not found products
  const uniqueNotFound = [];
  const seenNames = new Set();
  for (const p of notFoundProducts) {
    const normalizedName = p.name.replace(/\s+/g, '').toLowerCase();
    if (!seenNames.has(normalizedName)) {
      seenNames.add(normalizedName);
      uniqueNotFound.push(p);
    }
  }

  console.log('\n========================================');
  console.log('Price update completed!');
  console.log(`Products updated: ${updatedCount}`);
  console.log(`Products not found: ${uniqueNotFound.length}`);
  console.log('Images preserved: YES ✓');
  console.log('========================================\n');

  // If there are products not found, list them
  if (uniqueNotFound.length > 0) {
    console.log('⚠ Products not found in database (may need to be added manually):');
    for (const p of uniqueNotFound) {
      console.log(`  - ${p.name}`);
    }
  }
}

updatePricesOnly().catch(console.error);
