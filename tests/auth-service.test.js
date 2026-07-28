import { beforeEach, describe, expect, it } from 'vitest';
import { getLocalAuthState, loginWithPassword, registerVoter } from '../src/services/authService.js';
import { listVoters, updateVoterStatus } from '../src/services/voterService.js';

describe('reliable local auth fallback', () => {
  beforeEach(async () => {
    localStorage.clear();
  });

  it('allows the demo admin to log in without network access', async () => {
    const result = await loginWithPassword('shazidsaharia21@gmail.com', 'Shazid@961');
    const localState = getLocalAuthState();

    expect(result.local).toBe(true);
    expect(result.profile.role).toBe('admin');
    expect(localState.session.user.email).toBe('shazidsaharia21@gmail.com');
  });

  it('shows locally registered voters to admin and updates approval status', async () => {
    const email = 'local-voter@example.com';
    const registration = await registerVoter({
      email,
      password: 'Testpass123',
      fullName: 'Local Voter',
      voterNumber: '4212911590',
      phone: '01700000001',
      dateOfBirth: '2000-01-01',
      regionId: '',
    });

    expect(registration.local).toBe(true);
    expect(registration.profile.approval_status).toBe('pending');

    const voters = await listVoters();
    const voter = voters.find((row) => row.email === email);
    expect(voter?.full_name).toBe('Local Voter');

    const updated = await updateVoterStatus(voter.id, 'approved');
    expect(updated.approval_status).toBe('approved');
    expect((await listVoters()).find((row) => row.id === voter.id)?.approval_status).toBe('approved');
  });
});
