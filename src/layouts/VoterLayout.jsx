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

const websiteLinks = [
  ['Home', '/'],
  ['How It Works', '/how-it-works'],
  ['Security', '/security'],
  ['Help', '/about'],
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

  const quickLinkClass = ({ isActive }) =>
    `focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-extrabold transition duration-200 ${isActive ? 'bg-primary-light text-primary shadow-sm' : 'text-muted hover:-translate-y-0.5 hover:bg-white/80 hover:text-primary hover:shadow-sm'}`;

  return (
    <div className="page-shell min-h-screen bg-page">
      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/82 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/voter" className="flex items-center gap-2 font-extrabold text-primary">
            <Vote aria-hidden="true" /> Voter Portal
          </Link>
          <nav className="hidden items-center gap-2 lg:flex">
            {voterLinks.map(([label, to]) => <NavLink key={to} to={to} end={to === '/voter'} className={navClass}>{label}</NavLink>)}
          </nav>
          <nav className="hidden items-center gap-1 xl:flex">
            <span className="mx-1 h-8 w-px bg-border" aria-hidden="true" />
            {websiteLinks.map(([label, to]) => <NavLink key={to} to={to} end={to === '/'} className={quickLinkClass}>{label}</NavLink>)}
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            <StatusBadge status={currentProfile.approval_status ?? 'pending'} />
            <UserCircle className="text-primary" aria-hidden="true" />
            <span className="text-sm font-semibold text-text">{currentProfile.full_name || user?.email}</span>
            <button className="focus-ring rounded-lg p-2 text-muted transition hover:bg-primary-light hover:text-primary" onClick={handleLogout} aria-label="Logout">
              <LogOut size={18} />
            </button>
          </div>
          <button className="focus-ring rounded p-2 text-primary lg:hidden" onClick={() => setOpen((value) => !value)} aria-label="Open voter navigation">
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open ? (
          <div className="border-t border-border bg-white lg:hidden">
            <div className="container-page flex flex-col gap-2 py-4">
              {voterLinks.map(([label, to]) => <NavLink key={to} to={to} end={to === '/voter'} className={navClass} onClick={() => setOpen(false)}>{label}</NavLink>)}
              <div className="my-2 h-px bg-border" />
              <p className="px-3 text-xs font-extrabold uppercase text-muted">Website Pages</p>
              <NavLink to="/" end className={navClass} onClick={() => setOpen(false)}><Home size={16} aria-hidden="true" /> Home</NavLink>
              <NavLink to="/how-it-works" className={navClass} onClick={() => setOpen(false)}>How It Works</NavLink>
              <NavLink to="/security" className={navClass} onClick={() => setOpen(false)}><ShieldCheck size={16} aria-hidden="true" /> Security</NavLink>
              <NavLink to="/about" className={navClass} onClick={() => setOpen(false)}>Help</NavLink>
              <button className="focus-ring rounded px-3 py-2 text-left text-sm font-semibold text-muted" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        ) : null}
      </header>
      <Outlet />
    </div>
  );
}
