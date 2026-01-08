import { useState, useEffect } from 'react';
import api from '../../services/api';
import './Admin.css';

const AdminUsers = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const response = await api.get('/auth/users/pending');
      setPendingUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch pending users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    setActionLoading(userId);
    try {
      await api.put(`/auth/users/${userId}/approve`);
      setPendingUsers(pendingUsers.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Failed to approve user:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId) => {
    if (!confirm('Are you sure you want to reject this registration? This will delete the account.')) {
      return;
    }
    
    setActionLoading(userId);
    try {
      await api.delete(`/auth/users/${userId}/reject`);
      setPendingUsers(pendingUsers.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Failed to reject user:', error);
    } finally {
      setActionLoading(null);
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

  if (loading) {
    return <div className="loading-screen">Loading pending users...</div>;
  }

  return (
    <div className="admin-users">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Approvals</h1>
          <p className="page-subtitle">Review and approve new sales representative registrations</p>
        </div>
      </div>

      <div className="card">
        {pendingUsers.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <polyline points="16,11 18,13 22,9"/>
            </svg>
            <h3>No pending registrations</h3>
            <p>All user registrations have been processed</p>
          </div>
        ) : (
          <div className="pending-users-list">
            {pendingUsers.map(user => (
              <div key={user.id} className="pending-user-card">
                <div className="user-avatar-large">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="pending-user-info">
                  <h3 className="pending-user-name">{user.username}</h3>
                  <p className="pending-user-email">{user.email}</p>
                  <p className="pending-user-date">Registered {formatDate(user.created_at)}</p>
                </div>
                <div className="pending-user-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => handleApprove(user.id)}
                    disabled={actionLoading === user.id}
                  >
                    {actionLoading === user.id ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleReject(user.id)}
                    disabled={actionLoading === user.id}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;

