import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../../database.sqlite');

const products = [
    // Body Oil
    { name: 'Body Oil - Passion Fruits', category: 'Body Oil', price: 11.3 },
    { name: 'Body Oil - Green Tea', category: 'Body Oil', price: 11.5 },
    { name: 'Body Oil - Coconut Milk Rose', category: 'Body Oil', price: 11.3 },
    { name: 'Body Oil - Coconut Milk', category: 'Body Oil', price: 11.3 },
    { name: 'Body Oil - Papaya', category: 'Body Oil', price: 11.3 },
    { name: 'Body Oil - Dove', category: 'Body Oil', price: 11.3 },
    { name: 'Body Oil - Rose Vanilla', category: 'Body Oil', price: 11.3 },
    { name: 'Body Oil - Musk Tahara', category: 'Body Oil', price: 11.3 },
    { name: 'Body Oil - Blooming Rose', category: 'Body Oil', price: 12 },

    // Body Lotion
    { name: 'Body Lotion - Coconut Milk Rose', category: 'Body Lotion', price: 10 },
    { name: 'Body Lotion - Rose Vanilla', category: 'Body Lotion', price: 10 },
    { name: 'Body Lotion - Musk Tahara', category: 'Body Lotion', price: 10 },
    { name: 'Body Lotion - Coconut Milk', category: 'Body Lotion', price: 10 },
    { name: 'Body Lotion - Passion Fruits', category: 'Body Lotion', price: 10 },
    { name: 'Body Lotion - Dove', category: 'Body Lotion', price: 10 },
    { name: 'Body Lotion - Green Tea', category: 'Body Lotion', price: 10 },
    { name: 'Body Lotion - Blooming Rose', category: 'Body Lotion', price: 11 },

    // Hair Mist
    { name: 'Hair Mist - Musk Tahara', category: 'Hair Mist', price: 8.5 },
    { name: 'Hair Mist - Paradise', category: 'Hair Mist', price: 8.5 },
    { name: 'Hair Mist - Rose Island', category: 'Hair Mist', price: 8.5 },
    { name: 'Hair Mist - Green Tea', category: 'Hair Mist', price: 8.5 },
    { name: 'Hair Mist - Blooming Rose', category: 'Hair Mist', price: 10 },
    { name: 'Hair Mist - White Angel', category: 'Hair Mist', price: 8.5 },
    { name: 'Hair Mist - Coconut Milk Rose', category: 'Hair Mist', price: 8.5 },

    // Body Mist
    { name: 'Body Mist - Musk Tahara', category: 'Body Mist', price: 8.5 },
    { name: 'Body Mist - Paradise', category: 'Body Mist', price: 8.5 },
    { name: 'Body Mist - White Angel', category: 'Body Mist', price: 8.5 },
    { name: 'Body Mist - Green Tea', category: 'Body Mist', price: 8.5 },
    { name: 'Body Mist - Coconut Milk Rose', category: 'Body Mist', price: 8.5 },
    { name: 'Body Mist - Rose Island', category: 'Body Mist', price: 8.5 },
    { name: 'Body Mist - Blooming Rose', category: 'Body Mist', price: 10 },

    // Air Freshener
    { name: 'Air Freshener - Pine', category: 'Air Freshener', price: 5.5 },
    { name: 'Air Freshener - Lavender', category: 'Air Freshener', price: 5.5 },
    { name: 'Air Freshener - Dove', category: 'Air Freshener', price: 5.5 },
    { name: 'Air Freshener - Green Tea', category: 'Air Freshener', price: 5.5 },
    { name: 'Air Freshener - Fa', category: 'Air Freshener', price: 5.5 },
    { name: 'Air Freshener - Vanilla', category: 'Air Freshener', price: 5.5 },

    // Diffuser
    { name: 'Diffuser - Tulip', category: 'Diffuser', price: 7 },
    { name: 'Diffuser - Blue Wave', category: 'Diffuser', price: 7 },
    { name: 'Diffuser - Dove', category: 'Diffuser', price: 7 },
    { name: 'Diffuser - Fa', category: 'Diffuser', price: 7 },

    // Hair
    { name: 'Hair Oil - Rosemary', category: 'Hair', price: 18 },
    { name: 'Hair Serum', category: 'Hair', price: 11 },
    { name: 'Shampoo', category: 'Hair', price: 6.5 },

    // Soap (130g)
    { name: 'Soap (130g) - Coconut', category: 'Soap (130g)', price: 3 },
    { name: 'Soap (130g) - Oud', category: 'Soap (130g)', price: 3 },
    { name: 'Soap (130g) - Tulip', category: 'Soap (130g)', price: 3 },
    { name: 'Soap (130g) - Gar', category: 'Soap (130g)', price: 3 },
    { name: 'Soap (130g) - Black Seed', category: 'Soap (130g)', price: 3.5 },
    { name: 'Soap (130g) - Jasmine', category: 'Soap (130g)', price: 3 },

    // Soap (78g)
    { name: 'Soap (78g) - Honey', category: 'Soap (78g)', price: 3 },
    { name: 'Soap (78g) - Black Seed', category: 'Soap (78g)', price: 3 },
    { name: 'Soap (78g) - Oud', category: 'Soap (78g)', price: 2.8 },
    { name: 'Soap (78g) - Jourry', category: 'Soap (78g)', price: 2.8 },
    { name: 'Soap (78g) - Babonij', category: 'Soap (78g)', price: 3 },
    { name: 'Soap (78g) - Ikleel Jaball', category: 'Soap (78g)', price: 3 },
    { name: 'Soap (78g) - Gar', category: 'Soap (78g)', price: 2.8 },

    // Sets
    { name: 'Set Soap 6 pcs (Black)', category: 'Sets', price: 15 },
    { name: 'Set Soap 9 pcs', category: 'Sets', price: 18 },
    { name: 'Set (Soap + Toula)', category: 'Sets', price: 6 },
    { name: 'Set Soap + Oil', category: 'Sets', price: 8.5 },

    // Face / Skin
    { name: 'Aloe Vera Night Cream', category: 'Face / Skin', price: 10 },
    { name: 'Aloe Vera Night Gel', category: 'Face / Skin', price: 9 },
    { name: 'Collagen Gel', category: 'Face / Skin', price: 20 },
    { name: 'Collagen Gel Lemon', category: 'Face / Skin', price: 23 },
    { name: 'Vitamin C Gel', category: 'Face / Skin', price: 23 },
    { name: 'Vitamin E Gel', category: 'Face / Skin', price: 23 },
    { name: 'Shea Butter Cream', category: 'Face / Skin', price: 20 },
    { name: 'Eye Brows Soap', category: 'Face / Skin', price: 5 },
    { name: 'Shower Gel', category: 'Face / Skin', price: 5 },
    { name: 'Tanning Oil', category: 'Face / Skin', price: 8 },
];

