import { useState, useEffect, useMemo } from 'react';
import { productApi } from '../../services/api';
import './Admin.css';

// Predefined categories
const CATEGORIES = [
  'Body Oil',
  'Body Lotion',
  'Hair Mist',
  'Body Mist',
  'Air Freshener',
  'Diffuser',
  'Hair & Skincare',
  'Soap (130g)',
  'Soap (78g)',
  'Soap',
  'Sets',
  'Other'
];

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    wholesale_price: '',
    stock_quantity: '',
    image_url: '',
    active: true
  });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productApi.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories from products
  const availableCategories = useMemo(() => {
    const cats = new Set(products.map(p => p.category || p.description).filter(Boolean));
    return Array.from(cats).sort();
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = filterCategory === 'all' || 
        (product.category || product.description) === filterCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, filterCategory, searchTerm]);

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        category: product.category || product.description || '',
        price: product.price.toString(),
        wholesale_price: product.wholesale_price ? product.wholesale_price.toString() : '',
        stock_quantity: product.stock_quantity.toString(),
        image_url: product.image_url || '',
        active: !!product.active
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        category: '',
        price: '',
        wholesale_price: '',
        stock_quantity: '0',
        image_url: '',
        active: true
      });
    }
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormError('');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name || !formData.price) {
      setFormError('Name and retail price are required');
      return;
    }

    setSaving(true);
    try {
      const data = {
        ...formData,
        description: formData.category || formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        wholesale_price: formData.wholesale_price ? parseFloat(formData.wholesale_price) : null,
        stock_quantity: parseInt(formData.stock_quantity) || 0
      };

      if (editingProduct) {
        await productApi.update(editingProduct.id, data);
      } else {
        await productApi.create(data);
      }

      closeModal();
      fetchProducts();
    } catch (error) {
      setFormError(error.response?.data?.error || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return;
    }

    try {
      await productApi.delete(product.id);
      fetchProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const handleToggleActive = async (product) => {
    try {
      await productApi.update(product.id, { active: !product.active });
      fetchProducts();
    } catch (error) {
      console.error('Failed to toggle product status:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return <div className="loading-screen">Loading products...</div>;
  }

  return (
    <div className="admin-products">
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">Manage your product catalog ({products.length} total)</p>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <select 
          value={filterCategory} 
          onChange={(e) => setFilterCategory(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Categories ({products.length})</option>
          {availableCategories.map(cat => (
            <option key={cat} value={cat}>
              {cat} ({products.filter(p => (p.category || p.description) === cat).length})
            </option>
          ))}
        </select>
      </div>

      <div className="card">
        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
            <h3>{searchTerm || filterCategory !== 'all' ? 'No products found' : 'No products yet'}</h3>
            <p>{searchTerm || filterCategory !== 'all' ? 'Try adjusting your filters' : 'Add your first product to get started'}</p>
            {!searchTerm && filterCategory === 'all' && (
              <button onClick={() => openModal()} className="btn btn-primary">Add Product</button>
            )}
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Wholesale</th>
                  <th>Retail</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product.id} className={!product.active ? 'inactive-row' : ''}>
                    <td>
                      <div className="product-cell">
                        <div className="product-image">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} />
                          ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                            </svg>
                          )}
                        </div>
                        <div className="product-info">
                          <span className="product-name">{product.name}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="category-badge">{product.category || product.description || '-'}</span>
                    </td>
                    <td className="font-mono price-wholesale">
                      {product.wholesale_price ? formatCurrency(product.wholesale_price) : '-'}
                    </td>
                    <td className="font-mono price-retail">{formatCurrency(product.price)}</td>
                    <td>{product.stock_quantity}</td>
                    <td>
                      <button 
                        className={`toggle-btn ${product.active ? 'active' : ''}`}
                        onClick={() => handleToggleActive(product)}
                      >
                        <span className="toggle-track">
                          <span className="toggle-thumb"></span>
                        </span>
                        {product.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button onClick={() => openModal(product)} className="btn btn-ghost btn-sm">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(product)} className="btn btn-ghost btn-sm text-danger">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={closeModal} className="modal-close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              {formError && <div className="auth-error">{formError}</div>}
              
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  name="category"
                  className="form-input"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Wholesale Price *</label>
                  <input
                    type="number"
                    name="wholesale_price"
                    className="form-input"
                    value={formData.wholesale_price}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                  <span className="form-hint">Price for bulk/wholesale orders</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Retail Price *</label>
                  <input
                    type="number"
                    name="price"
                    className="form-input"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                  <span className="form-hint">Price for individual items</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Stock Quantity</label>
                <input
                  type="number"
                  name="stock_quantity"
                  className="form-input"
                  value={formData.stock_quantity}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Image URL (Optional)</label>
                <input
                  type="url"
                  name="image_url"
                  className="form-input"
                  value={formData.image_url}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleChange}
                  />
                  <span className="checkmark"></span>
                  Product is active and available for ordering
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
