import { describe, expect, it } from 'vitest';
import { listRegions } from '../src/services/regionService.js';

describe('live region loading', () => {
  it('reports a live Supabase connection error instead of silently showing demo regions', async () => {
    await expect(listRegions()).rejects.toThrow(/Could not load live regions from Supabase/i);
  }, 8000);
});
