import { describe, expect, it } from 'vitest';
import { GENESIS_PREVIOUS_HASH, findDuplicateIndexes, findMissingIndexes, generateBlockHash, validateChain } from '../src/utils/blockchain.js';

describe('blockchain helper rules', () => {
  it('generates a 64 character SHA-256 block hash', async () => {
    const hash = await generateBlockHash({
      blockIndex: 0,
      electionId: 'e1',
      ballotId: 'b1',
      dataHash: 'a'.repeat(64),
      previousHash: GENESIS_PREVIOUS_HASH,
      createdAt: '2026-07-07T10:00:00Z',
    });
    expect(hash).toHaveLength(64);
  });

  it('finds duplicate and missing block indexes', () => {
    expect(findDuplicateIndexes([{ blockIndex: 0 }, { blockIndex: 1 }, { blockIndex: 1 }])).toHaveLength(1);
    expect(findMissingIndexes([{ blockIndex: 0 }, { blockIndex: 2 }])).toEqual([1]);
  });

  it('detects an empty chain', async () => {
    await expect(validateChain([])).resolves.toMatchObject({ isValid: false, errorType: 'chain_empty' });
  });

  it('detects missing ballots', async () => {
    const result = await validateChain([
      {
        blockIndex: 0,
        electionId: 'e1',
        ballotId: 'missing',
        dataHash: 'a'.repeat(64),
        previousHash: GENESIS_PREVIOUS_HASH,
        currentHash: 'b'.repeat(64),
        createdAt: '2026-07-07T10:00:00Z',
      },
    ]);
    expect(result.errorType).toBe('ballot_missing');
  });
});
