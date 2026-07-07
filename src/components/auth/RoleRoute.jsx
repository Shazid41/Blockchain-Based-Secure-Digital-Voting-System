import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import AuthLoader from './AuthLoader.jsx';

export default function RoleRoute({ allowedRoles = [], children }) {
  const { profile, loading, isConfigured } = useAuth();

  if (loading) return <AuthLoader />;
  if (!isConfigured) return children;
  if (!profile || !allowedRoles.includes(profile.role)) return <Navigate to="/unauthorized" replace />;

  return children;
}
