import { CheckCircle2, Clock, FileCheck2, Vote } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AlertMessage from '../../components/common/AlertMessage.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import SummaryCard from '../../components/common/SummaryCard.jsx';
import ElectionCard from '../../components/voter/ElectionCard.jsx';
import useAuth from '../../hooks/useAuth.js';
import { listElections } from '../../services/electionService.js';
import { listEligibilityForVoter } from '../../services/eligibilityService.js';

export default function VoterDashboard() {
  const { profile, user } = useAuth();
  const [elections, setElections] = useState([]);
  const [eligibilityRows, setEligibilityRows] = useState([]);
  const [error, setError] = useState('');
  const currentProfile = profile ?? {};
  const verified = user?.email_confirmed_at || !user;
  useEffect(() => {
    if (!user?.id) return;
    let activeLoad = true;
    const load = () => Promise.all([listElections(), listEligibilityForVoter(user.id)])
      .then(([electionRows, eligibility]) => {
        if (!activeLoad) return;
        setElections(electionRows);
        setEligibilityRows(eligibility);
        setError('');
      })
      .catch((loadError) => {
        if (activeLoad) setError(loadError.message);
      });
    load();
    const timer = setInterval(load, 15000);
    return () => {
      activeLoad = false;
      clearInterval(timer);
    };
  }, [user?.id]);
  const active = elections.filter((election) => election.status === 'active');
  const upcoming = elections.filter((election) => election.status === 'scheduled');
  const completedVotes = eligibilityRows.filter((item) => item.has_voted).length;
  const eligibilityFor = useMemo(() => new Map(eligibilityRows.map((row) => [row.election_id, row])), [eligibilityRows]);
  const accessFor = useCallback((election) => eligibilityFor.get(election.id) ?? {
    election_id: election.id,
    is_eligible: currentProfile.approval_status === 'approved' && election.status === 'active',
    has_voted: false,
  }, [currentProfile.approval_status, eligibilityFor]);

  const nextAction = !verified
    ? 'Verify your email'
    : currentProfile.approval_status !== 'approved'
      ? 'Wait for admin approval'
      : active.length
        ? 'View active election'
        : 'Verify your vote receipt';

  return (
    <>
      <PageHeader eyebrow="Voter" title="Dashboard" description="Your voting status, available elections, and next action are shown here." />
      <section className="container-page space-y-8 py-8">
        {error ? <AlertMessage type="error">Could not load live voter data from the database. {error}</AlertMessage> : null}
        <AlertMessage type={currentProfile.approval_status === 'approved' ? 'success' : 'warning'} title="Next action">
          {nextAction}. Your current approval status is {currentProfile.approval_status}.
        </AlertMessage>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard title="Approval Status" value={currentProfile.approval_status} icon={<CheckCircle2 />} />
          <SummaryCard title="Available Elections" value={active.length + upcoming.length} icon={<Vote />} />
          <SummaryCard title="Completed Votes" value={completedVotes} icon={<FileCheck2 />} />
          <SummaryCard title="Receipt Status" value="Ready" note="Verification form is available" icon={<Clock />} />
        </div>
        <section>
          <h2 className="text-2xl font-bold text-text">Active Elections</h2>
          <div className="mt-4 grid gap-4">{active.map((election) => <ElectionCard key={election.id} election={election} eligibility={accessFor(election)} />)}</div>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-text">Upcoming Elections</h2>
          <div className="mt-4 grid gap-4">{upcoming.map((election) => <ElectionCard key={election.id} election={election} eligibility={accessFor(election)} />)}</div>
        </section>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="card p-5">
            <h2 className="font-bold text-text">Profile Completion</h2>
            <p className="mt-2 text-muted">Review your phone, date of birth, and region before approval.</p>
            <Link className="mt-4 inline-block font-semibold text-primary" to="/voter/profile">Open profile</Link>
          </div>
          <div className="card p-5">
            <h2 className="font-bold text-text">Voting Guidelines</h2>
            <p className="mt-2 text-muted">Only approved voters can vote. Do not share receipt hashes publicly with identity details.</p>
          </div>
        </div>
      </section>
    </>
  );
}
