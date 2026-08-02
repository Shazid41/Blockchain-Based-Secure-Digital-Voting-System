import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import AuthLoader from './AuthLoader.jsx';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, profile, twoFactorVerified } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoader />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (profile?.two_factor_enabled && !twoFactorVerified && location.pathname !== '/two-factor') {
    return <Navigate to="/two-factor" state={{ from: location }} replace />;
  }

  return children;
}
