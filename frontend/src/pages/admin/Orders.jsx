import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../../services/api';
import './Admin.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', sales_user_id: '' });
  const [salesUsers, setSalesUsers] = useState([]);

  useEffect(() => {
    fetchOrders();
    fetchSalesUsers();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      const params = {};
      if (filter.status) params.status = filter.status;
      if (filter.sales_user_id) params.sales_user_id = filter.sales_user_id;
      
      const response = await orderApi.getAll(params);
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesUsers = async () => {
    try {
      const response = await orderApi.getSalesUsers();
      setSalesUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch sales users:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await orderApi.markAllNotified();
      fetchOrders();
    } catch (error) {
      console.error('Failed to mark orders as read:', error);
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

  const newOrdersCount = orders.filter(o => !o.admin_notified).length;

  return (
    <div className="admin-orders">
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">Manage and track all customer orders</p>
        </div>
        {newOrdersCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn btn-secondary">
            Mark all as read ({newOrdersCount})
          </button>
        )}
      </div>

      <div className="filters-bar">
        <select
          className="form-select filter-select"
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
        </select>

        <select
          className="form-select filter-select"
          value={filter.sales_user_id}
          onChange={(e) => setFilter({ ...filter, sales_user_id: e.target.value })}
        >
          <option value="">All Sales Reps</option>
          {salesUsers.map(user => (
            <option key={user.id} value={user.id}>{user.username}</option>
          ))}
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
            <p>Try adjusting your filters or wait for new orders</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Client</th>
                  <th>Contact</th>
                  <th>Sales Rep</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className={!order.admin_notified ? 'new-order' : ''}>
                    <td>
                      <Link to={`/admin/orders/${order.id}`} className="order-id">
                        #{order.id.toString().padStart(4, '0')}
                        {!order.admin_notified && <span className="new-badge">NEW</span>}
                      </Link>
                    </td>
                    <td className="client-name">{order.client_name}</td>
                    <td className="text-muted">{order.client_email || order.client_phone || '-'}</td>
                    <td>{order.sales_username}</td>
                    <td className="font-mono">{formatCurrency(order.total_amount)}</td>
                    <td>
                      <span className={`status-badge status-${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="text-muted">{formatDate(order.created_at)}</td>
                    <td>
                      <Link to={`/admin/orders/${order.id}`} className="btn btn-ghost btn-sm">
                        View
                      </Link>
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

export default AdminOrders;

