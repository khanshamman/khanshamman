import { queryAll, queryOne, run, saveDatabase } from '../config/database.js';

export const Order = {
  create: (data, items) => {
    // Create order
    const orderResult = run(
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
      run(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.product_id, item.quantity, item.unit_price]
      );
    }
    
    saveDatabase();
    return Order.findById(orderId);
  },

  findById: (id) => {
    const order = queryOne(`
      SELECT o.*, u.username as sales_username
      FROM orders o
      JOIN users u ON o.sales_user_id = u.id
      WHERE o.id = ?
    `, [id]);
    
    if (!order) return null;
    
    order.items = queryAll(`
      SELECT oi.*, p.name as product_name
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [id]);
    
    return order;
  },

  findAll: (filters = {}) => {
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

    return queryAll(query, params);
  },

  findUnnotified: () => {
    return queryAll(`
      SELECT o.*, u.username as sales_username
      FROM orders o
      JOIN users u ON o.sales_user_id = u.id
      WHERE o.admin_notified = 0
      ORDER BY o.created_at DESC
    `);
  },

  countUnnotified: () => {
    const result = queryOne('SELECT COUNT(*) as count FROM orders WHERE admin_notified = 0');
    return result ? result.count : 0;
  },

  markAsNotified: (id) => {
    return run('UPDATE orders SET admin_notified = 1 WHERE id = ?', [id]);
  },

  markAllAsNotified: () => {
    return run('UPDATE orders SET admin_notified = 1 WHERE admin_notified = 0');
  },

  updateStatus: (id, status) => {
    run('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    return Order.findById(id);
  },

  getOrderItems: (orderId) => {
    return queryAll(`
      SELECT oi.*, p.name as product_name
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [orderId]);
  },

  delete: (id) => {
    // Delete order items first (due to foreign key)
    run('DELETE FROM order_items WHERE order_id = ?', [id]);
    // Delete the order
    run('DELETE FROM orders WHERE id = ?', [id]);
    saveDatabase();
    return { success: true };
  }
};
