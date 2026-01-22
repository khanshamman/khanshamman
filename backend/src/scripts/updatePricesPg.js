import pg from 'pg';

const { Pool } = pg;

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Updated price list from the spreadsheet
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
  { name: 'Body oil passion fruits', category: 'Body Oil', wholesale_price: 7.30, price: 11.30 },
  { name: 'Body oil green tea', category: 'Body Oil', wholesale_price: 7.50, price: 11.50 },
  { name: 'Body oil coconut milk rose', category: 'Body Oil', wholesale_price: 7.30, price: 11.30 },
  { name: 'Body oil coconut milk', category: 'Body Oil', wholesale_price: 7.30, price: 11.30 },
  { name: 'Body oil papaya', category: 'Body Oil', wholesale_price: 7.30, price: 11.30 },
  { name: 'Body oil Dove', category: 'Body Oil', wholesale_price: 7.30, price: 11.30 },
  { name: 'Body oil rose vanilla', category: 'Body Oil', wholesale_price: 7.30, price: 11.30 },
  { name: 'Body oil musk tahara', category: 'Body Oil', wholesale_price: 7.30, price: 11.30 },
  { name: 'Body oil blooming rose', category: 'Body Oil', wholesale_price: 8, price: 12 },

  // Body Lotion
  { name: 'Body Lotion Coconut Milk Rose', category: 'Body Lotion', wholesale_price: 6, price: 10 },
  { name: 'Body Lotion Rose Vanilla', category: 'Body Lotion', wholesale_price: 6, price: 10 },
  { name: 'Body Lotion Musk Tahara', category: 'Body Lotion', wholesale_price: 6.50, price: 10 },
  { name: 'Body Lotion Coconut Milk', category: 'Body Lotion', wholesale_price: 6, price: 10 },
  { name: 'Body Lotion Passion Fruits', category: 'Body Lotion', wholesale_price: 6, price: 10 },
  { name: 'Body Lotion Dove', category: 'Body Lotion', wholesale_price: 6.50, price: 10 },
  { name: 'Body Lotion Green Tea', category: 'Body Lotion', wholesale_price: 6.50, price: 10 },
  { name: 'Body Lotion Blooming Rose', category: 'Body Lotion', wholesale_price: 6.80, price: 11 },
  { name: 'Body lotion coconut milk rose', category: 'Body Lotion', wholesale_price: 6, price: 10 },
  { name: 'Body lotion rose vanilla', category: 'Body Lotion', wholesale_price: 6, price: 10 },
  { name: 'Body lotion musk tahara', category: 'Body Lotion', wholesale_price: 6.50, price: 10 },
  { name: 'Body lotion coconut milk', category: 'Body Lotion', wholesale_price: 6, price: 10 },
  { name: 'Body lotion passion fruits', category: 'Body Lotion', wholesale_price: 6, price: 10 },
  { name: 'Body lotion Dove', category: 'Body Lotion', wholesale_price: 6.50, price: 10 },
  { name: 'Body lotion green tea', category: 'Body Lotion', wholesale_price: 6.50, price: 10 },
  { name: 'Body lotion blooming rose', category: 'Body Lotion', wholesale_price: 6.80, price: 11 },

  // Hair Mist
  { name: 'Hair Mist Musk Tahara', category: 'Hair Mist', wholesale_price: 5.50, price: 8.50 },
  { name: 'Hair Mist Paradise', category: 'Hair Mist', wholesale_price: 5, price: 8.50 },
  { name: 'Hair Mist Rose Island', category: 'Hair Mist', wholesale_price: 5, price: 8.50 },
  { name: 'Hair Mist Green Tea', category: 'Hair Mist', wholesale_price: 5.50, price: 8.50 },
  { name: 'Hair Mist Blooming Rose', category: 'Hair Mist', wholesale_price: 6, price: 10 },
  { name: 'Hair Mist White Angle', category: 'Hair Mist', wholesale_price: 5, price: 8.50 },
  { name: 'Hair Mist Coconut Milk Rose', category: 'Hair Mist', wholesale_price: 5, price: 8.50 },
  { name: 'Hair mist musk tahara', category: 'Hair Mist', wholesale_price: 5.50, price: 8.50 },
  { name: 'Hair mist paradise', category: 'Hair Mist', wholesale_price: 5, price: 8.50 },
  { name: 'Hair mist rose island', category: 'Hair Mist', wholesale_price: 5, price: 8.50 },
  { name: 'Hair mist green tea', category: 'Hair Mist', wholesale_price: 5.50, price: 8.50 },
  { name: 'Hair mist blooming rose', category: 'Hair Mist', wholesale_price: 6, price: 10 },
  { name: 'Hair mist white angle', category: 'Hair Mist', wholesale_price: 5, price: 8.50 },
  { name: 'Hair mist coconut milk rose', category: 'Hair Mist', wholesale_price: 5, price: 8.50 },

  // Body Mist
  { name: 'Body Mist Musk Tahara', category: 'Body Mist', wholesale_price: 5.50, price: 8.50 },
  { name: 'Body Mist Paradise', category: 'Body Mist', wholesale_price: 5, price: 8.50 },
  { name: 'Body Mist White Angle', category: 'Body Mist', wholesale_price: 5, price: 8.50 },
  { name: 'Body Mist Green Tea', category: 'Body Mist', wholesale_price: 5.50, price: 8.50 },
  { name: 'Body Mist Coconut Milk Rose', category: 'Body Mist', wholesale_price: 5, price: 8.50 },
  { name: 'Body Mist Rose Island', category: 'Body Mist', wholesale_price: 5, price: 8.50 },
  { name: 'Body Mist Blooming Rose', category: 'Body Mist', wholesale_price: 6, price: 10 },
  { name: 'Body mist musk tahara', category: 'Body Mist', wholesale_price: 5.50, price: 8.50 },
  { name: 'Body mist paradise', category: 'Body Mist', wholesale_price: 5, price: 8.50 },
  { name: 'Body mist white angle', category: 'Body Mist', wholesale_price: 5, price: 8.50 },
  { name: 'Body mist green tea', category: 'Body Mist', wholesale_price: 5.50, price: 8.50 },
  { name: 'Body mist coconut milk rose', category: 'Body Mist', wholesale_price: 5, price: 8.50 },
  { name: 'Body mist rose island', category: 'Body Mist', wholesale_price: 5, price: 8.50 },
  { name: 'Body mist blooming rose', category: 'Body Mist', wholesale_price: 6, price: 10 },

  // Air Refresher
  { name: 'Air Refresher Pine', category: 'Air Freshener', wholesale_price: 3.75, price: 5.50 },
  { name: 'Air Refresher Lavender', category: 'Air Freshener', wholesale_price: 3.75, price: 5.50 },
  { name: 'Air Refresher Dove', category: 'Air Freshener', wholesale_price: 3.75, price: 5.50 },
  { name: 'Air Refresher Green Tea', category: 'Air Freshener', wholesale_price: 3.75, price: 5.50 },
  { name: 'Air Refresher Fa', category: 'Air Freshener', wholesale_price: 3.75, price: 5.50 },
  { name: 'Air Refresher Vanilla', category: 'Air Freshener', wholesale_price: 3.75, price: 5.50 },
  { name: 'Air refresher pine', category: 'Air Freshener', wholesale_price: 3.75, price: 5.50 },
  { name: 'Air refresher lavender', category: 'Air Freshener', wholesale_price: 3.75, price: 5.50 },
  { name: 'Air refresher Dove', category: 'Air Freshener', wholesale_price: 3.75, price: 5.50 },
  { name: 'Air refresher green tea', category: 'Air Freshener', wholesale_price: 3.75, price: 5.50 },
  { name: 'Air refresher Fa', category: 'Air Freshener', wholesale_price: 3.75, price: 5.50 },
  { name: 'Air refresher Vanilla', category: 'Air Freshener', wholesale_price: 3.75, price: 5.50 },

  // Diffuser
  { name: 'Diffuser Tulip', category: 'Diffuser', wholesale_price: 5, price: 7 },
  { name: 'Diffuser Blue Wave', category: 'Diffuser', wholesale_price: 5, price: 7 },
  { name: 'Diffuser Blue wave', category: 'Diffuser', wholesale_price: 5, price: 7 },
  { name: 'Diffuser Dove', category: 'Diffuser', wholesale_price: 5, price: 7 },
  { name: 'Diffuser Fa', category: 'Diffuser', wholesale_price: 5, price: 7 },

  // Hair & Skincare
  { name: 'Hair Oil Rosemary', category: 'Hair & Skincare', wholesale_price: 14, price: 18 },
  { name: 'Hair oil rosemary', category: 'Hair & Skincare', wholesale_price: 14, price: 18 },
  { name: 'Hair Serum', category: 'Hair & Skincare', wholesale_price: 7, price: 11 },
  { name: 'Hair serum', category: 'Hair & Skincare', wholesale_price: 7, price: 11 },
  { name: 'Aloe Vera Night Cream', category: 'Hair & Skincare', wholesale_price: 7, price: 10 },
  { name: 'Aloe Vera Night Gel', category: 'Hair & Skincare', wholesale_price: 7, price: 9 },
  { name: 'Collagen Gel', category: 'Hair & Skincare', wholesale_price: 15, price: 20 },
  { name: 'Collagen Gel Lemon', category: 'Hair & Skincare', wholesale_price: 18, price: 23 },
  { name: 'Vitamin C Gel', category: 'Hair & Skincare', wholesale_price: 18, price: 23 },
  { name: 'Vitamin E Gel', category: 'Hair & Skincare', wholesale_price: 18, price: 23 },
  { name: 'Shea Butter Cream', category: 'Hair & Skincare', wholesale_price: 16, price: 20 },
  { name: 'Shampoo', category: 'Hair & Skincare', wholesale_price: 4.50, price: 6.50 },
  { name: 'Shower Gel', category: 'Hair & Skincare', wholesale_price: 3.50, price: 5.50 },
  { name: 'Shower gel', category: 'Hair & Skincare', wholesale_price: 3.50, price: 5.50 },
  { name: 'Tanning Oil', category: 'Hair & Skincare', wholesale_price: 5.50, price: 8 },
  { name: 'Tanning oil', category: 'Hair & Skincare', wholesale_price: 5.50, price: 8 },
  { name: 'Eye Brows Soap', category: 'Hair & Skincare', wholesale_price: 3, price: 5 },

  // Soap (130g)
  { name: 'Soap Coconut (130g)', category: 'Soap (130g)', wholesale_price: 2.20, price: 3 },
  { name: 'Soap Oud (130g)', category: 'Soap (130g)', wholesale_price: 2.20, price: 3 },
  { name: 'Soap Gar (130g)', category: 'Soap (130g)', wholesale_price: 2.20, price: 3 },
  { name: 'Soap Tulip (130g)', category: 'Soap (130g)', wholesale_price: 2.20, price: 3 },
  { name: 'Soap Black Seed (130g)', category: 'Soap (130g)', wholesale_price: 2.20, price: 3.50 },
  { name: 'Soap Black seed (130g)', category: 'Soap (130g)', wholesale_price: 2.20, price: 3.50 },
  { name: 'Soap Jasmine (130g)', category: 'Soap (130g)', wholesale_price: 2.20, price: 3 },
  { name: 'Soap jasmine (130g)', category: 'Soap (130g)', wholesale_price: 2.20, price: 3 },

  // Soap (78g)
  { name: 'Soap Honey (78g)', category: 'Soap (78g)', wholesale_price: 1.95, price: 3 },
  { name: 'Soap Black Seed (78g)', category: 'Soap (78g)', wholesale_price: 1.95, price: 3 },
  { name: 'Soap Black seed (78g)', category: 'Soap (78g)', wholesale_price: 1.95, price: 3 },
  { name: 'Soap Oud (78g)', category: 'Soap (78g)', wholesale_price: 1.80, price: 2.80 },
  { name: 'Soap Jourry (78g)', category: 'Soap (78g)', wholesale_price: 1.80, price: 2.80 },
  { name: 'Soap jourry (78g)', category: 'Soap (78g)', wholesale_price: 1.80, price: 2.80 },
  { name: 'Soap Babonij (78g)', category: 'Soap (78g)', wholesale_price: 1.95, price: 3 },
  { name: 'Soap Ikleel Jabal (78g)', category: 'Soap (78g)', wholesale_price: 1.95, price: 3 },
  { name: 'Soap ikleel jaball (78g)', category: 'Soap (78g)', wholesale_price: 1.95, price: 3 },
  { name: 'Soap Gar (78g)', category: 'Soap (78g)', wholesale_price: 1.80, price: 2.80 },
  { name: 'Soap Louban Dakar', category: 'Soap', wholesale_price: 5, price: 8 },
  { name: 'Soap Alarousa', category: 'Soap', wholesale_price: 3.50, price: 5.50 },
  { name: 'Soup Alarousa', category: 'Soap', wholesale_price: 3.50, price: 5.50 },

  // Sets
  { name: 'Set Soap 6 pcs (Black)', category: 'Sets', wholesale_price: 9, price: 15 },
  { name: 'Set Soap 6 pcs (black)', category: 'Sets', wholesale_price: 9, price: 15 },
  { name: 'Set Soap 9 pcs', category: 'Sets', wholesale_price: 12, price: 18 },
  { name: 'Set (Soap + Toula)', category: 'Sets', wholesale_price: 4, price: 6 },
  { name: 'Set Soap + Oil', category: 'Sets', wholesale_price: 6, price: 8.50 },
  { name: 'Set Soap + oil', category: 'Sets', wholesale_price: 6, price: 8.50 },
];

async function updatePrices() {
  console.log('Starting price update on PostgreSQL (PRESERVING IMAGES)...\n');

  const client = await pool.connect();
  
  try {
    let updatedCount = 0;
    const updatedNames = new Set();
    
    for (const product of productsToUpdate) {
      try {
        // Only update price, wholesale_price, and category - NOT image_url
        const result = await client.query(
          `UPDATE products 
           SET price = $1, wholesale_price = $2, category = $3
           WHERE LOWER(name) = LOWER($4)`,
          [product.price, product.wholesale_price, product.category, product.name]
        );
        
        if (result.rowCount > 0 && !updatedNames.has(product.name.toLowerCase())) {
          console.log(`✓ Updated: ${product.name} (Wholesale: $${product.wholesale_price} | Retail: $${product.price})`);
          updatedNames.add(product.name.toLowerCase());
          updatedCount++;
        }
      } catch (error) {
        console.error(`✗ Error updating ${product.name}:`, error.message);
      }
    }

    console.log('\n========================================');
    console.log('Price update completed!');
    console.log(`Products updated: ${updatedCount}`);
    console.log('Images preserved: YES ✓');
    console.log('========================================\n');

  } finally {
    client.release();
    await pool.end();
  }
}

updatePrices().catch(console.error);
