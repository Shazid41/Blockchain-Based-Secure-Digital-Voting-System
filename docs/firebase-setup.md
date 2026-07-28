# Firebase Live Database Setup

This project now uses Firebase Authentication and Cloud Firestore as the preferred live backend. Supabase is disabled for production because the old Supabase project was paused.

## Current Firebase Project

- Project ID: `shazid-secure-voting-2026`
- Project name: `Secure Voting System`
- Web app: `Secure Voting Web`
- Firestore location: `asia-south1`
- Hosting domain authorized for Auth: `shazid41.github.io`
- Production config file: `.env.production`

## Required Setup

1. Create a Firebase project from the Firebase console.
2. Add a Web App and copy the Firebase config values.
3. Enable Authentication > Sign-in method > Email/Password.
4. Create a Firestore database.
5. Publish the rules from `firestore.rules`.
6. Add this domain in Authentication > Settings > Authorized domains:
   - `shazid41.github.io`
7. Add these variables before building/deploying:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_PUBLIC_SITE_URL=https://shazid41.github.io/Blockchain-Based-Secure-Digital-Voting-System/`

## First Admin Login

The admin account has been created in Firebase Auth. Login with:

- Email: `shazidsaharia21@gmail.com`
- Password: `Shazid@961`

Default regions, the 10 approved NID numbers, one active election, and three candidates were seeded into Firestore. Voter registration reads the live NID list from Firestore and pending voters appear in the admin voter table.

## Why This Fixes The Previous Problems

- Verification links use the deployed public URL, not `localhost`, when `VITE_PUBLIC_SITE_URL` is set.
- New voter profiles are written directly to Firestore after Firebase Auth account creation.
- Admin voter management reads `profiles` from Firestore, so new pending users are live data, not demo data.
- Supabase pause/payment limits no longer block login or registration once Firebase config is active.
