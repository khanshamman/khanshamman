import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';

export const createOrder = (req, res) => {
  try {
    const { client_name, client_email, client_phone, client_location, notes, items } = req.body;

    if (!client_name || !items || !items.length) {
      return res.status(400).json({ error: 'Client name and at least one item are required' });
    }

    // Calculate total and validate items
    let total_amount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = Product.findById(item.product_id);
      if (!product) {
        return res.status(400).json({ error: `Product with ID ${item.product_id} not found` });
      }
      if (!product.active) {
        return res.status(400).json({ error: `Product "${product.name}" is not available` });
      }

      const quantity = parseInt(item.quantity) || 1;
      const unit_price = product.price;
      total_amount += unit_price * quantity;

      orderItems.push({
        product_id: item.product_id,
        quantity,
        unit_price
      });
    }

    const order = Order.create({
      sales_user_id: req.user.id,
      client_name,
      client_email,
      client_phone,
      client_location,
      total_amount,
      notes
    }, orderItems);

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

export const getAllOrders = (req, res) => {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.sales_user_id) filters.sales_user_id = parseInt(req.query.sales_user_id);

    const orders = Order.findAll(filters);
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const getMyOrders = (req, res) => {
  try {
    const filters = { sales_user_id: req.user.id };
    if (req.query.status) filters.status = req.query.status;

    const orders = Order.findAll(filters);
    res.json(orders);
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const getOrder = (req, res) => {
  try {
    const order = Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Sales can only view their own orders
    if (req.user.role === 'sales' && order.sales_user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

export const updateOrderStatus = (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Valid status is required' });
    }

    const order = Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updatedOrder = Order.updateStatus(req.params.id, status);
    res.json(updatedOrder);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

export const getNotificationCount = (req, res) => {
  try {
    const count = Order.countUnnotified();
    res.json({ count });
  } catch (error) {
    console.error('Get notification count error:', error);
    res.status(500).json({ error: 'Failed to get notification count' });
  }
};

export const getUnnotifiedOrders = (req, res) => {
  try {
    const orders = Order.findUnnotified();
    res.json(orders);
  } catch (error) {
    console.error('Get unnotified orders error:', error);
    res.status(500).json({ error: 'Failed to fetch unnotified orders' });
  }
};

export const markOrderNotified = (req, res) => {
  try {
    Order.markAsNotified(req.params.id);
    res.json({ message: 'Order marked as notified' });
  } catch (error) {
    console.error('Mark order notified error:', error);
    res.status(500).json({ error: 'Failed to mark order as notified' });
  }
};

export const markAllOrdersNotified = (req, res) => {
  try {
    Order.markAllAsNotified();
    res.json({ message: 'All orders marked as notified' });
  } catch (error) {
    console.error('Mark all orders notified error:', error);
    res.status(500).json({ error: 'Failed to mark orders as notified' });
  }
};

export const getSalesUsers = (req, res) => {
  try {
    const users = User.findAllSales();
    res.json(users);
  } catch (error) {
    console.error('Get sales users error:', error);
    res.status(500).json({ error: 'Failed to fetch sales users' });
  }
};

export const deleteOrder = (req, res) => {
  try {
    const order = Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Sales can only delete their own orders
    if (req.user.role === 'sales' && order.sales_user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    Order.delete(req.params.id);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
};

