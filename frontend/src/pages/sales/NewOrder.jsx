import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { productApi, orderApi } from '../../services/api';
import './Sales.css';

const SalesNewOrder = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [priceType, setPriceType] = useState('retail'); // 'wholesale' or 'retail'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    client_location: '',
    notes: ''
  });
  
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productApi.getActive();
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getProductPrice = (product) => {
    if (priceType === 'wholesale' && product.wholesale_price) {
      return product.wholesale_price;
    }
    return product.price;
  };

  const addToCart = (product) => {
    const price = getProductPrice(product);
    const existingItem = cart.find(item => item.product_id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + 1, unit_price: price }
          : item
      ));
    } else {
      setCart([...cart, {
        product_id: product.id,
        product_name: product.name,
        unit_price: price,
        quantity: 1,
        price_type: priceType
      }]);
    }
  };

  // Update cart prices when price type changes and filter out invalid products
  useEffect(() => {
    if (cart.length > 0 && products.length > 0) {
      setCart(prevCart => {
        // Filter out items whose products no longer exist
        const validItems = prevCart.filter(item => 
          products.some(p => p.id === item.product_id)
        );
        
        // Update prices for remaining items
        return validItems.map(item => {
          const product = products.find(p => p.id === item.product_id);
          if (product) {
            const newPrice = priceType === 'wholesale' && product.wholesale_price 
              ? product.wholesale_price 
              : product.price;
            return { ...item, unit_price: newPrice, price_type: priceType };
          }
          return item;
        });
      });
    }
  }, [priceType, products]);

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.product_id !== productId));
    } else {
      setCart(cart.map(item =>
        item.product_id === productId
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.client_name.trim()) {
      setError('Client name is required');
      return;
    }

    if (cart.length === 0) {
      setError('Please add at least one product to the order');
      return;
    }

    setSubmitting(true);
    try {
      const orderData = {
        ...formData,
        items: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        }))
      };

      const response = await orderApi.create(orderData);
      navigate(`/sales/orders/${response.data.id}`);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <div className="new-order-page">
      <div className="page-header">
        <h1 className="page-title">Create New Order</h1>
        <p className="page-subtitle">Select products and enter client information</p>
      </div>

      {error && <div className="auth-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

      <div className="new-order-layout">
        <div className="order-form-section">
          <div className="card">
            <h3 className="card-title">Client Information</h3>
            <form id="order-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Client Name *</label>
                <input
                  type="text"
                  name="client_name"
                  className="form-input"
                  value={formData.client_name}
                  onChange={handleChange}
                  placeholder="Enter client name"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="client_email"
                    className="form-input"
                    value={formData.client_email}
                    onChange={handleChange}
                    placeholder="client@email.com"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    name="client_phone"
                    className="form-input"
                    value={formData.client_phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  name="client_location"
                  className="form-input"
                  value={formData.client_location}
                  onChange={handleChange}
                  placeholder="City, State or full address"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  name="notes"
                  className="form-textarea"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any special instructions..."
                  rows="3"
                />
              </div>
            </form>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 className="card-title" style={{ margin: 0 }}>Select Products</h3>
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.08)', borderRadius: '8px', padding: '4px' }}>
                <button 
                  type="button"
                  onClick={() => setPriceType('wholesale')}
                  style={{ 
                    padding: '8px 16px', 
                    border: 'none', 
                    background: priceType === 'wholesale' ? '#d4a574' : 'transparent', 
                    color: priceType === 'wholesale' ? '#000' : '#888',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Wholesale
                </button>
                <button 
                  type="button"
                  onClick={() => setPriceType('retail')}
                  style={{ 
                    padding: '8px 16px', 
                    border: 'none', 
                    background: priceType === 'retail' ? '#d4a574' : 'transparent', 
                    color: priceType === 'retail' ? '#000' : '#888',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Retail
                </button>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" style={{ width: '16px', height: '16px', flexShrink: 0 }}>
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ flex: 1, background: 'none', border: 'none', fontSize: '0.85rem', color: 'white', outline: 'none' }}
                />
              </div>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'white', fontSize: '0.85rem', minWidth: '140px' }}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="product-selector">
              {filteredProducts.length === 0 ? (
                <div className="no-products">No products found</div>
              ) : (
                filteredProducts.map(product => (
                  <div key={product.id} className="product-select-item">
                    <div className="product-select-info">
                      <span className="product-select-name">{product.name}</span>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        {product.wholesale_price && (
                          <span style={{ 
                            fontSize: '0.75rem', 
                            padding: '2px 6px', 
                            borderRadius: '4px',
                            background: priceType === 'wholesale' ? 'rgba(212, 165, 116, 0.2)' : 'rgba(255,255,255,0.05)',
                            color: priceType === 'wholesale' ? '#d4a574' : '#666',
                            fontWeight: priceType === 'wholesale' ? 600 : 400,
                            fontFamily: 'monospace'
                          }}>
                            W: {formatCurrency(product.wholesale_price)}
                          </span>
                        )}
                        <span style={{ 
                          fontSize: '0.75rem', 
                          padding: '2px 6px', 
                          borderRadius: '4px',
                          background: priceType === 'retail' ? 'rgba(212, 165, 116, 0.2)' : 'rgba(255,255,255,0.05)',
                          color: priceType === 'retail' ? '#d4a574' : '#666',
                          fontWeight: priceType === 'retail' ? 600 : 400,
                          fontFamily: 'monospace'
                        }}>
                          R: {formatCurrency(product.price)}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => addToCart(product)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                      Add
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="order-cart-section">
          <div className="card cart-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 className="card-title" style={{ margin: 0 }}>Order Summary</h3>
              {cart.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    fontWeight: 600, 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    textTransform: 'uppercase',
                    background: priceType === 'wholesale' ? 'rgba(129, 140, 248, 0.15)' : 'rgba(212, 165, 116, 0.15)',
                    color: priceType === 'wholesale' ? '#818cf8' : '#d4a574'
                  }}>
                    {priceType === 'wholesale' ? 'Wholesale' : 'Retail'}
                  </span>
                  <button 
                    type="button" 
                    onClick={() => setCart([])}
                    style={{ 
                      fontSize: '0.7rem', 
                      padding: '4px 8px', 
                      background: 'rgba(220, 53, 69, 0.1)', 
                      color: '#dc3545', 
                      border: 'none', 
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
            
            {cart.length === 0 ? (
              <div className="cart-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                <p>No items in order</p>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map(item => (
                    <div key={item.product_id} className="cart-item">
                      <div className="cart-item-info">
                        <span className="cart-item-name">{item.product_name}</span>
                        <span className="cart-item-price">{formatCurrency(item.unit_price)}</span>
                      </div>
                      <div className="cart-item-controls">
                        <div className="quantity-control">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              if (val > 0) {
                                updateQuantity(item.product_id, val);
                              }
                            }}
                            className="quantity-input"
                          />
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                        <span className="cart-item-total">
                          {formatCurrency(item.unit_price * item.quantity)}
                        </span>
                        <button
                          type="button"
                          className="cart-item-remove"
                          onClick={() => removeFromCart(item.product_id)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-total">
                  <span>Total</span>
                  <span className="cart-total-value">{formatCurrency(calculateTotal())}</span>
                </div>
              </>
            )}

            <button
              type="submit"
              form="order-form"
              className="btn btn-primary btn-lg cart-submit"
              disabled={submitting || cart.length === 0}
            >
              {submitting ? 'Creating Order...' : 'Create Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesNewOrder;
