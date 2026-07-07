import { useMemo, useState } from 'react';
import ConfirmationModal from '../../components/common/ConfirmationModal.jsx';
import FormInput from '../../components/common/FormInput.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import SelectInput from '../../components/common/SelectInput.jsx';
import SecondaryButton from '../../components/common/SecondaryButton.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { demoRegions, regionName } from '../../services/demoData.js';
import { updateVoterStatus } from '../../services/voterService.js';
import { demoVoters } from '../../services/demoData.js';

export default function ManageVotersPage() {
  const [voters, setVoters] = useState(demoVoters);
  const [filters, setFilters] = useState({ search: '', region: '', status: '' });
  const [pending, setPending] = useState(null);
  const [selected, setSelected] = useState(null);
  const filtered = useMemo(() => voters.filter((voter) => {
    const text = `${voter.full_name} ${voter.email} ${voter.voter_number}`.toLowerCase();
    return (!filters.search || text.includes(filters.search.toLowerCase()))
      && (!filters.region || voter.region_id === filters.region)
      && (!filters.status || voter.approval_status === filters.status);
  }), [filters, voters]);

  async function confirmStatus() {
    await updateVoterStatus(pending.voter.id, pending.status);
    setVoters((rows) => rows.map((row) => row.id === pending.voter.id ? { ...row, approval_status: pending.status } : row));
    setPending(null);
  }

  return (
    <>
      <PageHeader eyebrow="Admin" title="Manage Voters" description="Search voters, review details, and change approval status with confirmation." />
      <section className="container-page space-y-5 py-8">
        <div className="card grid gap-4 p-5 lg:grid-cols-3">
          <FormInput id="voterSearch" label="Search" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
          <SelectInput id="voterRegion" label="Region" options={demoRegions} value={filters.region} onChange={(e) => setFilters({ ...filters, region: e.target.value })} />
          <SelectInput id="voterStatus" label="Approval status" options={['pending', 'approved', 'rejected', 'suspended'].map((value) => ({ id: value, name: value }))} value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} />
        </div>
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-primary-light text-primary-dark"><tr><th className="p-3">Voter Number</th><th>Name</th><th>Email</th><th>Region</th><th>Status</th><th>Registered</th><th>Actions</th></tr></thead>
            <tbody>{filtered.map((voter) => <tr key={voter.id} className="border-t border-border"><td className="p-3">{voter.voter_number}</td><td>{voter.full_name}</td><td>{voter.email}</td><td>{regionName(voter.region_id)}</td><td><StatusBadge status={voter.approval_status} /></td><td>{new Date(voter.created_at).toLocaleDateString()}</td><td className="space-x-2"><button className="font-semibold text-primary" onClick={() => setSelected(voter)}>View</button>{['approved', 'rejected', 'suspended', 'pending'].map((status) => <button key={status} className="font-semibold text-primary" onClick={() => setPending({ voter, status })}>{status}</button>)}</td></tr>)}</tbody>
          </table>
          <div className="border-t border-border p-3 text-sm text-muted">Pagination placeholder: showing {filtered.length} voters.</div>
        </div>
        {selected ? <div className="card p-5"><h2 className="font-bold text-text">Voter Detail</h2><p>{selected.full_name} - {selected.email} - {regionName(selected.region_id)}</p><SecondaryButton className="mt-3" onClick={() => setSelected(null)}>Close</SecondaryButton></div> : null}
      </section>
      <ConfirmationModal open={Boolean(pending)} title="Confirm status change" onCancel={() => setPending(null)} onConfirm={confirmStatus}>
        Change {pending?.voter.full_name} to {pending?.status}?
      </ConfirmationModal>
    </>
  );
}
