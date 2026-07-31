import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AlertMessage from '../../components/common/AlertMessage.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import PrimaryButton from '../../components/common/PrimaryButton.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import CandidateCard from '../../components/voter/CandidateCard.jsx';
import useAuth from '../../hooks/useAuth.js';
import { listCandidates } from '../../services/candidateService.js';
import { getElection } from '../../services/electionService.js';
import { listEligibilityForVoter } from '../../services/eligibilityService.js';

export default function ElectionDetailsPage() {
  const { electionId } = useParams();
  const { profile, user } = useAuth();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [eligibility, setEligibility] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([getElection(electionId), listCandidates({ electionId }), listEligibilityForVoter(user.id)])
      .then(([nextElection, nextCandidates, eligibilityRows]) => {
        setElection(nextElection);
        setCandidates(nextCandidates);
        setEligibility(eligibilityRows.find((row) => row.election_id === electionId) ?? null);
        setError('');
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoaded(true));
  }, [electionId, user?.id]);

  if (loaded && !election) return <PageHeader title="Election not found" description="The selected election does not exist in the live database." />;
  const canVote = profile?.approval_status === 'approved' && election?.status === 'active' && !eligibility?.has_voted;
  const eligibilityLabel = canVote || eligibility?.is_eligible ? 'Eligible' : 'Not eligible yet';

  return (
    <>
      <PageHeader eyebrow="Election Details" title={election?.title ?? 'Loading election'} description={election?.description} />
      <section className="container-page space-y-6 py-8">
        {error ? <AlertMessage type="error">Could not load live election details. {error}</AlertMessage> : null}
        <div className="card grid gap-4 p-5 md:grid-cols-2">
          <p><strong>Status:</strong> <StatusBadge status={election?.status ?? 'pending'} /></p>
          <p><strong>Region:</strong> {election?.regions?.name ?? 'All regions'}</p>
          <p><strong>Start:</strong> {election?.start_time ? new Date(election.start_time).toLocaleString() : 'Loading'}</p>
          <p><strong>End:</strong> {election?.end_time ? new Date(election.end_time).toLocaleString() : 'Loading'}</p>
          <p><strong>Eligibility:</strong> {eligibilityLabel}</p>
          <p><strong>Voting status:</strong> {eligibility?.has_voted ? 'Completed' : 'Not voted'}</p>
        </div>
        <AlertMessage type="info" title="Voting security notice">
          Vote casting stores an anonymous ballot and public blockchain receipt in Firebase.
        </AlertMessage>
        <section>
          <h2 className="text-2xl font-bold text-text">Candidates</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">{candidates.map((candidate) => <CandidateCard key={candidate.id} candidate={candidate} />)}</div>
        </section>
        {canVote ? (
          <Link className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary via-[#0B7A59] to-[#16834A] px-5 py-3 text-sm font-bold text-white shadow-soft transition duration-200 hover:-translate-y-1 hover:shadow-glow" to={`/voter/elections/${election?.id}/vote`}>
            Vote Now
          </Link>
        ) : (
          <PrimaryButton disabled>Vote Now</PrimaryButton>
        )}
        <Link className="block font-semibold text-primary" to="/voter/elections">Back to elections</Link>
      </section>
    </>
  );
}
