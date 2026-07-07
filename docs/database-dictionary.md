# Database Dictionary

## regions
Stores election regions with `id`, `name`, `code`, `description`, and `created_at`.

## profiles
Stores authenticated user profile data. Voters may update only safe personal fields. `role` and `approval_status` are admin-controlled.

## elections
Stores election title, description, schedule, status, region, result visibility, creator, and timestamps.

## candidates
Stores candidates linked to an election with party/group, symbol placeholder URL, biography, region, and active status.

## voter_eligibility
Links voters to elections. Contains eligibility, vote completion flag, approval metadata, and a unique `voter_id + election_id` constraint.

## audit_logs
Stores admin/auditor-readable activity records. Ordinary voters cannot read all logs or edit logs.

## ballots
Stores anonymous ballot records. It contains election, candidate, anonymous voter hash, cast time, and receipt hash. It does not store voter identity.

## vote_blocks
Stores the blockchain-inspired ledger blocks. Each block references a ballot, election, block index, previous hash, data hash, current hash, and timestamp.

## fraud_logs
Stores rule-based fraud alerts with risk level, event type, details, resolution status, and timestamps.

## login_attempts
Stores hashed login-attempt metadata for fraud analysis. It does not store plain passwords.