async function replaceProducts() {
    const SQL = await initSqlJs();
    
    let db;
    if (existsSync(dbPath)) {
        const fileBuffer = readFileSync(dbPath);
        db = new SQL.Database(fileBuffer);
    } else {
        console.error('Database file not found. Please start the backend server first.');
        process.exit(1);
    }
    
    // Add category column if it doesn't exist
    try {
        db.run('ALTER TABLE products ADD COLUMN category TEXT');
    } catch (e) {
        // Column might already exist
    }
    
    console.log('Clearing existing products...');
    db.run('DELETE FROM products');
    
    console.log('Adding new products...\n');
    
    let inserted = 0;
    
    for (const product of products) {
        db.run(
            'INSERT INTO products (name, description, price, stock_quantity, category, active) VALUES (?, ?, ?, ?, ?, ?)',
            [product.name, product.category, product.price, 100, product.category, 1]
        );
        inserted++;
        console.log(`Added: ${product.name} - $${product.price}`);
    }
    
    // Save to file
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(dbPath, buffer);
    
    console.log(`\n========================================`);
    console.log(`Products replaced successfully!`);
    console.log(`Total products added: ${inserted}`);
    console.log(`========================================`);
    
    // Show summary by category
    console.log('\nProducts by category:');
    const categories = {};
    for (const p of products) {
        categories[p.category] = (categories[p.category] || 0) + 1;
    }
    for (const [cat, count] of Object.entries(categories)) {
        console.log(`  ${cat}: ${count}`);
    }
    
    db.close();
}

replaceProducts().catch(err => {
    console.error('Error replacing products:', err);
    process.exit(1);
});

