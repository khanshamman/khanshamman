import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderApi } from '../../services/api';
import './Admin.css';

const AdminOrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await orderApi.getById(id);
      setOrder(response.data);
      
      // Mark as notified when viewed
      if (!response.data.admin_notified) {
        await orderApi.markNotified(id);
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      const response = await orderApi.updateStatus(id, newStatus);
      setOrder(response.data);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setUpdating(false);
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
        <Link to="/admin/orders" className="btn btn-primary">Back to Orders</Link>
      </div>
    );
  }

  const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  const currentStatusIndex = statuses.indexOf(order.status);

  return (
    <div className="order-detail">
      <div className="page-header">
        <div>
          <Link to="/admin/orders" className="back-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15,18 9,12 15,6"/>
            </svg>
            Back to Orders
          </Link>
          <h1 className="page-title">Order #{order.id.toString().padStart(4, '0')}</h1>
          <p className="page-subtitle">Placed on {formatDate(order.created_at)}</p>
        </div>
        <span className={`status-badge status-${order.status} status-lg`}>
          {order.status}
        </span>
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

          <div className="card">
            <h3 className="card-title">Update Status</h3>
            <div className="status-actions">
              {statuses.map((status, index) => (
                <button
                  key={status}
                  className={`status-btn ${order.status === status ? 'active' : ''} ${index < currentStatusIndex ? 'completed' : ''}`}
                  onClick={() => handleStatusUpdate(status)}
                  disabled={updating || order.status === status}
                >
                  <span className="status-indicator">
                    {index < currentStatusIndex ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20,6 9,17 4,12"/>
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span className="status-name">{status}</span>
                </button>
              ))}
            </div>
          </div>
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

          <div className="card">
            <h3 className="card-title">Sales Representative</h3>
            <div className="sales-rep">
              <div className="rep-avatar">{order.sales_username.charAt(0).toUpperCase()}</div>
              <span className="rep-name">{order.sales_username}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;

