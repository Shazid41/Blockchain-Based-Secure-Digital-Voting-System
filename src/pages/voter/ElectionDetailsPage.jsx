import { Link, useParams } from 'react-router-dom';
import AlertMessage from '../../components/common/AlertMessage.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import PrimaryButton from '../../components/common/PrimaryButton.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import CandidateCard from '../../components/voter/CandidateCard.jsx';
import { demoCandidates, demoEligibility, demoElections, regionName } from '../../services/demoData.js';

export default function ElectionDetailsPage() {
  const { electionId } = useParams();
  const election = demoElections.find((item) => item.id === electionId);
  const candidates = demoCandidates.filter((candidate) => candidate.election_id === electionId);
  const eligibility = demoEligibility.find((item) => item.election_id === electionId);

  if (!election) return <PageHeader title="Election not found" description="The selected election does not exist." />;

  return (
    <>
      <PageHeader eyebrow="Election Details" title={election.title} description={election.description} />
      <section className="container-page space-y-6 py-8">
        <div className="card grid gap-4 p-5 md:grid-cols-2">
          <p><strong>Status:</strong> <StatusBadge status={election.status} /></p>
          <p><strong>Region:</strong> {regionName(election.region_id)}</p>
          <p><strong>Start:</strong> {new Date(election.start_time).toLocaleString()}</p>
          <p><strong>End:</strong> {new Date(election.end_time).toLocaleString()}</p>
          <p><strong>Eligibility:</strong> {eligibility?.is_eligible ? 'Eligible' : 'Not eligible yet'}</p>
          <p><strong>Voting status:</strong> {eligibility?.has_voted ? 'Completed' : 'Not voted'}</p>
        </div>
        <AlertMessage type="info" title="Voting security notice">
          Secure vote casting is intentionally disabled in Step 2. Step 3 will add the server-side vote function and blockchain-style ledger.
        </AlertMessage>
        <section>
          <h2 className="text-2xl font-bold text-text">Candidates</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">{candidates.map((candidate) => <CandidateCard key={candidate.id} candidate={candidate} />)}</div>
        </section>
        <PrimaryButton disabled={!eligibility?.is_eligible || eligibility?.has_voted || election.status !== 'active'}>
          <Link to={`/voter/elections/${election.id}/vote`}>Vote Now</Link>
        </PrimaryButton>
        <Link className="block font-semibold text-primary" to="/voter/elections">Back to elections</Link>
      </section>
    </>
  );
}
