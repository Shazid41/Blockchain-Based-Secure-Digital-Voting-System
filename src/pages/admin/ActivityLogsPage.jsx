import { useEffect, useMemo, useState } from 'react';
import FormInput from '../../components/common/FormInput.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import SelectInput from '../../components/common/SelectInput.jsx';
import { listAuditLogs } from '../../services/auditService.js';

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({ user: '', action: '', date: '', status: '' });
  useEffect(() => { listAuditLogs().then(setLogs); }, []);
  const filtered = useMemo(() => logs.filter((log) => (!filters.user || String(log.actor_id ?? '').includes(filters.user)) && (!filters.action || log.action.includes(filters.action)) && (!filters.date || log.created_at.startsWith(filters.date)) && (!filters.status || filters.status === 'recorded')), [filters, logs]);

  return (
    <>
      <PageHeader eyebrow="Admin" title="Activity Logs" description="Admins and auditors can review full activity logs. Ordinary voters cannot read all logs." />
      <section className="container-page space-y-5 py-8">
        <div className="card grid gap-4 p-5 lg:grid-cols-4">
          <FormInput id="actorFilter" label="User or actor" value={filters.user} onChange={(e) => setFilters({ ...filters, user: e.target.value })} />
          <FormInput id="actionFilter" label="Action" value={filters.action} onChange={(e) => setFilters({ ...filters, action: e.target.value })} />
          <FormInput id="activityDate" label="Date" type="date" value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })} />
          <SelectInput id="activityStatus" label="Status" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} options={[{ id: 'recorded', name: 'Recorded' }]} />
        </div>
        <div className="card overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-primary-light text-primary-dark"><tr><th className="p-3">Actor</th><th>Action</th><th>Target</th><th>Date and time</th><th>Status</th></tr></thead><tbody>{filtered.map((log) => <tr key={log.id} className="border-t border-border"><td className="p-3">{log.actor_id ?? 'system'}</td><td>{log.action}</td><td>{log.target_table}:{log.target_id}</td><td>{new Date(log.created_at).toLocaleString()}</td><td>Recorded</td></tr>)}</tbody></table></div>
      </section>
    </>
  );
}
