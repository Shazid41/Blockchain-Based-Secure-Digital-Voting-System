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
    `focus-ring nav-pill whitespace-nowrap ${
      isActive ? 'nav-pill-active bg-primary-light text-primary-dark shadow-sm' : 'text-muted hover:bg-white/75 hover:text-primary'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-white/86 shadow-crisp backdrop-blur-xl">
      <nav className="mx-auto flex min-h-[88px] w-full max-w-7xl items-center justify-between gap-5 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="focus-ring group flex min-w-0 items-center gap-3 rounded-lg pr-1">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-[#087a59] to-[#16834A] text-white shadow-glow transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-xl">
            <ShieldCheck size={24} aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block max-w-[15rem] truncate text-lg font-extrabold leading-6 text-primary sm:max-w-[18rem] sm:text-xl">{t('siteName')}</span>
            <span className="hidden max-w-[17rem] text-sm font-semibold leading-5 text-muted sm:block">{t('siteSubtitle')}</span>
          </span>
        </Link>

        <div className="hidden flex-1 items-center justify-center gap-1 xl:gap-2 lg:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              {t(item.key)}
            </NavLink>
          ))}
        </div>

        <div className="hidden shrink-0 items-center gap-3 lg:flex">
          <LanguageSwitcher />
          <Link
            className="focus-ring inline-flex min-h-12 items-center justify-center rounded-lg bg-gradient-to-r from-primary to-[#16834A] px-5 py-2 text-sm font-extrabold text-white shadow-soft transition duration-200 hover:-translate-y-0.5 hover:shadow-glow"
            to={isAuthenticated ? (profile?.role === 'admin' ? '/admin' : '/voter') : '/login'}
          >
            {isAuthenticated ? t('profile') : t('login')}
          </Link>
          <Link className="focus-ring rounded-lg px-3 py-2 text-sm font-extrabold leading-5 text-primary transition duration-200 hover:-translate-y-0.5 hover:bg-primary-light hover:shadow-sm" to="/admin-login">
            {t('adminLogin')}
          </Link>
        </div>

        <button
          type="button"
          className="focus-ring rounded-lg border border-primary/15 bg-white/70 p-2 text-primary shadow-sm lg:hidden"
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
