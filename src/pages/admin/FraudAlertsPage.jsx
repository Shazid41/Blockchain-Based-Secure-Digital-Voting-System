import { useEffect, useMemo, useState } from 'react';
import FormInput from '../../components/common/FormInput.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import SecondaryButton from '../../components/common/SecondaryButton.jsx';
import SelectInput from '../../components/common/SelectInput.jsx';
import { demoElections } from '../../services/demoData.js';
import { listFraudLogs, markFraudResolved } from '../../services/fraudService.js';

const riskStyles = {
  low: 'bg-blue-50 text-info',
  medium: 'bg-amber-50 text-amber-800',
  high: 'bg-orange-50 text-orange-700',
  critical: 'bg-red-50 text-error',
};

export default function FraudAlertsPage() {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({ risk: '', election: '', date: '', resolved: '' });
  const [selected, setSelected] = useState(null);
  useEffect(() => { listFraudLogs().then(setLogs); }, []);
  const filtered = useMemo(() => logs.filter((log) => (!filters.risk || log.risk_level === filters.risk) && (!filters.election || log.election_id === filters.election) && (!filters.date || log.created_at.startsWith(filters.date)) && (!filters.resolved || String(log.resolved) === filters.resolved)), [filters, logs]);

  async function resolve(id) {
    await markFraudResolved(id);
    setLogs((rows) => rows.map((row) => row.id === id ? { ...row, resolved: true } : row));
  }

  return (
    <>
      <PageHeader eyebrow="Admin" title="Fraud Alerts" description="Rule-based fraud detection. This project does not claim machine learning." />
      <section className="container-page space-y-5 py-8">
        <div className="card grid gap-4 p-5 lg:grid-cols-4">
          <SelectInput id="riskFilter" label="Risk level" value={filters.risk} onChange={(e) => setFilters({ ...filters, risk: e.target.value })} options={['low', 'medium', 'high', 'critical'].map((value) => ({ id: value, name: value }))} />
          <SelectInput id="fraudElection" label="Election" value={filters.election} onChange={(e) => setFilters({ ...filters, election: e.target.value })} options={demoElections.map((election) => ({ id: election.id, name: election.title }))} />
          <FormInput id="fraudDate" label="Date" type="date" value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })} />
          <SelectInput id="resolvedFilter" label="Resolved" value={filters.resolved} onChange={(e) => setFilters({ ...filters, resolved: e.target.value })} options={[{ id: 'true', name: 'Resolved' }, { id: 'false', name: 'Open' }]} />
        </div>
        <div className="card overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-primary-light text-primary-dark"><tr><th className="p-3">Event</th><th>Risk</th><th>Election</th><th>User reference</th><th>Date</th><th>Status</th><th>Action</th></tr></thead><tbody>{filtered.map((log) => <tr key={log.id} className="border-t border-border"><td className="p-3">{log.event_type}</td><td><span className={`rounded px-2 py-1 font-semibold ${riskStyles[log.risk_level]}`}>{log.risk_level}</span></td><td>{log.election_id}</td><td>{log.user_id ?? 'system'}</td><td>{new Date(log.created_at).toLocaleString()}</td><td>{log.resolved ? 'Resolved' : 'Open'}</td><td className="space-x-2"><button className="font-semibold text-primary" onClick={() => setSelected(log)}>View Details</button><button className="font-semibold text-primary" onClick={() => resolve(log.id)}>Mark Resolved</button></td></tr>)}</tbody></table></div>
        {selected ? <div className="card p-5"><h2 className="font-bold text-text">Fraud Details</h2><pre className="mt-2 overflow-auto rounded bg-page p-3 text-sm">{JSON.stringify(selected.details, null, 2)}</pre><SecondaryButton className="mt-3" onClick={() => setSelected(null)}>Close</SecondaryButton></div> : null}
      </section>
    </>
  );
}
