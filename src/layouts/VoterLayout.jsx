import { LogOut, Menu, UserCircle, Vote, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import StatusBadge from '../components/common/StatusBadge.jsx';
import useAuth from '../hooks/useAuth.js';
import { demoProfile } from '../services/demoData.js';

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
  const currentProfile = profile ?? demoProfile;

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const navClass = ({ isActive }) =>
    `focus-ring rounded px-3 py-2 text-sm font-semibold ${isActive ? 'bg-primary text-white' : 'text-muted hover:bg-primary-light hover:text-primary'}`;

  return (
    <div className="min-h-screen bg-page">
      <header className="sticky top-0 z-30 border-b border-border bg-white">
        <div className="container-page flex min-h-16 items-center justify-between gap-4 py-3">
          <Link to="/voter" className="flex items-center gap-2 font-bold text-primary">
            <Vote aria-hidden="true" /> Voter Portal
          </Link>
          <nav className="hidden items-center gap-2 lg:flex">
            {voterLinks.map(([label, to]) => <NavLink key={to} to={to} end={to === '/voter'} className={navClass}>{label}</NavLink>)}
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            <StatusBadge status={currentProfile.approval_status ?? 'pending'} />
            <UserCircle className="text-primary" aria-hidden="true" />
            <span className="text-sm font-semibold text-text">{currentProfile.full_name || user?.email}</span>
            <button className="focus-ring rounded p-2 text-muted hover:text-primary" onClick={handleLogout} aria-label="Logout">
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
