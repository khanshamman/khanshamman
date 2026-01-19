import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

// Khan Shamman Logo Component for Auth pages
const AuthLogo = () => (
  <img 
    src="/logo.svg" 
    alt="Khan Shamman" 
    className="auth-brand-logo"
    style={{ height: '80px', width: 'auto', marginBottom: '1rem' }}
  />
);

const Login = () => {
  const [loginType, setLoginType] = useState('sales'); // 'admin' or 'sales'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(username, password);
      navigate(user.role === 'admin' ? '/admin' : '/sales');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-gradient"></div>
        <div className="auth-pattern"></div>
      </div>
      
      <div className="auth-card">
        <div className="auth-header">
          <AuthLogo />
          <p className="auth-subtitle">Sign in to continue</p>
        </div>

        {/* Login Type Selector */}
        <div className="login-type-selector">
          <button
            type="button"
            className={`login-type-btn ${loginType === 'admin' ? 'active' : ''}`}
            onClick={() => { setLoginType('admin'); setError(''); setUsername(''); setPassword(''); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Admin
          </button>
          <button
            type="button"
            className={`login-type-btn ${loginType === 'sales' ? 'active' : ''}`}
            onClick={() => { setLoginType('sales'); setError(''); setUsername(''); setPassword(''); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Sales Rep
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label className="form-label">
              {loginType === 'admin' ? 'Username' : 'Email or Username'}
            </label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={loginType === 'admin' ? 'Enter admin username' : 'Enter your email or username'}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg auth-btn" disabled={loading}>
            {loading ? 'Signing in...' : `Sign In as ${loginType === 'admin' ? 'Admin' : 'Sales Rep'}`}
          </button>
        </form>

        {loginType === 'sales' && (
          <div className="auth-footer">
            <p>Don't have an account? <Link to="/register">Register here</Link></p>
          </div>
        )}

        {loginType === 'admin' && (
          <div className="auth-footer admin-note">
            <p>Admin access only. Contact system administrator for credentials.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
