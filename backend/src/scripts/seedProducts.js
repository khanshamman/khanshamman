import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../../database.sqlite');

const products = [
    // Hair Mist
    { name: 'Hair Mist - White Angel', category: 'Hair Mist', price: 0, stock_quantity: 100 },
    { name: 'Hair Mist - Blooming Rose', category: 'Hair Mist', price: 0, stock_quantity: 100 },
    { name: 'Hair Mist - Green Tea', category: 'Hair Mist', price: 0, stock_quantity: 100 },
    { name: 'Hair Mist - Coconut Milk Rose', category: 'Hair Mist', price: 0, stock_quantity: 100 },
    { name: 'Hair Mist - Paradise', category: 'Hair Mist', price: 0, stock_quantity: 100 },
    { name: 'Hair Mist - Papaya', category: 'Hair Mist', price: 0, stock_quantity: 100 },
    { name: 'Hair Mist - Rose Island', category: 'Hair Mist', price: 0, stock_quantity: 100 },
    { name: 'Hair Mist - Musk Al Tahara', category: 'Hair Mist', price: 0, stock_quantity: 100 },

    // Body Mist
    { name: 'Body Mist - White Angel', category: 'Body Mist', price: 0, stock_quantity: 100 },
    { name: 'Body Mist - Blooming Rose', category: 'Body Mist', price: 0, stock_quantity: 100 },
    { name: 'Body Mist - Green Tea', category: 'Body Mist', price: 0, stock_quantity: 100 },
    { name: 'Body Mist - Coconut Milk Rose', category: 'Body Mist', price: 0, stock_quantity: 100 },
    { name: 'Body Mist - Paradise', category: 'Body Mist', price: 0, stock_quantity: 100 },
    { name: 'Body Mist - Papaya', category: 'Body Mist', price: 0, stock_quantity: 100 },
    { name: 'Body Mist - Rose Island', category: 'Body Mist', price: 0, stock_quantity: 100 },
    { name: 'Body Mist - Musk Al Tahara', category: 'Body Mist', price: 0, stock_quantity: 100 },

    // Body Oil
    { name: 'Body Oil - Coconut Milk', category: 'Body Oil', price: 0, stock_quantity: 100 },
    { name: 'Body Oil - Blooming Rose', category: 'Body Oil', price: 0, stock_quantity: 100 },
    { name: 'Body Oil - Green Tea', category: 'Body Oil', price: 0, stock_quantity: 100 },
    { name: 'Body Oil - Coconut Milk Rose', category: 'Body Oil', price: 0, stock_quantity: 100 },
    { name: 'Body Oil - Dove', category: 'Body Oil', price: 0, stock_quantity: 100 },
    { name: 'Body Oil - Papaya', category: 'Body Oil', price: 0, stock_quantity: 100 },
    { name: 'Body Oil - Passion Fruit', category: 'Body Oil', price: 0, stock_quantity: 100 },
    { name: 'Body Oil - Musk Al Tahara', category: 'Body Oil', price: 0, stock_quantity: 100 },

    // Body Lotion (Bottle)
    { name: 'Body Lotion (Bottle) - Coconut Milk', category: 'Body Lotion (Bottle)', price: 0, stock_quantity: 100 },
    { name: 'Body Lotion (Bottle) - Rose Vanilla', category: 'Body Lotion (Bottle)', price: 0, stock_quantity: 100 },
    { name: 'Body Lotion (Bottle) - Green Tea', category: 'Body Lotion (Bottle)', price: 0, stock_quantity: 100 },
    { name: 'Body Lotion (Bottle) - Coconut Milk Rose', category: 'Body Lotion (Bottle)', price: 0, stock_quantity: 100 },
    { name: 'Body Lotion (Bottle) - Dove', category: 'Body Lotion (Bottle)', price: 0, stock_quantity: 100 },
    { name: 'Body Lotion (Bottle) - Papaya', category: 'Body Lotion (Bottle)', price: 0, stock_quantity: 100 },
    { name: 'Body Lotion (Bottle) - Passion Fruit', category: 'Body Lotion (Bottle)', price: 0, stock_quantity: 100 },
    { name: 'Body Lotion (Bottle) - Musk Al Tahara', category: 'Body Lotion (Bottle)', price: 0, stock_quantity: 100 },
    { name: 'Body Lotion (Bottle) - Blooming Rose', category: 'Body Lotion (Bottle)', price: 0, stock_quantity: 100 },

    // Body Lotion (Glass / Luxury)
    { name: 'Body Lotion (Luxury) - Coconut Milk', category: 'Body Lotion (Luxury)', price: 0, stock_quantity: 100 },
    { name: 'Body Lotion (Luxury) - Rose Vanilla', category: 'Body Lotion (Luxury)', price: 0, stock_quantity: 100 },
    { name: 'Body Lotion (Luxury) - Green Tea', category: 'Body Lotion (Luxury)', price: 0, stock_quantity: 100 },
    { name: 'Body Lotion (Luxury) - Coconut Milk Rose', category: 'Body Lotion (Luxury)', price: 0, stock_quantity: 100 },
    { name: 'Body Lotion (Luxury) - Dove', category: 'Body Lotion (Luxury)', price: 0, stock_quantity: 100 },
    { name: 'Body Lotion (Luxury) - Papaya', category: 'Body Lotion (Luxury)', price: 0, stock_quantity: 100 },
    { name: 'Body Lotion (Luxury) - Passion Fruit', category: 'Body Lotion (Luxury)', price: 0, stock_quantity: 100 },
    { name: 'Body Lotion (Luxury) - Musk Al Tahara', category: 'Body Lotion (Luxury)', price: 0, stock_quantity: 100 },

    // Hair Oil
    { name: 'Hair Oil - Rosemary', category: 'Hair Oil', price: 0, stock_quantity: 100 },

    // Hair Serum
    { name: 'Hair Serum', category: 'Hair Serum', price: 0, stock_quantity: 100 },

    // Hair Serum Perfume
    { name: 'Hair Serum Perfume', category: 'Hair Serum Perfume', price: 0, stock_quantity: 100 },

    // Face Cream
    { name: 'Face Cream - Shea Butter', category: 'Face Cream', price: 0, stock_quantity: 100 },
    { name: 'Face Cream - Aloe Vera', category: 'Face Cream', price: 0, stock_quantity: 100 },

    // Face Gel
    { name: 'Face Gel - Aloe Vera', category: 'Face Gel', price: 0, stock_quantity: 100 },
    { name: 'Face Gel - Collagen', category: 'Face Gel', price: 0, stock_quantity: 100 },
    { name: 'Face Gel - Lemon', category: 'Face Gel', price: 0, stock_quantity: 100 },
    { name: 'Face Gel - Vitamin E', category: 'Face Gel', price: 0, stock_quantity: 100 },
    { name: 'Face Gel - Vitamin C', category: 'Face Gel', price: 0, stock_quantity: 100 },

    // Soap
    { name: 'Soap - Black Seed', category: 'Soap', price: 0, stock_quantity: 100 },
    { name: 'Soap - Rosemary', category: 'Soap', price: 0, stock_quantity: 100 },
    { name: 'Soap - Coconut', category: 'Soap', price: 0, stock_quantity: 100 },
    { name: 'Soap - Ghar', category: 'Soap', price: 0, stock_quantity: 100 },
    { name: 'Soap - Honey', category: 'Soap', price: 0, stock_quantity: 100 },
    { name: 'Soap - Oud', category: 'Soap', price: 0, stock_quantity: 100 },
    { name: 'Soap - Tulip', category: 'Soap', price: 0, stock_quantity: 100 },
    { name: 'Soap - Chamomile', category: 'Soap', price: 0, stock_quantity: 100 },

    // Air Freshener
    { name: 'Air Freshener - Vanilla', category: 'Air Freshener', price: 0, stock_quantity: 100 },
    { name: 'Air Freshener - Dove', category: 'Air Freshener', price: 0, stock_quantity: 100 },
    { name: 'Air Freshener - Green Tea', category: 'Air Freshener', price: 0, stock_quantity: 100 },
];

