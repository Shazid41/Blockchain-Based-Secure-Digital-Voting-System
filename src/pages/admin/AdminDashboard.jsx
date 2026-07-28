import { CalendarCheck, Map, Users, UserCheck, UserRoundCheck, Vote } from 'lucide-react';
import { useEffect, useState } from 'react';
import AlertMessage from '../../components/common/AlertMessage.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import SummaryCard from '../../components/common/SummaryCard.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { getAdminSummary } from '../../services/adminService.js';

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    const load = () => {
      getAdminSummary()
        .then((nextSummary) => {
          if (!active) return;
          setSummary(nextSummary);
          setError('');
        })
        .catch((summaryError) => {
          if (active) setError(summaryError.message);
        });
    };
    load();
    const timer = setInterval(load, 15000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);
  const cards = summary ? [
    ['Total Voters', summary.totalVoters, <Users />],
    ['Approved Voters', summary.approvedVoters, <UserCheck />],
    ['Pending Voters', summary.pendingVoters, <UserRoundCheck />],
    ['Active Elections', summary.activeElections, <Vote />],
    ['Total Candidates', summary.totalCandidates, <CalendarCheck />],
    ['Total Regions', summary.totalRegions, <Map />],
  ] : [];

  return (
    <>
      <PageHeader eyebrow="Admin" title="Overview" description="Manage voters, elections, candidates, regions, and eligibility preparation." />
      <section className="container-page space-y-8 py-8">
        {error ? <AlertMessage type="error">Could not load live admin data from Supabase. {error}</AlertMessage> : null}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{cards.map(([title, value, icon]) => <SummaryCard key={title} title={title} value={value} icon={icon} />)}</div>
        <div className="grid gap-6 xl:grid-cols-2">
          <section className="card p-5">
            <h2 className="text-xl font-bold text-text">Recent Registrations</h2>
            <div className="mt-4 space-y-3">{(summary?.recentVoters ?? []).map((voter) => <div key={voter.id} className="flex items-center justify-between gap-3 border-b border-border pb-3"><span>{voter.full_name}</span><StatusBadge status={voter.approval_status} /></div>)}</div>
          </section>
          <section className="card p-5">
            <h2 className="text-xl font-bold text-text">Upcoming Elections</h2>
            <div className="mt-4 space-y-3">{(summary?.upcomingElections ?? []).map((election) => <div key={election.id} className="border-b border-border pb-3"><p className="font-semibold text-text">{election.title}</p><p className="text-sm text-muted">{election.regions?.name ?? 'All regions'} - {election.status}</p></div>)}</div>
          </section>
        </div>
        <section className="card p-5">
          <h2 className="text-xl font-bold text-text">Quick Actions</h2>
          <p className="mt-2 text-muted">Review pending voters, create scheduled elections, add candidates, and prepare eligibility rows before Step 3 voting begins.</p>
        </section>
      </section>
    </>
  );
}
