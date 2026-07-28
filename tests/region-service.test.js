import { describe, expect, it } from 'vitest';
import { listRegions } from '../src/services/regionService.js';

describe('region registration fallback', () => {
  it('keeps registration usable when Supabase regions cannot be loaded', async () => {
    const regions = await listRegions();

    expect(regions.length).toBeGreaterThan(0);
    expect(regions.map((region) => region.name)).toContain('North Region');
    expect(regions.every((region) => region.isFallback)).toBe(true);
  });
});
