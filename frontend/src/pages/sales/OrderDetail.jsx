import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { orderApi } from '../../services/api';
import './Sales.css';

const SalesOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await orderApi.getById(id);
      setOrder(response.data);
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete this order for "${order.client_name}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    try {
      await orderApi.delete(id);
      navigate('/sales/orders');
    } catch (error) {
      console.error('Failed to delete order:', error);
      alert('Failed to delete order. Please try again.');
      setDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return <div className="loading-screen">Loading order...</div>;
  }

  if (!order) {
    return (
      <div className="empty-state">
        <h3>Order not found</h3>
        <Link to="/sales/orders" className="btn btn-primary">Back to Orders</Link>
      </div>
    );
  }

  const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  const currentStatusIndex = statuses.indexOf(order.status);

  return (
    <div className="order-detail">
      <div className="page-header">
        <div>
          <Link to="/sales/orders" className="back-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15,18 9,12 15,6"/>
            </svg>
            Back to Orders
          </Link>
          <h1 className="page-title">Order #{order.id.toString().padStart(4, '0')}</h1>
          <p className="page-subtitle">Placed on {formatDate(order.created_at)}</p>
        </div>
        <div className="header-actions">
          <span className={`status-badge status-${order.status} status-lg`}>
            {order.status}
          </span>
          <button 
            onClick={handleDelete} 
            className="btn btn-danger"
            disabled={deleting}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            {deleting ? 'Deleting...' : 'Delete Order'}
          </button>
        </div>
      </div>

      {/* Order Progress */}
      <div className="card order-progress-card">
        <h3 className="card-title">Order Progress</h3>
        <div className="order-progress">
          {statuses.map((status, index) => (
            <div 
              key={status} 
              className={`progress-step ${index <= currentStatusIndex ? 'completed' : ''} ${index === currentStatusIndex ? 'current' : ''}`}
            >
              <div className="progress-indicator">
                {index < currentStatusIndex ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span className="progress-label">{status}</span>
              {index < statuses.length - 1 && <div className="progress-line" />}
            </div>
          ))}
        </div>
      </div>

      <div className="order-grid">
        <div className="order-main">
          <div className="card">
            <h3 className="card-title">Order Items</h3>
            <div className="order-items">
              {order.items.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="item-info">
                    <span className="item-name">{item.product_name}</span>
                    <span className="item-qty">Qty: {item.quantity}</span>
                  </div>
                  <div className="item-price">
                    <span className="unit-price">{formatCurrency(item.unit_price)} each</span>
                    <span className="line-total">{formatCurrency(item.unit_price * item.quantity)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="order-total">
              <span>Total Amount</span>
              <span className="total-value">{formatCurrency(order.total_amount)}</span>
            </div>
          </div>

          {order.notes && (
            <div className="card">
              <h3 className="card-title">Notes</h3>
              <p className="order-notes">{order.notes}</p>
            </div>
          )}
        </div>

        <div className="order-sidebar">
          <div className="card">
            <h3 className="card-title">Client Information</h3>
            <div className="info-list">
              <div className="info-item">
                <span className="info-label">Name</span>
                <span className="info-value">{order.client_name}</span>
              </div>
              {order.client_email && (
                <div className="info-item">
                  <span className="info-label">Email</span>
                  <span className="info-value">{order.client_email}</span>
                </div>
              )}
              {order.client_phone && (
                <div className="info-item">
                  <span className="info-label">Phone</span>
                  <span className="info-value">{order.client_phone}</span>
                </div>
              )}
              {order.client_location && (
                <div className="info-item">
                  <span className="info-label">Location</span>
                  <span className="info-value">{order.client_location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesOrderDetail;
