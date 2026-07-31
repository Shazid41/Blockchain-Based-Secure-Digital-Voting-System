import { useCallback, useEffect, useMemo, useState } from 'react';
import AlertMessage from '../../components/common/AlertMessage.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import SelectInput from '../../components/common/SelectInput.jsx';
import ElectionCard from '../../components/voter/ElectionCard.jsx';
import useAuth from '../../hooks/useAuth.js';
import { listElections } from '../../services/electionService.js';
import { listEligibilityForVoter } from '../../services/eligibilityService.js';
import { listRegions } from '../../services/regionService.js';

export default function AvailableElectionsPage() {
  const { profile, user } = useAuth();
  const [filters, setFilters] = useState({ status: '', region: '', eligibility: '' });
  const [rows, setRows] = useState([]);
  const [eligibilityRows, setEligibilityRows] = useState([]);
  const [regions, setRegions] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!user?.id) return;
    Promise.all([listElections(), listEligibilityForVoter(user.id), listRegions()])
      .then(([elections, eligibility, regionRows]) => {
        setRows(elections);
        setEligibilityRows(eligibility);
        setRegions(regionRows);
        setError('');
      })
      .catch((loadError) => setError(loadError.message));
  }, [user?.id]);
  const eligibilityFor = useMemo(() => new Map(eligibilityRows.map((row) => [row.election_id, row])), [eligibilityRows]);
  const accessFor = useCallback((election) => eligibilityFor.get(election.id) ?? {
    election_id: election.id,
    is_eligible: profile?.approval_status === 'approved' && election.status === 'active',
    has_voted: false,
  }, [eligibilityFor, profile?.approval_status]);
  const elections = useMemo(() => rows.filter((election) => {
    const eligibility = accessFor(election);
    return (!filters.status || election.status === filters.status)
      && (!filters.region || election.region_id === filters.region)
      && (!filters.eligibility || String(Boolean(eligibility?.is_eligible)) === filters.eligibility);
  }), [accessFor, filters, rows]);

  return (
    <>
      <PageHeader eyebrow="Voter" title="Available Elections" description="Filter elections by status, region, and eligibility." />
      <section className="container-page space-y-6 py-8">
        {error ? <AlertMessage type="error">Could not load live elections from the database. {error}</AlertMessage> : null}
        <div className="card grid gap-4 p-5 md:grid-cols-3">
          <SelectInput id="statusFilter" label="Status" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} options={['draft', 'scheduled', 'active', 'completed', 'cancelled'].map((value) => ({ id: value, name: value }))} />
          <SelectInput id="regionFilter" label="Region" value={filters.region} onChange={(e) => setFilters({ ...filters, region: e.target.value })} options={regions} />
          <SelectInput id="eligibilityFilter" label="Eligibility" value={filters.eligibility} onChange={(e) => setFilters({ ...filters, eligibility: e.target.value })} options={[{ id: 'true', name: 'Eligible' }, { id: 'false', name: 'Not eligible' }]} />
        </div>
        <div className="grid gap-4">
          {elections.length ? elections.map((election) => <ElectionCard key={election.id} election={election} eligibility={accessFor(election)} />) : <EmptyState title="No elections match the filters" />}
        </div>
      </section>
    </>
  );
}
