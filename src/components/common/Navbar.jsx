import { Menu, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import { PROJECT } from '../../utils/constants.js';
import LanguageSwitcher from './LanguageSwitcher.jsx';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Elections', to: '/voter' },
  { label: 'How It Works', to: '/how-it-works' },
  { label: 'Security', to: '/security' },
  { label: 'Vote Verification', to: '/verify-email' },
  { label: 'Help', to: '/about' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, profile } = useAuth();

  const linkClass = ({ isActive }) =>
    `focus-ring rounded px-2 py-2 text-sm font-semibold transition ${
      isActive ? 'bg-primary-light text-primary-dark' : 'text-muted hover:text-primary'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white">
      <nav className="container-page flex min-h-20 items-center justify-between gap-4 py-3">
        <Link to="/" className="focus-ring flex items-center gap-3 rounded">
          <span className="flex h-11 w-11 items-center justify-center rounded bg-primary text-white">
            <ShieldCheck size={24} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-base font-bold leading-5 text-primary sm:text-lg">{PROJECT.shortName}</span>
            <span className="hidden text-xs font-medium text-muted sm:block">{PROJECT.subtitle}</span>
          </span>
        </Link>

        <div className="hidden items-center gap-2 lg:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher />
          <Link
            className="focus-ring inline-flex min-h-11 items-center justify-center rounded bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
            to={isAuthenticated ? (profile?.role === 'admin' ? '/admin' : '/voter') : '/login'}
          >
            {isAuthenticated ? 'Profile' : 'Login'}
          </Link>
        </div>

        <button
          type="button"
          className="focus-ring rounded p-2 text-primary lg:hidden"
          aria-label="Open menu"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </nav>

      {open ? (
        <div className="border-t border-border bg-white lg:hidden">
          <div className="container-page flex flex-col gap-2 py-4">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass} onClick={() => setOpen(false)}>
                {item.label}
              </NavLink>
            ))}
            <Link className="focus-ring rounded bg-primary px-4 py-3 text-center font-semibold text-white" to="/login">
              Login
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
