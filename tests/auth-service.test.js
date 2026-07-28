import { beforeEach, describe, expect, it } from 'vitest';
import { getLocalAuthState, loginWithPassword, registerVoter } from '../src/services/authService.js';

describe('live Supabase auth mode', () => {
  beforeEach(async () => {
    localStorage.clear();
  });

  it('does not create a local admin session when Supabase is configured but unreachable', async () => {
    await expect(loginWithPassword('shazidsaharia21@gmail.com', 'Shazid@961')).rejects.toThrow(/Database connection problem|fetch failed|Request timeout/i);
    expect(getLocalAuthState().session).toBeNull();
  }, 8000);

  it('does not create a local voter when live Supabase registration is unavailable', async () => {
    await expect(registerVoter({
      email: 'local-voter@example.com',
      password: 'Testpass123',
      fullName: 'Local Voter',
      voterNumber: '4212911590',
      phone: '01700000001',
      dateOfBirth: '2000-01-01',
      regionId: '',
    })).rejects.toThrow(/fetch failed|Request timeout/i);
    expect(getLocalAuthState().session).toBeNull();
  }, 8000);
});
