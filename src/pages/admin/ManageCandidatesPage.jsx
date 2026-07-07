import { useMemo, useState } from 'react';
import AlertMessage from '../../components/common/AlertMessage.jsx';
import FormInput from '../../components/common/FormInput.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import PrimaryButton from '../../components/common/PrimaryButton.jsx';
import SecondaryButton from '../../components/common/SecondaryButton.jsx';
import SelectInput from '../../components/common/SelectInput.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import CandidateCard from '../../components/voter/CandidateCard.jsx';
import { demoCandidates, demoElections, demoRegions, regionName } from '../../services/demoData.js';

const emptyCandidate = { election_id: '', full_name: '', party_name: '', symbol_url: '', biography: '', region_id: '', is_active: true };

export default function ManageCandidatesPage() {
  const [candidates, setCandidates] = useState(demoCandidates);
  const [form, setForm] = useState(emptyCandidate);
  const [filters, setFilters] = useState({ election: '', region: '', active: '' });
  const [error, setError] = useState('');
  const filtered = useMemo(() => candidates.filter((candidate) => (!filters.election || candidate.election_id === filters.election) && (!filters.region || candidate.region_id === filters.region) && (!filters.active || String(candidate.is_active) === filters.active)), [candidates, filters]);

  function save(event) {
    event.preventDefault();
    setError('');
    if (!form.election_id || !form.full_name) return setError('Candidate must have an election and full name.');
    setCandidates((rows) => [...rows, { ...form, id: crypto.randomUUID() }]);
    setForm(emptyCandidate);
  }

  function disableCandidate(id) {
    setCandidates((rows) => rows.map((candidate) => candidate.id === id ? { ...candidate, is_active: false } : candidate));
  }

  return (
    <>
      <PageHeader eyebrow="Admin" title="Manage Candidates" description="Candidates must belong to an election before they can appear on an election details page." />
      <section className="container-page space-y-6 py-8">
        <form className="card grid gap-4 p-5 lg:grid-cols-2" onSubmit={save}>
          {error ? <div className="lg:col-span-2"><AlertMessage type="error">{error}</AlertMessage></div> : null}
          <SelectInput id="candidateElection" label="Election" options={demoElections.map((election) => ({ id: election.id, name: election.title }))} value={form.election_id} onChange={(e) => setForm({ ...form, election_id: e.target.value })} />
          <FormInput id="candidateName" label="Full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          <FormInput id="candidateParty" label="Party or group" value={form.party_name} onChange={(e) => setForm({ ...form, party_name: e.target.value })} />
          <SelectInput id="candidateRegion" label="Region" options={demoRegions} value={form.region_id} onChange={(e) => setForm({ ...form, region_id: e.target.value })} />
          <FormInput id="candidateSymbol" label="Symbol URL or placeholder" value={form.symbol_url} onChange={(e) => setForm({ ...form, symbol_url: e.target.value })} />
          <FormInput id="candidateBio" label="Short biography" value={form.biography} onChange={(e) => setForm({ ...form, biography: e.target.value })} />
          <PrimaryButton type="submit">Add Candidate</PrimaryButton>
        </form>
        <div className="card grid gap-4 p-5 lg:grid-cols-3">
          <SelectInput id="candidateFilterElection" label="Election filter" options={demoElections.map((election) => ({ id: election.id, name: election.title }))} value={filters.election} onChange={(e) => setFilters({ ...filters, election: e.target.value })} />
          <SelectInput id="candidateFilterRegion" label="Region filter" options={demoRegions} value={filters.region} onChange={(e) => setFilters({ ...filters, region: e.target.value })} />
          <SelectInput id="candidateFilterActive" label="Active status" options={[{ id: 'true', name: 'Active' }, { id: 'false', name: 'Inactive' }]} value={filters.active} onChange={(e) => setFilters({ ...filters, active: e.target.value })} />
        </div>
        <div className="grid gap-4 xl:grid-cols-2">{filtered.map((candidate) => <div key={candidate.id} className="space-y-2"><CandidateCard candidate={candidate} /><div className="flex items-center justify-between text-sm text-muted"><span>{regionName(candidate.region_id)} <StatusBadge status={candidate.is_active ? 'active' : 'suspended'} /></span><SecondaryButton onClick={() => disableCandidate(candidate.id)}>Disable Candidate</SecondaryButton></div></div>)}</div>
      </section>
    </>
  );
}
