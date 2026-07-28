import { LogOut, Menu, UserCircle, Vote, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import StatusBadge from '../components/common/StatusBadge.jsx';
import useAuth from '../hooks/useAuth.js';

const voterLinks = [
  ['Dashboard', '/voter'],
  ['Profile', '/voter/profile'],
  ['Available Elections', '/voter/elections'],
  ['Vote Verification', '/voter/verify'],
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
    `focus-ring rounded-lg px-3 py-2 text-sm font-bold transition ${isActive ? 'bg-gradient-to-r from-primary to-[#16834A] text-white shadow-soft' : 'text-muted hover:-translate-y-0.5 hover:bg-primary-light hover:text-primary'}`;

  return (
    <div className="page-shell min-h-screen bg-page">
      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/82 shadow-sm backdrop-blur-xl">
        <div className="container-page flex min-h-16 items-center justify-between gap-4 py-3">
          <Link to="/voter" className="flex items-center gap-2 font-extrabold text-primary">
            <Vote aria-hidden="true" /> Voter Portal
          </Link>
          <nav className="hidden items-center gap-2 lg:flex">
            {voterLinks.map(([label, to]) => <NavLink key={to} to={to} end={to === '/voter'} className={navClass}>{label}</NavLink>)}
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
              <button className="focus-ring rounded px-3 py-2 text-left text-sm font-semibold text-muted" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        ) : null}
      </header>
      <Outlet />
    </div>
  );
}
