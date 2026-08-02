import { Home, LogOut, Menu, ShieldCheck, UserCircle, Vote, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import StatusBadge from '../components/common/StatusBadge.jsx';
import useAuth from '../hooks/useAuth.js';

const voterLinks = [
  ['Dashboard', '/voter'],
  ['Profile', '/voter/profile'],
  ['Elections', '/voter/elections'],
  ['Vote Verification', '/voter/verify'],
];

export default function VoterLayout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { profile, user, logout } = useAuth();
  const currentProfile = profile ?? {};

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const navClass = ({ isActive }) =>
    `focus-ring inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition ${isActive ? 'bg-gradient-to-r from-primary to-[#16834A] text-white shadow-soft' : 'text-muted hover:-translate-y-0.5 hover:bg-primary-light hover:text-primary'}`;

  const quickLinkClass =
    'focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-primary/15 bg-white/75 px-3 py-2 text-sm font-extrabold text-primary shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-primary-light hover:shadow-soft';

  return (
    <div className="page-shell min-h-screen bg-page">
      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/82 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex min-h-14 w-full max-w-7xl items-center justify-between gap-3 px-3 py-2 sm:min-h-16 sm:px-6 sm:py-3 lg:px-8">
          <Link to="/voter" className="flex min-w-0 items-center gap-2 font-extrabold text-primary">
            <Vote aria-hidden="true" /> Voter Portal
          </Link>
          <nav className="hidden items-center gap-2 lg:flex">
            {voterLinks.map(([label, to]) => <NavLink key={to} to={to} end={to === '/voter'} className={navClass}>{label}</NavLink>)}
          </nav>
          <nav className="hidden items-center gap-1 xl:flex">
            <span className="mx-1 h-8 w-px bg-border" aria-hidden="true" />
            <Link to="/" className={quickLinkClass}>
              <Home size={16} aria-hidden="true" /> Website
            </Link>
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            <StatusBadge status={currentProfile.approval_status ?? 'pending'} />
            <UserCircle className="text-primary" aria-hidden="true" />
            <span className="text-sm font-semibold text-text">{currentProfile.full_name || user?.email}</span>
            <button className="focus-ring rounded-lg p-2 text-muted transition hover:bg-primary-light hover:text-primary" onClick={handleLogout} aria-label="Logout">
              <LogOut size={18} />
            </button>
          </div>
          <div className="flex min-w-0 items-center gap-2 lg:hidden">
            <StatusBadge status={currentProfile.approval_status ?? 'pending'} />
            <button className="focus-ring rounded p-2 text-primary" onClick={() => setOpen((value) => !value)} aria-label="Open voter navigation">
            {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {open ? (
          <div className="border-t border-border bg-white lg:hidden">
            <div className="container-page flex max-h-[calc(100vh-64px)] flex-col gap-1 overflow-y-auto py-3">
              <div className="mb-2 rounded-xl border border-primary/15 bg-primary-light/70 p-3">
                <p className="truncate text-sm font-extrabold text-text">{currentProfile.full_name || user?.email}</p>
                <p className="truncate text-xs font-semibold text-muted">{user?.email}</p>
              </div>
              {voterLinks.map(([label, to]) => <NavLink key={to} to={to} end={to === '/voter'} className={navClass} onClick={() => setOpen(false)}>{label}</NavLink>)}
              <div className="my-2 h-px bg-border" />
              <p className="px-3 text-xs font-extrabold uppercase text-muted">Website Pages</p>
              <NavLink to="/" end className={navClass} onClick={() => setOpen(false)}><Home size={16} aria-hidden="true" /> Home</NavLink>
              <NavLink to="/how-it-works" className={navClass} onClick={() => setOpen(false)}>How It Works</NavLink>
              <NavLink to="/security" className={navClass} onClick={() => setOpen(false)}><ShieldCheck size={16} aria-hidden="true" /> Security</NavLink>
              <NavLink to="/about" className={navClass} onClick={() => setOpen(false)}>Help</NavLink>
              <button className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-extrabold text-error" onClick={handleLogout}><LogOut size={16} /> Logout</button>
            </div>
          </div>
        ) : null}
      </header>
      <main className="pb-20 lg:pb-0">
        <Outlet />
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/80 bg-white/90 px-2 py-2 shadow-[0_-16px_40px_rgba(16,32,51,0.12)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {[
            { label: 'Home', to: '/voter', icon: Vote },
            { label: 'Profile', to: '/voter/profile', icon: UserCircle },
            { label: 'Vote', to: '/voter/elections', icon: ShieldCheck },
            { label: 'Verify', to: '/voter/verify', icon: Home },
          ].map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/voter'} className={({ isActive }) => `focus-ring flex min-h-12 flex-col items-center justify-center rounded-lg text-[11px] font-extrabold ${isActive ? 'bg-primary text-white shadow-soft' : 'text-muted'}`}>
              <item.icon size={17} aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
          <button className="focus-ring flex min-h-12 flex-col items-center justify-center rounded-lg text-[11px] font-extrabold text-error" onClick={handleLogout}>
            <LogOut size={17} aria-hidden="true" />
            Logout
          </button>
        </div>
      </nav>
    </div>
  );
}
