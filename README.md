# Secure Digital Voting System

An official-style, bilingual digital voting portal built with React, Vite, Tailwind CSS, Supabase Auth/PostgreSQL, and a blockchain-inspired tamper-evident vote ledger.

## Live Links

| Item | Link |
| --- | --- |
| Live Website | https://shazid41.github.io/Blockchain-Based-Secure-Digital-Voting-System/ |
| GitHub Repository | https://github.com/Shazid41/Blockchain-Based-Secure-Digital-Voting-System |
| Working Branch | `shazidur/core-system` |
| Production Branch | `main` |
| GitHub Pages Branch | `gh-pages` |

## Project Summary

This system demonstrates a secure digital voting workflow where visitors can view public election information, voters can register with an approved NID, admins can approve voters and manage election data, and votes are stored through a secure server-side voting function with anonymous ballots and blockchain-style audit records.

The public interface is designed to feel like a government voting portal:

- English and Bangla language switching
- Bangla mode with `SolaimanLipi` font first
- Public live election monitoring dashboard
- Secure voter registration and login
- Admin portal for voter, election, candidate, region, and NID management
- Anonymous voting and receipt verification
- Blockchain-inspired vote block audit
- Fraud alert and activity log views

## Core Features

| Area | Features |
| --- | --- |
| Public Portal | Home, live election monitoring, vote receipt verification, security information, process explanation |
| Language | English/Bangla switch, translated public pages, Bangla font stack with `SolaimanLipi` first |
| Voter Registration | Email, phone, date of birth, region, 10 or 16 digit NID, approved NID whitelist |
| Authentication | Supabase email/password login, password reset, OTP link from forgot-password page |
| Admin Access | Dedicated admin login route and role-protected admin dashboard |
| NID Control | 10 demo NIDs seeded, admins can add/activate/deactivate approved NIDs |
| Voting | Candidate selection, confirmation, secure vote RPC, one-voter-one-vote protection |
| Privacy | Ballots do not store voter name, email, phone, or NID directly |
| Blockchain Audit | Vote blocks use previous hash and SHA-256 hash fields for tamper detection |
| Results | Aggregate-only election results, charts, turnout, live public dashboard |
| Fraud Monitoring | Fraud logs, risk filters, mark-resolved workflow |


## Approved Demo NID Numbers

Only active NID numbers from the approved list can create voter accounts.

```text
2394859539
4212911590
1029384756
5647382910
9182736450
1234567890
9876543210
1122334455
5566778899
1234567890123456
```

Admins can manage this list from:

```text
/admin/nids
```

## Team and Work Distribution

| Member | Role | Main Work |
| --- | --- | --- |
| Md. Shazidur Rahaman | Project Owner, Frontend Lead, Integration Lead | UI flow, deployment, Supabase connection, final integration, GitHub publishing |
| Team Member 2 | Authentication and Registration | Voter signup, login flow, password reset, NID validation workflow |
| Team Member 3 | Admin and Election Management | Admin dashboard, voters, elections, candidates, regions, approved NID management |
| Team Member 4 | Voting and Blockchain Logic | Secure vote storage, anonymous ballots, vote blocks, receipt verification |
| Team Member 5 | Testing and Documentation | Test cases, manuals, report files, diagrams, security notes |

Update the member names before final submission if your teacher requires exact group member names.

## Technology Stack

| Layer | Tools |
| --- | --- |
| Frontend | React 18, Vite, JavaScript |
| Routing | React Router |
| Styling | Tailwind CSS, custom CSS animations, responsive glass UI |
| Icons | Lucide React |
| Charts | Recharts |
| Backend | Supabase Auth, Supabase PostgreSQL |
| Database Security | Row Level Security, SQL functions, RPC calls |
| Testing | Vitest, ESLint |
| Deployment | GitHub Pages |

## Repository Structure

