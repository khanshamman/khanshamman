import { queryAll, queryOne, run, saveDatabase } from '../config/database.js';

export const Order = {
  create: async (data, items) => {
    // Create order
    const orderResult = await run(
      `INSERT INTO orders (sales_user_id, client_name, client_email, client_phone, client_location, total_amount, notes, status, admin_notified)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 0)`,
      [
        data.sales_user_id,
        data.client_name,
        data.client_email || null,
        data.client_phone || null,
        data.client_location || null,
        data.total_amount,
        data.notes || null
      ]
    );
    
    const orderId = orderResult.lastInsertRowid;
    
    // Create order items
    for (const item of items) {
      await run(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.product_id, item.quantity, item.unit_price]
      );
    }
    
    saveDatabase();
    return await Order.findById(orderId);
  },

  findById: async (id) => {
    const order = await queryOne(`
      SELECT o.*, u.username as sales_username
      FROM orders o
      JOIN users u ON o.sales_user_id = u.id
      WHERE o.id = ?
    `, [id]);
    
    if (!order) return null;
    
    order.items = await queryAll(`
      SELECT oi.*, p.name as product_name
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [id]);
    
    return order;
  },

  findAll: async (filters = {}) => {
    let query = `
      SELECT o.*, u.username as sales_username
      FROM orders o
      JOIN users u ON o.sales_user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.sales_user_id) {
      query += ' AND o.sales_user_id = ?';
      params.push(filters.sales_user_id);
    }
    if (filters.status) {
      query += ' AND o.status = ?';
      params.push(filters.status);
    }

    query += ' ORDER BY o.created_at DESC';

    return await queryAll(query, params);
  },

  findUnnotified: async () => {
    return await queryAll(`
      SELECT o.*, u.username as sales_username
      FROM orders o
      JOIN users u ON o.sales_user_id = u.id
      WHERE o.admin_notified = 0
      ORDER BY o.created_at DESC
    `);
  },

  countUnnotified: async () => {
    const result = await queryOne('SELECT COUNT(*) as count FROM orders WHERE admin_notified = 0');
    return result ? parseInt(result.count) : 0;
  },

  markAsNotified: async (id) => {
    return await run('UPDATE orders SET admin_notified = 1 WHERE id = ?', [id]);
  },

  markAllAsNotified: async () => {
    return await run('UPDATE orders SET admin_notified = 1 WHERE admin_notified = 0');
  },

  updateStatus: async (id, status) => {
    await run('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    return await Order.findById(id);
  },

  getOrderItems: async (orderId) => {
    return await queryAll(`
      SELECT oi.*, p.name as product_name
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [orderId]);
  },

  delete: async (id) => {
    // Delete order items first (due to foreign key)
    await run('DELETE FROM order_items WHERE order_id = ?', [id]);
    // Delete the order
    await run('DELETE FROM orders WHERE id = ?', [id]);
    saveDatabase();
    return { success: true };
  }
};
