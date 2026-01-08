import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { orderApi } from '../services/api';
import api from '../services/api';
import './Layout.css';

// Khan Shamman Logo Component
const Logo = () => (
  <svg viewBox="0 0 180 50" className="brand-logo">
    <defs>
      <linearGradient id="logoGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor:'#d4a574'}}/>
        <stop offset="50%" style={{stopColor:'#c9956c'}}/>
        <stop offset="100%" style={{stopColor:'#b8845f'}}/>
      </linearGradient>
      <linearGradient id="leafGreen" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor:'#6b8e5a'}}/>
        <stop offset="100%" style={{stopColor:'#4a6741'}}/>
      </linearGradient>
    </defs>
    
    {/* Decorative leaf left */}
    <path d="M8 25 Q2 18 8 12 Q12 17 10 22 Q13 26 8 25" fill="url(#leafGreen)" opacity="0.8"/>
    
    {/* Stylized K */}
    <text x="25" y="32" fontFamily="'Cormorant Garamond', Georgia, serif" fontSize="28" fontWeight="700" fill="url(#logoGold)">K</text>
    
    {/* Decorative dot */}
    <circle cx="42" cy="30" r="2" fill="url(#logoGold)"/>
    
    {/* Brand name */}
    <text x="50" y="24" fontFamily="'Cormorant Garamond', Georgia, serif" fontSize="14" fontWeight="600" fill="url(#logoGold)" letterSpacing="2">KHAN</text>
    <text x="50" y="38" fontFamily="'Cormorant Garamond', Georgia, serif" fontSize="14" fontWeight="600" fill="url(#logoGold)" letterSpacing="2">SHAMMAN</text>
    
    {/* Decorative leaf right */}
    <path d="M140 25 Q146 18 140 12 Q136 17 138 22 Q135 26 140 25" fill="url(#leafGreen)" opacity="0.8"/>
  </svg>
);

const Layout = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [notificationCount, setNotificationCount] = useState(0);
  const [pendingUsersCount, setPendingUsersCount] = useState(0);

  useEffect(() => {
    if (isAdmin) {
      fetchNotifications();
      fetchPendingUsers();
      const interval = setInterval(() => {
        fetchNotifications();
        fetchPendingUsers();
      }, 30000); // Poll every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  const fetchNotifications = async () => {
    try {
      const response = await orderApi.getNotificationCount();
      setNotificationCount(response.data.count);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const fetchPendingUsers = async () => {
    try {
      const response = await api.get('/auth/users/pending/count');
      setPendingUsersCount(response.data.count);
    } catch (error) {
      console.error('Failed to fetch pending users count:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const basePath = isAdmin ? '/admin' : '/sales';

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <Logo />
          <span className="role-badge">{user.role}</span>
        </div>
        
        <nav className="nav">
          <NavLink to={basePath} end className="nav-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
            Dashboard
          </NavLink>
          
          {isAdmin ? (
            <>
              <NavLink to={`${basePath}/orders`} className="nav-link">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                Orders
                {notificationCount > 0 && (
                  <span className="notification-badge">{notificationCount}</span>
                )}
              </NavLink>
              <NavLink to={`${basePath}/products`} className="nav-link">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
                  <line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
                Products
              </NavLink>
              <NavLink to={`${basePath}/users`} className="nav-link">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                User Approvals
                {pendingUsersCount > 0 && (
                  <span className="notification-badge">{pendingUsersCount}</span>
                )}
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to={`${basePath}/products`} className="nav-link">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
                  <line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
                Products
              </NavLink>
              <NavLink to={`${basePath}/new-order`} className="nav-link">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                New Order
              </NavLink>
              <NavLink to={`${basePath}/orders`} className="nav-link">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                My Orders
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user.username.charAt(0).toUpperCase()}</div>
            <div className="user-details">
              <span className="user-name">{user.username}</span>
              <span className="user-email">{user.email}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
