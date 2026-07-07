export const GENESIS_PREVIOUS_HASH = '0'.repeat(64);

export async function sha256Hex(input) {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function canonicalDataString({ electionId, ballotId, candidateId, anonymousVoterHash, castAt }) {
  return `${electionId}|${ballotId}|${candidateId}|${anonymousVoterHash}|${castAt}`;
}

export function canonicalBlockString({ blockIndex, electionId, ballotId, dataHash, previousHash, createdAt }) {
  return `${blockIndex}|${electionId}|${ballotId}|${dataHash}|${previousHash}|${createdAt}`;
}

export async function generateDataHash(ballot) {
  return sha256Hex(canonicalDataString(ballot));
}

export async function generateBlockHash(block) {
  return sha256Hex(canonicalBlockString(block));
}

export function findDuplicateIndexes(blocks) {
  const seen = new Set();
  return blocks.filter((block) => {
    if (seen.has(block.blockIndex)) return true;
    seen.add(block.blockIndex);
    return false;
  });
}

export function findMissingIndexes(blocks) {
  const indexes = new Set(blocks.map((block) => block.blockIndex));
  const max = Math.max(-1, ...indexes);
  return Array.from({ length: max + 1 }, (_, index) => index).filter((index) => !indexes.has(index));
}

export async function validateChain(blocks, ballotsById = {}) {
  if (!blocks.length) {
    return { isValid: false, errorType: 'chain_empty', firstInvalidBlock: null, verifiedBlocks: 0 };
  }
  const sorted = [...blocks].sort((a, b) => a.blockIndex - b.blockIndex);
  let previousHash = GENESIS_PREVIOUS_HASH;
  for (let index = 0; index < sorted.length; index += 1) {
    const block = sorted[index];
    if (block.blockIndex !== index) return { isValid: false, errorType: 'missing_block', firstInvalidBlock: index, verifiedBlocks: index };
    if (!ballotsById[block.ballotId]) return { isValid: false, errorType: 'ballot_missing', firstInvalidBlock: index, verifiedBlocks: index };
    if (block.previousHash !== previousHash) return { isValid: false, errorType: 'invalid_previous_hash', firstInvalidBlock: index, verifiedBlocks: index };
    const currentHash = await generateBlockHash(block);
    if (block.currentHash !== currentHash) return { isValid: false, errorType: 'invalid_current_hash', firstInvalidBlock: index, verifiedBlocks: index };
    previousHash = block.currentHash;
  }
  return { isValid: true, errorType: 'none', firstInvalidBlock: null, verifiedBlocks: sorted.length };
}
