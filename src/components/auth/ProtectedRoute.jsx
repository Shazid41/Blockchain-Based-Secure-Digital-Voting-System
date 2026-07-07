import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import AuthLoader from './AuthLoader.jsx';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, isConfigured } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoader />;
  if (!isConfigured) return children;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;

  return children;
}
