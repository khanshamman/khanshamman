import { useState, useEffect } from 'react';
import api from '../../services/api';
import './Admin.css';

const AdminUsers = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch pending users
      const pendingRes = await api.get('/auth/users/pending');
      setPendingUsers(pendingRes.data);
    } catch (error) {
      console.error('Failed to fetch pending users:', error);
      setPendingUsers([]);
    }
    
    try {
      // Fetch approved users (separate try-catch so pending still works if this fails)
      const approvedRes = await api.get('/auth/users/approved');
      setApprovedUsers(approvedRes.data);
    } catch (error) {
      console.error('Failed to fetch approved users:', error);
      setApprovedUsers([]);
    }
    
    setLoading(false);
  };

  const handleApprove = async (userId) => {
    setActionLoading(userId);
    try {
      await api.put(`/auth/users/${userId}/approve`);
      const user = pendingUsers.find(u => u.id === userId);
      setPendingUsers(pendingUsers.filter(u => u.id !== userId));
      if (user) {
        setApprovedUsers([...approvedUsers, { ...user, is_approved: 1 }]);
      }
    } catch (error) {
      console.error('Failed to approve user:', error);
      alert('Failed to approve user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId) => {
    if (!window.confirm('Are you sure you want to reject this registration? This will delete the account.')) {
      return;
    }
    
    setActionLoading(userId);
    try {
      await api.delete(`/auth/users/${userId}/reject`);
      setPendingUsers(pendingUsers.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Failed to reject user:', error);
      alert('Failed to reject user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete "${username}"? This will permanently remove their account and all associated data.`)) {
      return;
    }
    
    setActionLoading(userId);
    try {
      await api.delete(`/auth/users/${userId}`);
      setApprovedUsers(approvedUsers.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user: ' + (error.response?.data?.error || 'Unknown error'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    setActionLoading(userId);
    try {
      await api.put(`/auth/users/${userId}/status`, { 
        is_active: currentStatus ? 0 : 1 
      });
      setApprovedUsers(approvedUsers.map(u => 
        u.id === userId ? { ...u, is_active: currentStatus ? 0 : 1 } : u
      ));
    } catch (error) {
      console.error('Failed to update user status:', error);
      alert('Failed to update user status');
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
    return <div className="loading-screen">Loading users...</div>;
  }

  return (
    <div className="admin-users">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage sales representative accounts</p>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Approvals
          {pendingUsers.length > 0 && (
            <span className="tab-badge">{pendingUsers.length}</span>
          )}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'approved' ? 'active' : ''}`}
          onClick={() => setActiveTab('approved')}
        >
          Active Users
          <span className="tab-badge">{approvedUsers.length}</span>
        </button>
      </div>

      {/* Pending Users Tab */}
      {activeTab === 'pending' && (
        <div className="card">
          <h3 className="card-title">Pending Registrations</h3>
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
      )}

      {/* Approved Users Tab */}
      {activeTab === 'approved' && (
        <div className="card">
          <h3 className="card-title">Active Sales Representatives</h3>
          {approvedUsers.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
              </svg>
              <h3>No active users</h3>
              <p>No sales representatives have been approved yet</p>
            </div>
          ) : (
            <div className="users-list">
              {approvedUsers.map(user => (
                <div key={user.id} className={`user-card ${!user.is_active ? 'inactive' : ''}`}>
                  <div className="user-avatar-large">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-card-info">
                    <h3 className="user-card-name">
                      {user.username}
                      {!user.is_active && <span className="status-badge-inline inactive">Inactive</span>}
                    </h3>
                    <p className="user-card-email">{user.email}</p>
                    <p className="user-card-date">Joined {formatDate(user.created_at)}</p>
                  </div>
                  <div className="user-card-actions">
                    <button
                      className={`btn ${user.is_active ? 'btn-secondary' : 'btn-primary'}`}
                      onClick={() => handleToggleStatus(user.id, user.is_active)}
                      disabled={actionLoading === user.id}
                      title={user.is_active ? 'Deactivate user' : 'Activate user'}
                    >
                      {actionLoading === user.id ? '...' : (user.is_active ? 'Deactivate' : 'Activate')}
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteUser(user.id, user.username)}
                      disabled={actionLoading === user.id}
                      title="Permanently delete user"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                        <polyline points="3,6 5,6 21,6"/>
                        <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2"/>
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
