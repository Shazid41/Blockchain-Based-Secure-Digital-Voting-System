import { beforeEach, describe, expect, it } from 'vitest';
import { getLocalAuthState, loginWithPassword, registerVoter } from '../src/services/authService.js';

describe('live Supabase auth mode', () => {
  beforeEach(async () => {
    localStorage.clear();
  });

  it('keeps admin access available when Supabase is configured but unreachable', async () => {
    const result = await loginWithPassword('shazidsaharia21@gmail.com', 'Shazid@961');
    expect(result.profile.role).toBe('admin');
    expect(getLocalAuthState().session?.user?.email).toBe('shazidsaharia21@gmail.com');
  }, 8000);

  it('keeps voter registration available when live Supabase registration is unavailable', async () => {
    const result = await registerVoter({
      email: 'local-voter@example.com',
      password: 'Testpass123',
      fullName: 'Local Voter',
      voterNumber: '4212911590',
      phone: '01700000001',
      dateOfBirth: '2000-01-01',
      regionId: '',
    });
    expect(result.profile.email).toBe('local-voter@example.com');
    expect(getLocalAuthState().session?.user?.email).toBe('local-voter@example.com');
  }, 8000);
});
