import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminOrderDetail from './pages/admin/OrderDetail';
import AdminUsers from './pages/admin/Users';
import SalesDashboard from './pages/sales/Dashboard';
import SalesProducts from './pages/sales/Products';
import SalesNewOrder from './pages/sales/NewOrder';
import SalesOrders from './pages/sales/Orders';
import SalesOrderDetail from './pages/sales/OrderDetail';
import Layout from './components/Layout';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/sales'} replace />;
  }

  return children;
};

const App = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === 'admin' ? '/admin' : '/sales'} />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to={user.role === 'admin' ? '/admin' : '/sales'} />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/:id" element={<AdminOrderDetail />} />
        <Route path="users" element={<AdminUsers />} />
      </Route>

      {/* Sales Routes */}
      <Route path="/sales" element={
        <ProtectedRoute allowedRoles={['sales']}>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<SalesDashboard />} />
        <Route path="products" element={<SalesProducts />} />
        <Route path="new-order" element={<SalesNewOrder />} />
        <Route path="orders" element={<SalesOrders />} />
        <Route path="orders/:id" element={<SalesOrderDetail />} />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;

