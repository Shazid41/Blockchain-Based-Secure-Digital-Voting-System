import { LogOut, Menu, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';

const adminLinks = [
  ['Overview', '/admin'],
  ['Voters', '/admin/voters'],
  ['Elections', '/admin/elections'],
  ['Candidates', '/admin/candidates'],
  ['Regions', '/admin/regions'],
  ['NID List', '/admin/nids'],
  ['Results', '/admin/results'],
  ['Fraud Alerts', '/admin/fraud-alerts'],
  ['Blockchain Audit', '/admin/blockchain-audit'],
  ['Activity Logs', '/admin/activity-logs'],
  ['Settings', '/admin/settings'],
];

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, logout } = useAuth();
  const current = adminLinks.find(([, to]) => to === location.pathname)?.[0] ?? 'Admin';

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const navClass = ({ isActive }) =>
    `focus-ring block rounded px-3 py-2 text-sm font-semibold ${isActive ? 'bg-primary text-white' : 'text-muted hover:bg-primary-light hover:text-primary'}`;

  const sidebar = (
    <aside className="h-full border-r border-border bg-white p-4">
      <div className="mb-6 flex items-center gap-2 font-bold text-primary"><ShieldCheck /> Admin Portal</div>
      <nav className="space-y-1">{adminLinks.map(([label, to]) => <NavLink key={to} to={to} end={to === '/admin'} className={navClass}>{label}</NavLink>)}</nav>
    </aside>
  );

  return (
    <div className="min-h-screen bg-page lg:grid lg:grid-cols-[260px_1fr]">
      <div className="hidden lg:block">{sidebar}</div>
      <div>
        <header className="sticky top-0 z-30 border-b border-border bg-white">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Admin / {current}</p>
              <h1 className="text-xl font-bold text-text">{current}</h1>
            </div>
            <div className="hidden items-center gap-3 lg:flex">
              <span className="text-sm font-semibold text-text">{profile?.full_name ?? 'Admin User'}</span>
              <button className="focus-ring rounded p-2 text-muted hover:text-primary" onClick={handleLogout} aria-label="Logout"><LogOut size={18} /></button>
            </div>
            <button className="focus-ring rounded p-2 text-primary lg:hidden" onClick={() => setOpen((value) => !value)} aria-label="Open admin sidebar">
              {open ? <X /> : <Menu />}
            </button>
          </div>
          {open ? <div className="border-t border-border lg:hidden">{sidebar}</div> : null}
        </header>
        <Outlet />
      </div>
    </div>
  );
}
