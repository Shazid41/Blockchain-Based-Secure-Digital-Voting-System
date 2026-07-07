# Blockchain-Inspired Ledger Explanation

This project uses a blockchain-inspired tamper-evident vote ledger. It is not Bitcoin, Ethereum, or a decentralized public blockchain.

Each vote creates:
- an anonymous ballot
- a vote block linked to the previous block hash
- a receipt hash returned to the voter

Each block uses the canonical format:

```text
block_index|election_id|ballot_id|data_hash|previous_hash|created_at
```

If a ballot changes, the data hash fails. If a block changes, the current hash fails. If a block is removed or reordered, the index and previous hash checks fail.
