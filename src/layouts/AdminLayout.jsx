import { ArrowLeft, ExternalLink, Home, LogOut, Menu, ShieldCheck, UserRoundCheck, X } from 'lucide-react';
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

const websiteLinks = [
  ['Public Home', '/'],
  ['Public Security', '/security'],
  ['How It Works', '/how-it-works'],
  ['Vote Verification', '/verify'],
  ['Voter View', '/voter'],
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
    `focus-ring block rounded-lg px-3 py-2 text-sm font-bold transition ${isActive ? 'bg-gradient-to-r from-primary to-[#16834A] text-white shadow-soft' : 'text-muted hover:-translate-y-0.5 hover:bg-primary-light hover:text-primary'}`;

  const actionClass =
    'focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-primary/15 bg-white/75 px-3 py-2 text-sm font-extrabold text-primary shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-primary-light hover:shadow-soft';

  const sidebar = (
    <aside className="h-full overflow-y-auto border-r border-white/70 bg-white/82 p-3 shadow-crisp backdrop-blur-xl sm:p-4">
      <div className="mb-4 flex items-center gap-2 font-extrabold text-primary sm:mb-6"><ShieldCheck /> Admin Portal</div>
      <nav className="grid gap-1 sm:block sm:space-y-1">{adminLinks.map(([label, to]) => <NavLink key={to} to={to} end={to === '/admin'} className={navClass} onClick={() => setOpen(false)}>{label}</NavLink>)}</nav>
      <div className="my-5 h-px bg-border" />
      <p className="px-3 text-xs font-extrabold uppercase text-muted">Website View</p>
      <nav className="mt-2 space-y-1">
        {websiteLinks.map(([label, to]) => (
          <NavLink key={to} to={to} end={to === '/'} className={navClass} onClick={() => setOpen(false)}>
            {label}
          </NavLink>
        ))}
      </nav>
      <button className="focus-ring mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-extrabold text-error" onClick={handleLogout}>
        <LogOut size={16} aria-hidden="true" /> Logout
      </button>
    </aside>
  );

  return (
    <div className="page-shell min-h-screen bg-page lg:grid lg:grid-cols-[260px_1fr]">
      <div className="hidden lg:block">{sidebar}</div>
      <div>
        <header className="sticky top-0 z-30 border-b border-white/70 bg-white/82 shadow-sm backdrop-blur-xl">
          <div className="flex min-h-14 items-center justify-between gap-3 px-3 py-2 sm:min-h-16 sm:px-6 sm:py-3 lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Admin / {current}</p>
              <h1 className="text-lg font-bold text-text sm:text-xl">{current}</h1>
            </div>
            <div className="hidden items-center gap-2 lg:flex">
              <button type="button" className={actionClass} onClick={() => navigate(-1)}>
                <ArrowLeft size={16} aria-hidden="true" /> Back
              </button>
              <NavLink className={actionClass} to="/">
                <Home size={16} aria-hidden="true" /> Website
              </NavLink>
              <NavLink className={actionClass} to="/voter">
                <UserRoundCheck size={16} aria-hidden="true" /> Voter View
              </NavLink>
              <NavLink className={actionClass} to="/verify">
                <ExternalLink size={16} aria-hidden="true" /> Public Verify
              </NavLink>
            </div>
            <div className="hidden items-center gap-3 lg:flex">
              <span className="text-sm font-semibold text-text">{profile?.full_name ?? 'Admin User'}</span>
              <button className="focus-ring rounded-lg p-2 text-muted transition hover:bg-primary-light hover:text-primary" onClick={handleLogout} aria-label="Logout"><LogOut size={18} /></button>
            </div>
            <button className="focus-ring rounded p-2 text-primary lg:hidden" onClick={() => setOpen((value) => !value)} aria-label="Open admin sidebar">
              {open ? <X /> : <Menu />}
            </button>
          </div>
          {open ? (
            <div className="border-t border-border bg-white/95 lg:hidden">
              <div className="grid gap-2 p-3 sm:grid-cols-2 sm:p-4">
                <button type="button" className={actionClass} onClick={() => { setOpen(false); navigate(-1); }}>
                  <ArrowLeft size={16} aria-hidden="true" /> Back
                </button>
                <NavLink className={actionClass} to="/" onClick={() => setOpen(false)}>
                  <Home size={16} aria-hidden="true" /> Website
                </NavLink>
              </div>
              {sidebar}
            </div>
          ) : null}
        </header>
        <Outlet />
      </div>
    </div>
  );
}