```text
.
├── .github/                         # GitHub templates/workflow files
├── docs/                            # Reports, diagrams, manuals, test cases
│   ├── diagrams/                    # Architecture, ER, activity, sequence diagrams
│   ├── test-cases/                  # Authentication, admin, voting test cases
│   └── weekly-reports/              # Weekly progress reports
├── scripts/
│   └── copy-404.mjs                 # GitHub Pages SPA route fallback
├── src/
│   ├── components/                  # Reusable UI components
│   ├── context/                     # Auth and language providers
│   ├── hooks/                       # Custom hooks
│   ├── layouts/                     # Public, voter, admin layouts
│   ├── pages/                       # Public, voter, admin pages
│   ├── routes/                      # App route definitions
│   ├── services/                    # Supabase and app service functions
│   └── utils/                       # Constants, validation, blockchain helpers
├── supabase/
│   └── migrations/                  # Database schema, RLS, RPC functions
├── tests/                           # Unit tests
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## Important Files

| File | Purpose |
| --- | --- |
| `src/routes/AppRoutes.jsx` | Public, voter, and admin route setup |
| `src/context/AuthContext.jsx` | Supabase session and profile state |
| `src/context/LanguageContext.jsx` | English/Bangla language switching |
| `src/services/supabaseClient.js` | Supabase client setup |
| `src/services/authService.js` | Register, login, logout, reset, OTP |
| `src/services/nidService.js` | Approved NID list and signup check |
| `src/services/publicDashboardService.js` | Public live election dashboard data |
| `src/pages/public/HomePage.jsx` | Public official-style portal homepage |
| `src/pages/admin/ManageNidsPage.jsx` | Admin NID whitelist management |
| `supabase/migrations/*.sql` | Database schema, policies, and RPC functions |

## File Formatting and Code Style

Use these rules when editing the repository:

- JavaScript and JSX files use ES modules.
- Component files use `PascalCase.jsx`.
- Service and utility files use `camelCase.js`.
- Keep reusable UI in `src/components/`.
- Keep Supabase calls in `src/services/`.
- Keep routes in `src/routes/AppRoutes.jsx`.
- Keep database changes in `supabase/migrations/`.
- Use Tailwind utility classes for layout and styling.
- Use short comments only when logic is not obvious.
- Do not commit `.env`, private keys, database passwords, service role keys, or admin secrets.
- Run validation before pushing:

```bash
npm run lint
npm test
npm run build
```

## Local Setup

Install dependencies:

```bash
npm install
```

Create environment file:

```bash
cp .env.example .env
```

Add public Supabase frontend values only:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-or-publishable-key
```

Start local development:

```bash
npm run dev
```

Build production files:

```bash
npm run build
```

Preview production build locally:

```bash
npm run preview
```

## Supabase Setup

Run migrations in this order from Supabase SQL Editor:

```text
supabase/migrations/202607070001_step_1_auth_profiles_regions.sql
supabase/migrations/202607070002_step_2_admin_voter_management.sql
supabase/migrations/202607070003_step_3_secure_voting_blockchain.sql
supabase/migrations/202607070004_approved_nid_admin_login_rules.sql
supabase/migrations/202607070005_public_live_election_dashboard.sql
```

### Main Tables

| Table | Purpose |
| --- | --- |
| `regions` | Election/voter regions |
| `profiles` | User profile, role, approval status, NID |
| `approved_nids` | Allowed NID whitelist for voter registration |
| `elections` | Election records |
| `candidates` | Candidate records |
| `voter_eligibility` | Voter-election eligibility and vote status |
| `ballots` | Anonymous ballot records |
| `vote_blocks` | Blockchain-style vote ledger records |
| `fraud_logs` | Suspicious event records |
| `audit_logs` | Admin/system activity records |
| `login_attempts` | Login attempt tracking |

### Main RPC Functions

| Function | Purpose |
| --- | --- |
| `is_nid_available_for_signup` | Checks approved and unused NID |
| `cast_secure_vote` | Casts one secure vote server-side |
| `verify_vote_receipt` | Verifies receipt without exposing voter identity |
| `verify_election_chain` | Checks vote block chain integrity |
| `election_results_summary` | Aggregate result data |
| `public_live_election_dashboard` | Public live election dashboard data |

## Deployment

The live site is published through GitHub Pages from the `gh-pages` branch.

Production build command:

```bash
npm run build
```

The build also creates `dist/404.html` so direct routes like `/register`, `/admin-login`, and `/voter/elections` work on GitHub Pages.

Vite base path:

```text
/Blockchain-Based-Secure-Digital-Voting-System/
```

## Branch Workflow

Recommended workflow:

```bash
git checkout shazidur/core-system
git pull origin shazidur/core-system
npm run lint
npm test
npm run build
git add .
git commit -m "feat: describe update"
git push origin shazidur/core-system
git push origin shazidur/core-system:main
```

Deploy branch:

```text
gh-pages
```

## Testing Status

Current validation:

```text
Test files: 3 passed
Tests: 14 passed
Build: Passed
Lint: Passed with non-blocking Fast Refresh warnings
```

Existing lint warnings are from React Fast Refresh because context files export both a context and provider. They do not block the build.

## Documentation Files

| File | Description |
| --- | --- |
| `docs/project-report.md` | Project report |
| `docs/security-test-report.md` | Security testing notes |
| `docs/database-dictionary.md` | Database table dictionary |
| `docs/admin-manual.md` | Admin user manual |
| `docs/voter-manual.md` | Voter user manual |
| `docs/blockchain-explanation.md` | Blockchain-style ledger explanation |
| `docs/fraud-detection.md` | Fraud detection notes |
| `docs/viva-questions.md` | Viva questions and answers |
| `docs/diagrams/` | Architecture and workflow diagrams |
| `docs/test-cases/` | Manual and functional test cases |
| `docs/weekly-reports/` | Weekly reports |

## Security Notes

- Only approved NIDs can register voter accounts.
- Same email, phone, or NID cannot be reused for multiple accounts.
- Normal registration always creates a voter account.
- Admin access is role-based and protected.
- Ballots do not store direct voter identity.
- Vote receipts do not reveal candidate choice or voter identity.
- Voting is handled through database RPC, not direct client table writes.
- Public live dashboard uses aggregate data only.
- Never commit private Supabase service keys or database passwords.

## Current Public Routes

| Route | Purpose |
| --- | --- |
| `/` | Public official portal homepage |
| `/login` | Voter login |
| `/admin-login` | Admin login |
| `/register` | Voter registration |
| `/verify` | Public receipt verification |
| `/about` | Portal overview |
| `/how-it-works` | Voting process |
| `/security` | Security overview |
| `/voter` | Protected voter dashboard |
| `/admin` | Protected admin dashboard |

## Current Status

The project is connected to Supabase and published on GitHub Pages. The current version includes the final-step voting workflow, admin management, approved NID registration control, English/Bangla UI, official-style public portal design, and public live election monitoring.
