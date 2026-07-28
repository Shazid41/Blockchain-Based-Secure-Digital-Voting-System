import AuthRedirectHandler from './components/auth/AuthRedirectHandler.jsx';
import AppRoutes from './routes/AppRoutes.jsx';

export default function App() {
  return (
    <>
      <AuthRedirectHandler />
      <AppRoutes />
    </>
  );
}
