import { demoCandidates, demoElections, demoRegions, demoVoters } from './demoData.js';

export async function getAdminSummary() {
  const approved = demoVoters.filter((voter) => voter.approval_status === 'approved').length;
  const pending = demoVoters.filter((voter) => voter.approval_status === 'pending').length;
  return {
    totalVoters: demoVoters.length,
    approvedVoters: approved,
    pendingVoters: pending,
    activeElections: demoElections.filter((election) => election.status === 'active').length,
    totalCandidates: demoCandidates.length,
    totalRegions: demoRegions.length,
  };
}
