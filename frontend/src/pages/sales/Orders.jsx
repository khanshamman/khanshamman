import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../../services/api';
import './Sales.css';

const SalesOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      const params = filter ? { status: filter } : {};
      const response = await orderApi.getMyOrders(params);
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (orderId, clientName) => {
    if (!confirm(`Are you sure you want to delete order #${orderId.toString().padStart(4, '0')} for "${clientName}"?`)) {
      return;
    }

    setDeleting(orderId);
    try {
      await orderApi.delete(orderId);
      setOrders(orders.filter(o => o.id !== orderId));
    } catch (error) {
      console.error('Failed to delete order:', error);
      alert('Failed to delete order. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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
    return <div className="loading-screen">Loading orders...</div>;
  }

  return (
    <div className="sales-orders">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Orders</h1>
          <p className="page-subtitle">Track and manage your orders</p>
        </div>
        <Link to="/sales/new-order" className="btn btn-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Order
        </Link>
      </div>

      <div className="filters-bar">
        <select
          className="form-select filter-select"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      <div className="card">
        {orders.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
            </svg>
            <h3>No orders found</h3>
            <p>{filter ? 'Try a different filter' : 'Create your first order to get started'}</p>
            <Link to="/sales/new-order" className="btn btn-primary">Create Order</Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Client</th>
                  <th>Contact</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>
                      <Link to={`/sales/orders/${order.id}`} className="order-id">
                        #{order.id.toString().padStart(4, '0')}
                      </Link>
                    </td>
                    <td className="client-name">{order.client_name}</td>
                    <td className="text-muted">{order.client_email || order.client_phone || '-'}</td>
                    <td className="font-mono">{formatCurrency(order.total_amount)}</td>
                    <td>
                      <span className={`status-badge status-${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="text-muted">{formatDate(order.created_at)}</td>
                    <td>
                      <div className="action-btns">
                        <Link to={`/sales/orders/${order.id}`} className="btn btn-ghost btn-sm">
                          View
                        </Link>
                        <button
                          onClick={() => handleDelete(order.id, order.client_name)}
                          className="btn btn-ghost btn-sm text-danger"
                          disabled={deleting === order.id}
                        >
                          {deleting === order.id ? '...' : 'Delete'}
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
    </div>
  );
};

export default SalesOrders;
