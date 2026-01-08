import { Product } from '../models/Product.js';

export const getAllProducts = (req, res) => {
  try {
    const products = Product.findAll();
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const getActiveProducts = (req, res) => {
  try {
    const products = Product.findActive();
    res.json(products);
  } catch (error) {
    console.error('Get active products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const getProduct = (req, res) => {
  try {
    const product = Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

export const createProduct = (req, res) => {
  try {
    const { name, description, price, wholesale_price, stock_quantity, image_url, category, active } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    const product = Product.create({
      name,
      description,
      price: parseFloat(price),
      wholesale_price: wholesale_price ? parseFloat(wholesale_price) : null,
      stock_quantity: parseInt(stock_quantity) || 0,
      image_url,
      category,
      active: active !== false
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

export const updateProduct = (req, res) => {
  try {
    const existing = Product.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const { name, description, price, wholesale_price, stock_quantity, image_url, category, active } = req.body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (wholesale_price !== undefined) updateData.wholesale_price = wholesale_price ? parseFloat(wholesale_price) : null;
    if (stock_quantity !== undefined) updateData.stock_quantity = parseInt(stock_quantity);
    if (image_url !== undefined) updateData.image_url = image_url;
    if (category !== undefined) updateData.category = category;
    if (active !== undefined) updateData.active = active;

    const product = Product.update(req.params.id, updateData);
    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

export const deleteProduct = (req, res) => {
  try {
    const existing = Product.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    Product.delete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};
