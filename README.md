# Blockchain-Based Secure Digital Voting System

Rabindra Maitree University - CSE 3208 Web Engineering Lab

## Project Overview
An academic React and Supabase web application for secure voter registration, email verification, role-based access, anonymous voting, blockchain-style vote storage, audit verification, fraud logs, and real-time result analytics.

This project is not a public decentralized blockchain and is not suitable for national elections. It demonstrates a tamper-evident vote ledger for lab learning.

## Technology Stack
- React, Vite, JavaScript
- React Router
- Tailwind CSS
- Supabase Auth and PostgreSQL
- Vitest and ESLint
- GitHub Pages and GitHub Actions

## Step 1 Completed Features
- React/Vite project shell
- Central design system using green, white, gray, and limited red
- Public layout with responsive navbar and footer
- Home, About, How It Works, Security, Login, Registration, Email Verification, Forgot Password, Reset Password, Unauthorized, and 404 pages
- Three-step voter registration form
- Email/password login and email OTP option
- Supabase client and auth service
- Auth context with session persistence
- ProtectedRoute and RoleRoute placeholders for `/voter` and `/admin`
- Initial Supabase migration for `regions` and `profiles`
- RLS policies for own profile access and admin management
- GitHub templates and workflow drafts

## Step 2 Completed Features
- Responsive voter layout with header, navigation, approval status, profile access, and logout
- Voter dashboard with approval status, available elections, completed vote count, receipt status, active/upcoming elections, recent guidance, and profile completion prompts
- Voter profile page with safe-field editing only
- Available elections page with status, region, and eligibility filters
- Election details page with candidate list and voting security notice
- Vote verification form connected to a Step 2 placeholder service
- Responsive admin sidebar layout with profile, logout, active menu state, page title, and breadcrumb label
- Admin dashboard with voter, election, candidate, and region summaries
- Manage voters page with search, filters, pagination placeholder, details, and approval status confirmation
- Manage regions page with add, edit, search, duplicate-code check, and safe deletion guard
- Manage elections page with creation form, filters, table, allowed status, result visibility, and date validation
- Manage candidates page with election/region/active filters, add candidate form, and disable action
- Settings page for non-secret project preferences
- Step 2 migration for elections, candidates, voter eligibility, audit logs, indexes, and RLS policies

## Step 3 Completed Features
- Focused Cast Vote page with candidate selection, confirmation checkbox, and confirmation modal
- Vote Success page with receipt hash, block index, block hash, verify button, and receipt download
- Anonymous `ballots` table without voter identity fields
- `vote_blocks` table for a blockchain-inspired tamper-evident ledger
- `fraud_logs` and `login_attempts` tables
- `cast_secure_vote` RPC with server-side validation, eligibility row lock, anonymous ballot insert, block insert, duplicate-vote prevention, and audit logging
- `verify_election_chain` RPC for admin/auditor audit verification
- `verify_vote_receipt` RPC that does not expose voter identity or candidate choice
- `election_results_summary` RPC with aggregate-only result data
- Results dashboard with summary cards, bar chart, pie chart, region turnout chart, and result table
- Blockchain Audit page with verification result, block table, copy hash, and export report
- Fraud Alerts page with risk filters, details, and mark-resolved action
- Activity Logs page with filters
- Final security report, project report, diagrams, weekly reports, viva topics, and manual test cases

## Setup
```bash
npm install
cp .env.example .env
npm run dev
```

Add only public frontend values to `.env`:
```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Never commit service role keys, database passwords, JWT secrets, private salts, or admin passwords.

## Database Migration
Run the SQL file in Supabase SQL editor or through Supabase CLI:

```bash
supabase/migrations/202607070001_step_1_auth_profiles_regions.sql
```

The migration creates:
- `regions`
- `profiles`
- profile creation trigger after Supabase Auth registration
- row level security policies

Step 2 adds:
```bash
supabase/migrations/202607070002_step_2_admin_voter_management.sql
```

The Step 2 migration creates:
- `elections`
- `candidates`
- `voter_eligibility`
- `audit_logs`
- indexes and RLS policies for admin/voter/auditor access

Step 3 adds:
```bash
supabase/migrations/202607070003_step_3_secure_voting_blockchain.sql
```

The Step 3 migration creates:
- `ballots`
- `vote_blocks`
- `fraud_logs`
- `login_attempts`
- secure voting, receipt verification, chain verification, and aggregate result RPCs
- RLS policies that prevent direct client ballot and block writes

## Branch Workflow
Use `shazidur/core-system` for core setup, auth, security, database, voting, blockchain, deployment, and integration work.

Do not push directly to `main`.

Recommended flow:
```bash
git checkout -b shazidur/core-system
git add .
git commit -m "feat(auth): add step one project shell"
git push origin shazidur/core-system
```

Open a pull request into `develop`, then merge `develop` into `main` only after review and validation.

## Branch Protection
Protect `main` and `develop` in GitHub repository settings:
- Require pull request before merging
- Require at least one approval
- Require validation status checks
- Require resolved conversations
- Block force pushes
- Block deletion
- Prevent bypass when available

Do not disable branch protection for convenience.

## Validation
```bash
npm run lint
npm test
npm run build
```

## Security Notes
- Registration creates voter accounts only.
- Default approval status is `pending`.
- Users cannot choose admin or auditor during registration.
- Biometric authentication is not implemented in Step 1.
- WebAuthn, passkeys, and device biometrics are future scope.
- Ballots and blockchain vote blocks are planned for later phases.
- Step 2 does not cast votes and does not claim blockchain verification is complete.
- Admin operations are protected in UI routes and by RLS policy design.
- Ballots and vote blocks are created only through `cast_secure_vote`.
- Receipt verification intentionally hides voter identity, anonymous voter hash, and candidate choice.
- The ledger is blockchain-inspired and tamper-evident. It is not a decentralized public blockchain.

## Demo Accounts Needed
Create accounts manually in Supabase Auth. Do not commit real passwords.
- one admin account
- one auditor account
- two approved voter accounts
- one pending voter account
- one suspended voter account for testing blocked access

## Deployment
1. Push reviewed changes to `main`.
2. GitHub Actions runs `npm ci`, `npm run build`, and deploys `dist`.
3. Vite base is configured for `/blockchain-secure-voting-system/`.
4. Configure GitHub Pages to use GitHub Actions.

## Academic Disclaimer
This system is developed as an academic project for Web Engineering Lab. Real government elections require independent security audits, legal compliance, certified identity verification, secure infrastructure, penetration testing, formal cryptographic review, disaster recovery, and public trust procedures.
