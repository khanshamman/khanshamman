import { queryAll, queryOne, run } from '../config/database.js';

export const Product = {
  create: (data) => {
    const result = run(
      `INSERT INTO products (name, description, price, wholesale_price, stock_quantity, image_url, category, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name,
        data.description || null,
        data.price,
        data.wholesale_price || null,
        data.stock_quantity || 0,
        data.image_url || null,
        data.category || null,
        data.active !== undefined ? (data.active ? 1 : 0) : 1
      ]
    );
    return Product.findById(result.lastInsertRowid);
  },

  findById: (id) => {
    return queryOne('SELECT * FROM products WHERE id = ?', [id]);
  },

  findAll: () => {
    return queryAll('SELECT * FROM products ORDER BY category, name');
  },

  findActive: () => {
    return queryAll('SELECT * FROM products WHERE active = 1 ORDER BY category, name');
  },

  update: (id, data) => {
    const fields = [];
    const values = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description);
    }
    if (data.price !== undefined) {
      fields.push('price = ?');
      values.push(data.price);
    }
    if (data.wholesale_price !== undefined) {
      fields.push('wholesale_price = ?');
      values.push(data.wholesale_price);
    }
    if (data.stock_quantity !== undefined) {
      fields.push('stock_quantity = ?');
      values.push(data.stock_quantity);
    }
    if (data.image_url !== undefined) {
      fields.push('image_url = ?');
      values.push(data.image_url);
    }
    if (data.category !== undefined) {
      fields.push('category = ?');
      values.push(data.category);
    }
    if (data.active !== undefined) {
      fields.push('active = ?');
      values.push(data.active ? 1 : 0);
    }

    if (fields.length === 0) return Product.findById(id);

    values.push(id);
    run(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, values);
    return Product.findById(id);
  },

  delete: (id) => {
    return run('DELETE FROM products WHERE id = ?', [id]);
  }
};
