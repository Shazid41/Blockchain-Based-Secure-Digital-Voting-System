import { demoCandidates, demoElections, demoRegions, demoVoters } from './demoData.js';
import { listLocalVoterProfiles } from './authService.js';

export async function getAdminSummary() {
  const localVoters = listLocalVoterProfiles();
  const voters = [...localVoters, ...demoVoters];
  const approved = voters.filter((voter) => voter.approval_status === 'approved').length;
  const pending = voters.filter((voter) => voter.approval_status === 'pending').length;
  return {
    totalVoters: voters.length,
    approvedVoters: approved,
    pendingVoters: pending,
    activeElections: demoElections.filter((election) => election.status === 'active').length,
    totalCandidates: demoCandidates.length,
    totalRegions: demoRegions.length,
  };
}
