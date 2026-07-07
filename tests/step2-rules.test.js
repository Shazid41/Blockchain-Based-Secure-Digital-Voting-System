import { describe, expect, it } from 'vitest';
import { canDeleteRegion, canSaveCandidate, canSaveElection, canVoterUpdateField } from '../src/utils/adminValidation.js';

describe('step 2 management rules', () => {
  it('blocks voter attempts to change role or approval status', () => {
    expect(canVoterUpdateField('full_name')).toBe(true);
    expect(canVoterUpdateField('role')).toBe(false);
    expect(canVoterUpdateField('approval_status')).toBe(false);
  });

  it('validates election dates and title', () => {
    expect(canSaveElection({ title: '', start_time: '2026-07-10', end_time: '2026-07-11' }).valid).toBe(false);
    expect(canSaveElection({ title: 'Election', start_time: '2026-07-11', end_time: '2026-07-10' }).valid).toBe(false);
    expect(canSaveElection({ title: 'Election', start_time: '2026-07-10', end_time: '2026-07-11' }).valid).toBe(true);
  });

  it('blocks completed election from becoming active without a safe rule', () => {
    expect(canSaveElection({ title: 'Election', start_time: '2026-07-10', end_time: '2026-07-11', previous_status: 'completed', status: 'active' }).valid).toBe(false);
  });

  it('blocks deletion of a used region', () => {
    expect(canDeleteRegion('r1', [{ region_id: 'r1' }])).toBe(false);
    expect(canDeleteRegion('r2', [{ region_id: 'r1' }])).toBe(true);
  });

  it('requires candidates to belong to elections', () => {
    expect(canSaveCandidate({ full_name: 'Candidate A' }).valid).toBe(false);
    expect(canSaveCandidate({ election_id: 'e1', full_name: 'Candidate A' }).valid).toBe(true);
  });
});