async function seedProducts() {
    const SQL = await initSqlJs();
    
    let db;
    if (existsSync(dbPath)) {
        const fileBuffer = readFileSync(dbPath);
        db = new SQL.Database(fileBuffer);
    } else {
        console.error('Database file not found. Please start the backend server first to initialize the database.');
        process.exit(1);
    }
    
    // Add category column if it doesn't exist
    try {
        db.run('ALTER TABLE products ADD COLUMN category TEXT');
    } catch (e) {
        // Column might already exist
    }
    
    console.log('Starting product seeding...\n');
    
    let inserted = 0;
    let skipped = 0;
    
    for (const product of products) {
        // Check if product already exists
        const stmt = db.prepare('SELECT id FROM products WHERE name = ?');
        stmt.bind([product.name]);
        const exists = stmt.step();
        stmt.free();
        
        if (exists) {
            skipped++;
            continue;
        }
        
        db.run(
            'INSERT INTO products (name, description, price, stock_quantity, category, active) VALUES (?, ?, ?, ?, ?, ?)',
            [product.name, product.category, product.price, product.stock_quantity, product.category, 1]
        );
        inserted++;
        console.log(`Added: ${product.name}`);
    }
    
    // Save to file
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(dbPath, buffer);
    
    console.log(`\n========================================`);
    console.log(`Seeding complete!`);
    console.log(`Products inserted: ${inserted}`);
    console.log(`Products skipped (already exist): ${skipped}`);
    console.log(`Total products in list: ${products.length}`);
    console.log(`========================================`);
    
    db.close();
}

seedProducts().catch(err => {
    console.error('Error seeding products:', err);
    process.exit(1);
});
