import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';

export default function AuthRedirectHandler() {
  const { isAuthenticated, loading, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash || '';
    const isAuthCallback = hash.includes('access_token=') || hash.includes('refresh_token=');
    const isPasswordReset = location.pathname.includes('reset-password');

    if (!loading && isAuthenticated && isAuthCallback && !isPasswordReset) {
      navigate(profile?.role === 'admin' ? '/admin' : '/voter', { replace: true });
    }
  }, [isAuthenticated, loading, location.pathname, navigate, profile?.role]);

  return null;
}
