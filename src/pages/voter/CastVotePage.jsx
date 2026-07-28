import { CheckCircle2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AlertMessage from '../../components/common/AlertMessage.jsx';
import ConfirmationModal from '../../components/common/ConfirmationModal.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import PrimaryButton from '../../components/common/PrimaryButton.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import useAuth from '../../hooks/useAuth.js';
import { listCandidates } from '../../services/candidateService.js';
import { getElection } from '../../services/electionService.js';
import { listEligibilityForVoter } from '../../services/eligibilityService.js';
import { castSecureVote } from '../../services/votingService.js';

export default function CastVotePage() {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [eligibility, setEligibility] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const selectedCandidateName = useMemo(() => candidates.find((candidate) => candidate.id === selectedCandidate)?.full_name ?? 'No candidate selected yet.', [candidates, selectedCandidate]);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([getElection(electionId), listCandidates({ electionId }), listEligibilityForVoter(user.id)])
      .then(([nextElection, nextCandidates, eligibilityRows]) => {
        setElection(nextElection);
        setCandidates(nextCandidates.filter((candidate) => candidate.is_active));
        setEligibility(eligibilityRows.find((row) => row.election_id === electionId) ?? null);
        setError('');
      })
      .catch((loadError) => setError(loadError.message));
  }, [electionId, user?.id]);

  if (!election && !error) return <PageHeader title="Loading election" description="Loading live election data." />;
  if (!election) return <PageHeader title="Election not found" description="The selected election does not exist in the live database." />;

  async function submitVote() {
    setError('');
    setSubmitting(true);
    try {
      const receipt = await castSecureVote(electionId, selectedCandidate);
      navigate('/voter/vote-success', { state: { receipt } });
    } catch (voteError) {
      setError(voteError.message || 'Vote could not be submitted.');
      setModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader eyebrow="Secure Voting" title={election.title} description="Select one candidate and confirm. Your vote cannot be changed after submission." />
      <section className="container-page space-y-6 py-8">
        {error ? <AlertMessage type="error">{error}</AlertMessage> : null}
        <div className="card grid gap-4 p-5 md:grid-cols-2">
          <p><strong>Schedule:</strong> {new Date(election.start_time).toLocaleString()} to {new Date(election.end_time).toLocaleString()}</p>
          <p><strong>Region:</strong> {election.regions?.name ?? 'All regions'}</p>
          <p><strong>Status:</strong> <StatusBadge status={election.status} /></p>
          <p><strong>Eligibility:</strong> {eligibility?.is_eligible ? 'Eligible' : 'Not eligible'}</p>
        </div>
        <AlertMessage type="info" title="Voting rules">
          You must be authenticated, email verified, approved, eligible, in the correct region, and you may vote only once.
        </AlertMessage>
        <div className="grid gap-4 lg:grid-cols-2">
          {candidates.map((candidate) => {
            const selected = selectedCandidate === candidate.id;
            return (
              <button
                type="button"
                key={candidate.id}
                onClick={() => setSelectedCandidate(candidate.id)}
                className={`focus-ring card relative p-5 text-left transition ${selected ? 'border-2 border-primary bg-primary-light' : 'hover:border-primary'}`}
              >
                {selected ? <CheckCircle2 className="absolute right-4 top-4 text-primary" aria-label="Selected" /> : null}
                <h2 className="text-xl font-bold text-text">{candidate.full_name}</h2>
                <p className="mt-1 font-semibold text-primary">{candidate.party_name || 'Independent'}</p>
                <p className="mt-3 text-sm text-muted">{candidate.biography}</p>
              </button>
            );
          })}
        </div>
        <div className="card space-y-4 p-5">
          <h2 className="text-xl font-bold text-text">Selected Candidate Summary</h2>
          <p className="text-muted">{selectedCandidateName}</p>
          <label className="flex gap-3 text-sm text-muted">
            <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />
            I understand that my vote cannot be changed after submission.
          </label>
          <PrimaryButton disabled={!selectedCandidate || !confirmed || submitting} onClick={() => setModalOpen(true)}>
            {submitting ? 'Submitting...' : 'Submit Vote'}
          </PrimaryButton>
        </div>
      </section>
      <ConfirmationModal open={modalOpen} title="Confirm Your Vote" onCancel={() => setModalOpen(false)} onConfirm={submitVote}>
        Your vote cannot be changed after submission.
      </ConfirmationModal>
    </>
  );
}
