# Weekly Progress Report - Week 01

## Project Information
- Project: Blockchain-Based Secure Digital Voting System
- Course: CSE 3208 - Web Engineering Lab
- Reporting week: Week 01
- Reporting date: 2026-07-07

## Weekly Goal
Create the base React/Vite project shell, public pages, authentication structure, Supabase client setup, initial database migration, repository templates, and validation workflow.

## Work Completed

### Jebunnahar Juli
- Assigned work: Home page, login and registration UI, navbar, footer
- Completed work: Public layout, navbar, footer, home page, login page, registration page
- Branch: juli/ui-management
- Commits: Planned
- Pull request: Planned
- Evidence: Local build validation
- Problems: Git repository was not initialized in the provided workspace
- Next plan: Dashboard layout and reusable UI refinement

### Jarin Anzum
- Assigned work: Simple UI and testing
- Completed work: Initial validation tests and status/empty/loading components
- Branch: jarin/testing-ui
- Commits: Planned
- Pull request: Planned
- Evidence: npm test
- Problems: Browser test screenshots are not part of Step 1
- Next plan: Responsive and route testing

### Shanzita Shohana Sampa
- Assigned work: Documentation
- Completed work: README draft, weekly report, authentication test plan
- Branch: shanzita/documentation
- Commits: Planned
- Pull request: Planned
- Evidence: docs folder
- Problems: Final diagrams are scheduled for later phases
- Next plan: Use-case and registration flow documentation

### MD. Shazidur Rahaman
- Assigned work: Core setup, Supabase setup, authentication, protected routes
- Completed work: Vite app, Supabase client, AuthContext, ProtectedRoute, RoleRoute, Step 1 migration
- Branch: shazidur/core-system
- Commits: Planned
- Pull request: Planned
- Evidence: npm run lint, npm test, npm run build
- Problems: Supabase project credentials are still required for live auth
- Next plan: Connect real Supabase project and continue Step 2 routing/layout work

## Features Demonstrated
- Public home/about/how-it-works/security pages
- Login, registration, verification, forgot password, reset password pages
- Session-aware authentication context
- Protected voter/admin placeholders
- Initial regions and profiles schema with RLS

## Test Results
- Validation helper tests created for email, password, voter number, and masked email.

## Challenges
- Provided Stitch files were static HTML, not a React/Vite app.
- Workspace did not contain Git metadata.

## Solutions
- Preserved Stitch files under `work/` as design reference.
- Created a clean React/Vite shell at the project root.

## Plan for Next Week
Build Step 2 public UI routing, reusable cards, 404/unauthorized testing, and dashboard layout foundations.

## Captain Approval
Pending.
