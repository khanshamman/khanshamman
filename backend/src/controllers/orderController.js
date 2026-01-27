import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';

export const createOrder = async (req, res) => {
  try {
    const { client_name, client_email, client_phone, client_location, notes, items } = req.body;

    if (!client_name || !items || !items.length) {
      return res.status(400).json({ error: 'Client name and at least one item are required' });
    }

    // Calculate total and validate items
    let total_amount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product_id);
      if (!product) {
        return res.status(400).json({ error: `Product with ID ${item.product_id} not found` });
      }
      if (!product.active) {
        return res.status(400).json({ error: `Product "${product.name}" is not available` });
      }

      const quantity = parseInt(item.quantity) || 1;
      // Use unit_price from request if provided (for wholesale/retail), otherwise use product.price
      const unit_price = item.unit_price !== undefined ? parseFloat(item.unit_price) : parseFloat(product.price);
      total_amount += unit_price * quantity;

      orderItems.push({
        product_id: item.product_id,
        quantity,
        unit_price
      });
    }

    const order = await Order.create({
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

export const getAllOrders = async (req, res) => {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.sales_user_id) filters.sales_user_id = parseInt(req.query.sales_user_id);

    const orders = await Order.findAll(filters);
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const filters = { sales_user_id: req.user.id };
    if (req.query.status) filters.status = req.query.status;

    const orders = await Order.findAll(filters);
    res.json(orders);
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
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

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Valid status is required' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updatedOrder = await Order.updateStatus(req.params.id, status);
    res.json(updatedOrder);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

export const getNotificationCount = async (req, res) => {
  try {
    const count = await Order.countUnnotified();
    res.json({ count });
  } catch (error) {
    console.error('Get notification count error:', error);
    res.status(500).json({ error: 'Failed to get notification count' });
  }
};

export const getUnnotifiedOrders = async (req, res) => {
  try {
    const orders = await Order.findUnnotified();
    res.json(orders);
  } catch (error) {
    console.error('Get unnotified orders error:', error);
    res.status(500).json({ error: 'Failed to fetch unnotified orders' });
  }
};

export const markOrderNotified = async (req, res) => {
  try {
    await Order.markAsNotified(req.params.id);
    res.json({ message: 'Order marked as notified' });
  } catch (error) {
    console.error('Mark order notified error:', error);
    res.status(500).json({ error: 'Failed to mark order as notified' });
  }
};

export const markAllOrdersNotified = async (req, res) => {
  try {
    await Order.markAllAsNotified();
    res.json({ message: 'All orders marked as notified' });
  } catch (error) {
    console.error('Mark all orders notified error:', error);
    res.status(500).json({ error: 'Failed to mark orders as notified' });
  }
};

export const getSalesUsers = async (req, res) => {
  try {
    const users = await User.findAllSales();
    res.json(users);
  } catch (error) {
    console.error('Get sales users error:', error);
    res.status(500).json({ error: 'Failed to fetch sales users' });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Sales can only delete their own orders
    if (req.user.role === 'sales' && order.sales_user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Order.delete(req.params.id);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
};
