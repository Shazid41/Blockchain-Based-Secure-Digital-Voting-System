export function canSaveElection(election) {
  if (!election.title?.trim()) return { valid: false, message: 'Election title is required.' };
  if (!election.start_time || !election.end_time) return { valid: false, message: 'Start and end time are required.' };
  if (new Date(election.end_time) <= new Date(election.start_time)) {
    return { valid: false, message: 'End time must be after start time.' };
  }
  if (election.previous_status === 'completed' && election.status === 'active') {
    return { valid: false, message: 'Completed election cannot become active without a safe rule.' };
  }
  return { valid: true, message: 'Election is valid.' };
}

export function canDeleteRegion(regionId, elections = []) {
  return !elections.some((election) => election.region_id === regionId);
}

export function canSaveCandidate(candidate) {
  if (!candidate.election_id) return { valid: false, message: 'Candidate must belong to an election.' };
  if (!candidate.full_name?.trim()) return { valid: false, message: 'Candidate full name is required.' };
  return { valid: true, message: 'Candidate is valid.' };
}

export function canVoterUpdateField(field) {
  return ['full_name', 'phone', 'date_of_birth', 'region_id'].includes(field);
}
