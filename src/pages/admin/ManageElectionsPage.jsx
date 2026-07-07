import { useMemo, useState } from 'react';
import AlertMessage from '../../components/common/AlertMessage.jsx';
import FormInput from '../../components/common/FormInput.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import PrimaryButton from '../../components/common/PrimaryButton.jsx';
import SelectInput from '../../components/common/SelectInput.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { demoElections, demoRegions, regionName } from '../../services/demoData.js';

const emptyElection = { title: '', description: '', region_id: '', start_time: '', end_time: '', status: 'draft', result_visibility: 'hidden' };

export default function ManageElectionsPage() {
  const [rows, setRows] = useState(demoElections);
  const [form, setForm] = useState(emptyElection);
  const [filters, setFilters] = useState({ search: '', status: '', region: '', visibility: '' });
  const [error, setError] = useState('');
  const filtered = useMemo(() => rows.filter((election) => (!filters.search || election.title.toLowerCase().includes(filters.search.toLowerCase())) && (!filters.status || election.status === filters.status) && (!filters.region || election.region_id === filters.region) && (!filters.visibility || election.result_visibility === filters.visibility)), [filters, rows]);

  function save(event) {
    event.preventDefault();
    setError('');
    if (!form.title || !form.start_time || !form.end_time) return setError('Title, start time, and end time are required.');
    if (new Date(form.end_time) <= new Date(form.start_time)) return setError('End time must be after start time.');
    setRows((current) => [...current, { ...form, id: crypto.randomUUID() }]);
    setForm(emptyElection);
  }

  return (
    <>
      <PageHeader eyebrow="Admin" title="Manage Elections" description="Create and filter elections. Secure vote acceptance is still reserved for Step 3." />
      <section className="container-page space-y-6 py-8">
        <form className="card grid gap-4 p-5 lg:grid-cols-2" onSubmit={save}>
          {error ? <div className="lg:col-span-2"><AlertMessage type="error">{error}</AlertMessage></div> : null}
          <FormInput id="electionTitle" label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <SelectInput id="electionRegion" label="Region" options={demoRegions} value={form.region_id} onChange={(e) => setForm({ ...form, region_id: e.target.value })} />
          <FormInput id="startTime" label="Start date and time" type="datetime-local" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
          <FormInput id="endTime" label="End date and time" type="datetime-local" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
          <SelectInput id="electionStatus" label="Status" options={['draft', 'scheduled', 'active', 'completed', 'cancelled'].map((value) => ({ id: value, name: value }))} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} />
          <SelectInput id="visibility" label="Result visibility" options={['hidden', 'live', 'after_end'].map((value) => ({ id: value, name: value }))} value={form.result_visibility} onChange={(e) => setForm({ ...form, result_visibility: e.target.value })} />
          <div className="lg:col-span-2"><FormInput id="electionDescription" label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <PrimaryButton type="submit">Create Election</PrimaryButton>
        </form>
        <div className="card grid gap-4 p-5 lg:grid-cols-4">
          <FormInput id="electionSearch" label="Search" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
          <SelectInput id="electionFilterStatus" label="Status" options={['draft', 'scheduled', 'active', 'completed', 'cancelled'].map((value) => ({ id: value, name: value }))} value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} />
          <SelectInput id="electionFilterRegion" label="Region" options={demoRegions} value={filters.region} onChange={(e) => setFilters({ ...filters, region: e.target.value })} />
          <SelectInput id="electionFilterVisibility" label="Visibility" options={['hidden', 'live', 'after_end'].map((value) => ({ id: value, name: value }))} value={filters.visibility} onChange={(e) => setFilters({ ...filters, visibility: e.target.value })} />
        </div>
        <div className="card overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-primary-light text-primary-dark"><tr><th className="p-3">Title</th><th>Region</th><th>Start</th><th>End</th><th>Status</th><th>Visibility</th></tr></thead><tbody>{filtered.map((election) => <tr key={election.id} className="border-t border-border"><td className="p-3 font-semibold">{election.title}</td><td>{regionName(election.region_id)}</td><td>{new Date(election.start_time).toLocaleString()}</td><td>{new Date(election.end_time).toLocaleString()}</td><td><StatusBadge status={election.status} /></td><td>{election.result_visibility}</td></tr>)}</tbody></table></div>
      </section>
    </>
  );
}
