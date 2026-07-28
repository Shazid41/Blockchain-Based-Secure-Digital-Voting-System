# Firebase Live Database Setup

This project now supports Firebase Authentication and Cloud Firestore as the preferred live backend. Supabase stays as a fallback only when Firebase environment variables are missing.

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

After Firebase is configured, login with:

- Email: `shazidsaharia21@gmail.com`
- Password: `Shazid@961`

If this admin account does not exist yet, the app creates it and seeds default regions plus the 10 approved NID numbers into Firestore. After that, voter registration reads the live NID list from Firestore and pending voters appear in the admin voter table.

## Why This Fixes The Previous Problems

- Verification links use the deployed public URL, not `localhost`, when `VITE_PUBLIC_SITE_URL` is set.
- New voter profiles are written directly to Firestore after Firebase Auth account creation.
- Admin voter management reads `profiles` from Firestore, so new pending users are live data, not demo data.
- Supabase pause/payment limits no longer block login or registration once Firebase config is active.
