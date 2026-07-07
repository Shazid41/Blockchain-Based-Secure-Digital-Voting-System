export const demoRegions = [
  { id: '11111111-1111-4111-8111-111111111111', name: 'North Region', code: 'NORTH', description: 'Sample northern voting region.' },
  { id: '22222222-2222-4222-8222-222222222222', name: 'South Region', code: 'SOUTH', description: 'Sample southern voting region.' },
  { id: '33333333-3333-4333-8333-333333333333', name: 'Central Region', code: 'CENTRAL', description: 'Sample central voting region.' },
];

export const demoProfile = {
  id: 'demo-voter',
  full_name: 'Sample Voter',
  email: 'voter@example.com',
  voter_number: '1234567890',
  phone: '01700000000',
  date_of_birth: '2001-01-15',
  region_id: demoRegions[2].id,
  role: 'voter',
  approval_status: 'pending',
  created_at: '2026-07-07T10:00:00Z',
};

export const demoVoters = [
  { ...demoProfile, id: 'v1', approval_status: 'pending' },
  { id: 'v2', full_name: 'Approved Voter', email: 'approved@example.com', voter_number: '1234567890123456', phone: '01800000000', date_of_birth: '2000-08-20', region_id: demoRegions[0].id, role: 'voter', approval_status: 'approved', created_at: '2026-07-05T09:00:00Z' },
  { id: 'v3', full_name: 'Suspended Voter', email: 'suspended@example.com', voter_number: '9876543210', phone: '01900000000', date_of_birth: '1999-02-10', region_id: demoRegions[1].id, role: 'voter', approval_status: 'suspended', created_at: '2026-07-03T11:00:00Z' },
];

export const demoElections = [
  { id: 'e1', title: 'Student Council Election 2026', description: 'Select representatives for the student council.', start_time: '2026-07-10T09:00:00Z', end_time: '2026-07-10T17:00:00Z', status: 'scheduled', region_id: demoRegions[2].id, result_visibility: 'after_end' },
  { id: 'e2', title: 'Department Club Election', description: 'Vote for department club leadership.', start_time: '2026-07-07T08:00:00Z', end_time: '2026-07-07T18:00:00Z', status: 'active', region_id: demoRegions[0].id, result_visibility: 'live' },
  { id: 'e3', title: 'Library Committee Poll', description: 'Choose a student library committee member.', start_time: '2026-06-20T08:00:00Z', end_time: '2026-06-20T18:00:00Z', status: 'completed', region_id: null, result_visibility: 'after_end' },
];

export const demoCandidates = [
  { id: 'c1', election_id: 'e1', full_name: 'Candidate A', party_name: 'Green Group', symbol_url: '', biography: 'Focused on transparent student services.', region_id: demoRegions[2].id, is_active: true },
  { id: 'c2', election_id: 'e1', full_name: 'Candidate B', party_name: 'Unity Panel', symbol_url: '', biography: 'Working for inclusive campus activities.', region_id: demoRegions[2].id, is_active: true },
  { id: 'c3', election_id: 'e2', full_name: 'Candidate C', party_name: 'Innovation Forum', symbol_url: '', biography: 'Promotes digital student support.', region_id: demoRegions[0].id, is_active: true },
];

export const demoEligibility = [
  { id: 'el1', voter_id: 'demo-voter', election_id: 'e1', is_eligible: true, has_voted: false },
  { id: 'el2', voter_id: 'demo-voter', election_id: 'e2', is_eligible: true, has_voted: false },
  { id: 'el3', voter_id: 'demo-voter', election_id: 'e3', is_eligible: true, has_voted: true },
];

export const demoBallots = [
  { id: 'b1', election_id: 'e3', candidate_id: 'c1', anonymous_voter_hash: 'anon_demo_hash', cast_at: '2026-06-20T10:15:00Z', receipt_hash: 'receipt-demo-2026-0001' },
  { id: 'b2', election_id: 'e2', candidate_id: 'c3', anonymous_voter_hash: 'anon_demo_hash_2', cast_at: '2026-07-07T10:30:00Z', receipt_hash: 'receipt-demo-2026-0002' },
];

export const demoVoteBlocks = [
  { id: 'vb1', ballot_id: 'b1', election_id: 'e3', block_index: 0, previous_hash: '0'.repeat(64), data_hash: 'a'.repeat(64), current_hash: 'b'.repeat(64), created_at: '2026-06-20T10:15:00Z' },
  { id: 'vb2', ballot_id: 'b2', election_id: 'e2', block_index: 0, previous_hash: '0'.repeat(64), data_hash: 'c'.repeat(64), current_hash: 'd'.repeat(64), created_at: '2026-07-07T10:30:00Z' },
];

export const demoFraudLogs = [
  { id: 'f1', event_type: 'duplicate_vote_attempt', risk_level: 'critical', election_id: 'e2', user_id: 'v2', resolved: false, details: { reason: 'Repeated request' }, created_at: '2026-07-07T11:00:00Z' },
  { id: 'f2', event_type: 'wrong_region_vote_attempt', risk_level: 'high', election_id: 'e1', user_id: 'v3', resolved: true, details: { reason: 'Region mismatch' }, created_at: '2026-07-07T11:30:00Z' },
];

export const demoAuditLogs = [
  { id: 'a1', actor_id: 'admin-demo', action: 'voter.approved', target_table: 'profiles', target_id: 'v2', metadata: { status: 'approved' }, created_at: '2026-07-07T09:30:00Z' },
  { id: 'a2', actor_id: 'demo-voter', action: 'vote.cast', target_table: 'ballots', target_id: 'b2', metadata: { election_id: 'e2', block_index: 0 }, created_at: '2026-07-07T10:30:00Z' },
];

export const demoReceipt = {
  electionName: 'Department Club Election',
  castAt: '2026-07-07T10:30:00Z',
  receiptHash: 'receipt-demo-2026-0002',
  blockIndex: 0,
  currentBlockHash: 'd'.repeat(64),
};

export function regionName(regionId) {
  return demoRegions.find((region) => region.id === regionId)?.name ?? 'All Regions';
}
