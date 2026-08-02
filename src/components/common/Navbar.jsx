import { LayoutDashboard, LogOut, Menu, ShieldCheck, UserRoundCheck, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const { isAuthenticated, profile, logout } = useAuth();
  const { t } = useLanguage();
  const isAdmin = profile?.role === 'admin';
  const portalPath = isAdmin ? '/admin' : '/voter';
  const portalLabel = isAdmin ? 'Admin Portal' : 'Voter Portal';
  const PortalIcon = isAdmin ? LayoutDashboard : UserRoundCheck;

  async function handleLogout() {
    await logout();
    setOpen(false);
    navigate('/login');
  }

  const linkClass = ({ isActive }) =>
    `focus-ring nav-pill whitespace-nowrap ${
      isActive ? 'nav-pill-active bg-primary-light text-primary-dark shadow-sm' : 'text-muted hover:bg-white/75 hover:text-primary'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-white/86 shadow-crisp backdrop-blur-xl">
      <nav className="mx-auto flex min-h-[72px] w-full max-w-7xl items-center justify-between gap-3 px-3 py-2 sm:min-h-[88px] sm:px-6 sm:py-3 lg:px-8">
        <Link to="/" className="focus-ring group flex min-w-0 items-center gap-3 rounded-lg pr-1">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-[#087a59] to-[#16834A] text-white shadow-glow transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-xl sm:h-14 sm:w-14">
            <ShieldCheck size={22} aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block max-w-[12.5rem] truncate text-base font-extrabold leading-5 text-primary sm:max-w-[18rem] sm:text-xl sm:leading-6">{t('siteName')}</span>
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
            to={isAuthenticated ? portalPath : '/login'}
          >
            {isAuthenticated ? (
              <>
                <PortalIcon size={17} aria-hidden="true" /> {portalLabel}
              </>
            ) : t('login')}
          </Link>
          {isAuthenticated ? (
            <Link className="focus-ring rounded-lg px-3 py-2 text-sm font-extrabold leading-5 text-primary transition duration-200 hover:-translate-y-0.5 hover:bg-primary-light hover:shadow-sm" to={isAdmin ? '/voter' : '/verify'}>
              {isAdmin ? 'Voter View' : 'Public Verify'}
            </Link>
          ) : (
            <Link className="focus-ring rounded-lg px-3 py-2 text-sm font-extrabold leading-5 text-primary transition duration-200 hover:-translate-y-0.5 hover:bg-primary-light hover:shadow-sm" to="/admin-login">
              {t('adminLogin')}
            </Link>
          )}
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
          <div className="container-page flex max-h-[calc(100vh-76px)] flex-col gap-1 overflow-y-auto py-3">
            <div className="mb-1">
              <LanguageSwitcher />
            </div>
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass} onClick={() => setOpen(false)}>
                {t(item.key)}
              </NavLink>
            ))}
            {isAuthenticated ? (
              <>
                <Link className="focus-ring inline-flex items-center justify-center gap-2 rounded bg-primary px-4 py-3 text-center font-semibold text-white" to={portalPath} onClick={() => setOpen(false)}>
                  <PortalIcon size={18} aria-hidden="true" /> {portalLabel}
                </Link>
                <Link className="focus-ring rounded border border-primary px-4 py-3 text-center font-semibold text-primary" to={isAdmin ? '/voter' : '/verify'} onClick={() => setOpen(false)}>
                  {isAdmin ? 'Voter View' : 'Public Verify'}
                </Link>
                <button className="focus-ring inline-flex items-center justify-center gap-2 rounded border border-red-200 bg-red-50 px-4 py-3 font-semibold text-error" onClick={handleLogout}>
                  <LogOut size={18} aria-hidden="true" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link className="focus-ring rounded bg-primary px-4 py-3 text-center font-semibold text-white" to="/login" onClick={() => setOpen(false)}>
                  {t('voterLogin')}
                </Link>
                <Link className="focus-ring rounded border border-primary px-4 py-3 text-center font-semibold text-primary" to="/admin-login" onClick={() => setOpen(false)}>
                  {t('adminLogin')}
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
