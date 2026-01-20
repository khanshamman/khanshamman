import { run, queryAll, initDatabase } from '../config/database.js';

// Initialize database first
await initDatabase();

// All products with wholesale and retail prices
const products = [
  // Body Oils
  { name: 'Body oil passion fruits', category: 'Body Oil', wholesale_price: 6, price: 8.5 },
  { name: 'Body oil green tea', category: 'Body Oil', wholesale_price: 6, price: 8.5 },
  { name: 'Body oil coconut milk', category: 'Body Oil', wholesale_price: 6.5, price: 8.5 },
  { name: 'Body oil papaya', category: 'Body Oil', wholesale_price: 6, price: 8.5 },
  { name: 'Body oil Dove', category: 'Body Oil', wholesale_price: 6, price: 10 },
  { name: 'Body oil rose vanilla', category: 'Body Oil', wholesale_price: 6.5, price: 8.5 },
  { name: 'Body oil musk tahara', category: 'Body Oil', wholesale_price: 6.5, price: 8.5 },
  { name: 'Body oil blooming rose', category: 'Body Oil', wholesale_price: 6.8, price: 8.5 },
  { name: 'Body oil coconut milk rose', category: 'Body Oil', wholesale_price: 7.3, price: 11.3 },

  // Body Lotions
  { name: 'Body lotion rose vanilla', category: 'Body Lotion', wholesale_price: 5.5, price: 7.3 },
  { name: 'Body lotion musk tahara', category: 'Body Lotion', wholesale_price: 5, price: 7.3 },
  { name: 'Body lotion coconut milk', category: 'Body Lotion', wholesale_price: 5, price: 7.3 },
  { name: 'Body lotion passion fruits', category: 'Body Lotion', wholesale_price: 5.5, price: 7.3 },
  { name: 'Body lotion Dove', category: 'Body Lotion', wholesale_price: 6, price: 7.3 },
  { name: 'Body lotion green tea', category: 'Body Lotion', wholesale_price: 5, price: 7.3 },
  { name: 'Body lotion blooming rose', category: 'Body Lotion', wholesale_price: 5, price: 8 },
  { name: 'Body lotion coconut milk rose', category: 'Body Lotion', wholesale_price: 7.5, price: 11.5 },

  // Hair Mist
  { name: 'Hair mist musk tahara', category: 'Hair Mist', wholesale_price: 5.5, price: 11.3 },
  { name: 'Hair mist paradise', category: 'Hair Mist', wholesale_price: 5, price: 11.3 },
  { name: 'Hair mist rose island', category: 'Hair Mist', wholesale_price: 10, price: 11.3 },
  { name: 'Hair mist green tea', category: 'Hair Mist', wholesale_price: 10, price: 11.3 },
  { name: 'Hair mist blooming rose', category: 'Hair Mist', wholesale_price: 10, price: 11.3 },
  { name: 'Hair mist white angle', category: 'Hair Mist', wholesale_price: 10, price: 11.3 },
  { name: 'Hair mist coconut milk rose', category: 'Hair Mist', wholesale_price: 10, price: 12 },

  // Body Mist
  { name: 'Body mist musk tahara', category: 'Body Mist', wholesale_price: 10, price: 7 },
  { name: 'Body mist paradise', category: 'Body Mist', wholesale_price: 10, price: 7 },
  { name: 'Body mist rose island', category: 'Body Mist', wholesale_price: 14, price: 18 },
  { name: 'Body mist blooming rose', category: 'Body Mist', wholesale_price: 3.75, price: 8.5 },
  { name: 'Body mist white angle', category: 'Body Mist', wholesale_price: 3.75, price: 8.5 },
  { name: 'Body mist green tea', category: 'Body Mist', wholesale_price: 3.75, price: 8.5 },
  { name: 'Body mist coconut milk rose', category: 'Body Mist', wholesale_price: 3.75, price: 8.5 },

  // Diffusers
  { name: 'Diffuser Fa', category: 'Diffuser', wholesale_price: 5, price: 7 },
  { name: 'Diffuser Dove', category: 'Diffuser', wholesale_price: 5, price: 7 },
  { name: 'Diffuser Tulip', category: 'Diffuser', wholesale_price: 5, price: 7 },
  { name: 'Diffuser Blue wave', category: 'Diffuser', wholesale_price: 5, price: 7 },

  // Air Refreshers
  { name: 'Air refresher pine', category: 'Air Freshener', wholesale_price: 7, price: 11 },
  { name: 'Air refresher Dove', category: 'Air Freshener', wholesale_price: 2.2, price: 5.5 },
  { name: 'Air refresher Fa', category: 'Air Freshener', wholesale_price: 5, price: 5.5 },
  { name: 'Air refresher Vanilla', category: 'Air Freshener', wholesale_price: 5.5, price: 5.5 },
  { name: 'Air refresher lavender', category: 'Air Freshener', wholesale_price: 2.2, price: 3.5 },
  { name: 'Air refresher green tea', category: 'Air Freshener', wholesale_price: 1.95, price: 3.5 },

  // Soaps (130g)
  { name: 'Soap Tulip (130g)', category: 'Soap (130g)', wholesale_price: 12, price: 18 },
  { name: 'Soap Gar (130g)', category: 'Soap (130g)', wholesale_price: 2.2, price: 10 },
  { name: 'Soap Coconut (130g)', category: 'Soap (130g)', wholesale_price: 2.2, price: 18 },
  { name: 'Soap Oud (130g)', category: 'Soap (130g)', wholesale_price: 2.2, price: 15 },
  { name: 'Soap Black seed (130g)', category: 'Soap (130g)', wholesale_price: 3.75, price: 5.5 },
  { name: 'Soap jasmine (130g)', category: 'Soap (130g)', wholesale_price: 2.2, price: 3 },

  // Soaps (78g)
  { name: 'Soap Honey (78g)', category: 'Soap (78g)', wholesale_price: 1.95, price: 5.5 },
  { name: 'Soap Black seed (78g)', category: 'Soap (78g)', wholesale_price: 1.95, price: 3 },
  { name: 'Soap Oud (78g)', category: 'Soap (78g)', wholesale_price: 1.8, price: 3 },
  { name: 'Soap jourry (78g)', category: 'Soap (78g)', wholesale_price: 1.8, price: 2.8 },
  { name: 'Soap Babonij (78g)', category: 'Soap (78g)', wholesale_price: 1.95, price: 2.8 },
  { name: 'Soap ikleel jaball (78g)', category: 'Soap (78g)', wholesale_price: 1.95, price: 3 },
  { name: 'Soap Gar (78g)', category: 'Soap (78g)', wholesale_price: 1.8, price: 3 },

  // Other Soaps
  { name: 'Soap Louban Dakar', category: 'Soap', wholesale_price: 5, price: 8 },

  // Sets
  { name: 'Set Soap 9 pcs', category: 'Sets', wholesale_price: 5, price: 7 },
  { name: 'Set Soap 6 pcs (black)', category: 'Sets', wholesale_price: 3, price: 8.5 },
  { name: 'Set (Soap + Toula)', category: 'Sets', wholesale_price: 4, price: 6 },
  { name: 'Set Soap + oil', category: 'Sets', wholesale_price: 6, price: 8.5 },

  // Hair & Skin
  { name: 'Hair serum', category: 'Hair & Skincare', wholesale_price: 5, price: 7 },
  { name: 'Hair oil rosemary', category: 'Hair & Skincare', wholesale_price: 6, price: 10 },
  { name: 'Aloe Vera Night Cream', category: 'Hair & Skincare', wholesale_price: 7, price: 9 },
  { name: 'Aloe Vera Night Gel', category: 'Hair & Skincare', wholesale_price: 7, price: 9 },
  { name: 'Collagen Gel', category: 'Hair & Skincare', wholesale_price: 15, price: 20 },
  { name: 'Collagen Gel Lemon', category: 'Hair & Skincare', wholesale_price: 18, price: 23 },
  { name: 'Vitamin C Gel', category: 'Hair & Skincare', wholesale_price: 18, price: 23 },
  { name: 'Vitamin E Gel', category: 'Hair & Skincare', wholesale_price: 18, price: 23 },
  { name: 'Shea Butter Cream', category: 'Hair & Skincare', wholesale_price: 16, price: 20 },

  // Other
  { name: 'Soup Alarousa', category: 'Other', wholesale_price: 3.5, price: 5.5 },
  { name: 'Shower gel', category: 'Other', wholesale_price: 3.5, price: 5 },
  { name: 'Tanning oil', category: 'Other', wholesale_price: 5.5, price: 8 },
  { name: 'Eye Brows Soap', category: 'Other', wholesale_price: 3, price: 5 },
  { name: 'Shampoo', category: 'Other', wholesale_price: 4.5, price: 6.5 },
];

async function seedProducts() {
  console.log('Starting product seed...');
  
  // Check if products already exist
  const existingProducts = await queryAll('SELECT COUNT(*) as count FROM products');
  if (parseInt(existingProducts[0].count) > 0) {
    console.log(`Database already has ${existingProducts[0].count} products.`);
    const answer = process.argv.includes('--force');
    if (!answer) {
      console.log('Use --force flag to clear existing products and re-seed.');
      process.exit(0);
    }
    console.log('Clearing existing products...');
    await run('DELETE FROM products');
  }

  let added = 0;
  for (const product of products) {
    try {
      await run(
        `INSERT INTO products (name, description, category, price, wholesale_price, stock_quantity, active)
         VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [
          product.name,
          product.category,
          product.category,
          product.price,
          product.wholesale_price,
          100 // Default stock
        ]
      );
      added++;
      console.log(`Added: ${product.name} - W: $${product.wholesale_price} | R: $${product.price}`);
    } catch (error) {
      console.error(`Failed to add ${product.name}:`, error.message);
    }
  }

  console.log(`\nSuccessfully added ${added} products!`);
}

// Run
await seedProducts();
process.exit(0);
