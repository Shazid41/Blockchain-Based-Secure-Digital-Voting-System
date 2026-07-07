import { useMemo, useState } from 'react';
import EmptyState from '../../components/common/EmptyState.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import SelectInput from '../../components/common/SelectInput.jsx';
import ElectionCard from '../../components/voter/ElectionCard.jsx';
import { demoEligibility, demoElections, demoRegions } from '../../services/demoData.js';

export default function AvailableElectionsPage() {
  const [filters, setFilters] = useState({ status: '', region: '', eligibility: '' });
  const elections = useMemo(() => demoElections.filter((election) => {
    const eligibility = demoEligibility.find((item) => item.election_id === election.id);
    return (!filters.status || election.status === filters.status)
      && (!filters.region || election.region_id === filters.region)
      && (!filters.eligibility || String(Boolean(eligibility?.is_eligible)) === filters.eligibility);
  }), [filters]);

  return (
    <>
      <PageHeader eyebrow="Voter" title="Available Elections" description="Filter elections by status, region, and eligibility." />
      <section className="container-page space-y-6 py-8">
        <div className="card grid gap-4 p-5 md:grid-cols-3">
          <SelectInput id="statusFilter" label="Status" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} options={['draft', 'scheduled', 'active', 'completed', 'cancelled'].map((value) => ({ id: value, name: value }))} />
          <SelectInput id="regionFilter" label="Region" value={filters.region} onChange={(e) => setFilters({ ...filters, region: e.target.value })} options={demoRegions} />
          <SelectInput id="eligibilityFilter" label="Eligibility" value={filters.eligibility} onChange={(e) => setFilters({ ...filters, eligibility: e.target.value })} options={[{ id: 'true', name: 'Eligible' }, { id: 'false', name: 'Not eligible' }]} />
        </div>
        <div className="grid gap-4">
          {elections.length ? elections.map((election) => <ElectionCard key={election.id} election={election} eligibility={demoEligibility.find((item) => item.election_id === election.id)} />) : <EmptyState title="No elections match the filters" />}
        </div>
      </section>
    </>
  );
}
