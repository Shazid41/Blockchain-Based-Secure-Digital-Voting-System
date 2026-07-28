import { beforeEach, describe, expect, it } from 'vitest';
import { getLocalAuthState, loginWithPassword } from '../src/services/authService.js';

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
});
