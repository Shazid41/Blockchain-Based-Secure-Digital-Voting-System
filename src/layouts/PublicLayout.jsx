import { Outlet } from 'react-router-dom';
import Footer from '../components/common/Footer.jsx';
import Navbar from '../components/common/Navbar.jsx';

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-page">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
