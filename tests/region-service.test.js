import { describe, expect, it } from 'vitest';
import { listRegions } from '../src/services/regionService.js';

describe('live region loading', () => {
  it('keeps registration usable with fallback regions when Supabase is unreachable', async () => {
    const regions = await listRegions();
    expect(regions.length).toBeGreaterThan(0);
    expect(regions[0].isFallback).toBe(true);
  }, 8000);
});
