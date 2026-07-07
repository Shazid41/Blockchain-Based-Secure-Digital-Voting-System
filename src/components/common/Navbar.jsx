import { Menu, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import useLanguage from '../../hooks/useLanguage.js';
import LanguageSwitcher from './LanguageSwitcher.jsx';

const navItems = [
  { key: 'home', to: '/' },
  { key: 'elections', to: '/voter' },
  { key: 'howItWorks', to: '/how-it-works' },
  { key: 'security', to: '/security' },
  { key: 'voteVerification', to: '/verify' },
  { key: 'help', to: '/about' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, profile } = useAuth();
  const { t } = useLanguage();

  const linkClass = ({ isActive }) =>
    `focus-ring rounded px-2 py-2 text-sm font-semibold transition ${
      isActive ? 'bg-primary-light text-primary-dark' : 'text-muted hover:text-primary'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-white/75 shadow-sm backdrop-blur-xl">
      <nav className="container-page flex min-h-20 items-center justify-between gap-4 py-3">
        <Link to="/" className="focus-ring flex items-center gap-3 rounded">
          <span className="flex h-11 w-11 items-center justify-center rounded bg-primary text-white">
            <ShieldCheck size={24} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-base font-bold leading-5 text-primary sm:text-lg">{t('siteName')}</span>
            <span className="hidden text-xs font-medium text-muted sm:block">{t('siteSubtitle')}</span>
          </span>
        </Link>

        <div className="hidden items-center gap-2 lg:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              {t(item.key)}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher />
          <Link
            className="focus-ring inline-flex min-h-11 items-center justify-center rounded bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
            to={isAuthenticated ? (profile?.role === 'admin' ? '/admin' : '/voter') : '/login'}
          >
            {isAuthenticated ? t('profile') : t('login')}
          </Link>
          <Link className="focus-ring rounded px-3 py-2 text-sm font-semibold text-primary hover:bg-primary-light" to="/admin-login">
            {t('adminLogin')}
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
        <div className="border-t border-white/70 bg-white/90 backdrop-blur lg:hidden">
          <div className="container-page flex flex-col gap-2 py-4">
            <div className="mb-2">
              <LanguageSwitcher />
            </div>
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass} onClick={() => setOpen(false)}>
                {t(item.key)}
              </NavLink>
            ))}
            <Link className="focus-ring rounded bg-primary px-4 py-3 text-center font-semibold text-white" to="/login" onClick={() => setOpen(false)}>
              {t('voterLogin')}
            </Link>
            <Link className="focus-ring rounded border border-primary px-4 py-3 text-center font-semibold text-primary" to="/admin-login" onClick={() => setOpen(false)}>
              {t('adminLogin')}
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
