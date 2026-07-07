import { MailCheck } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import PrimaryButton from '../../components/common/PrimaryButton.jsx';
import SecondaryButton from '../../components/common/SecondaryButton.jsx';
import useAuth from '../../hooks/useAuth.js';
import { maskEmail } from '../../utils/validation.js';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const { isAuthenticated, loading } = useAuth();
  const email = params.get('email') ?? '';
  const hasAuthToken = typeof window !== 'undefined' && window.location.hash.includes('access_token=');
  const title = isAuthenticated ? 'Email verified successfully' : 'Verify your email';
  const description = isAuthenticated
    ? 'Your email confirmation is complete. You can continue to your voter account.'
    : 'A verification link has been sent to your email address.';

  return (
    <>
      <PageHeader title={title} description={description} />
      <section className="container-page py-10">
        <div className="card mx-auto max-w-xl p-6 text-center">
          <MailCheck className="mx-auto text-primary" size={48} />
          <h2 className="mt-4 text-xl font-bold text-text">
            {isAuthenticated ? 'Account confirmation complete' : `Check ${maskEmail(email)}`}
          </h2>
          <p className="mt-3 text-muted">
            {isAuthenticated
              ? 'Your registration is saved. Voting access will become available after admin approval.'
              : hasAuthToken || loading
                ? 'Finishing email confirmation. If this takes too long, refresh this page once.'
                : 'Open the verification link from your email. If you do not see it, check spam or register again with the correct email.'}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {isAuthenticated ? (
              <>
                <SecondaryButton>
                  <Link to="/">Back to home</Link>
                </SecondaryButton>
                <PrimaryButton>
                  <Link to="/voter">Continue to dashboard</Link>
                </PrimaryButton>
              </>
            ) : (
              <>
                <SecondaryButton>
                  <Link to="/register">Change email</Link>
                </SecondaryButton>
                <PrimaryButton>
                  <Link to="/login">Return to login</Link>
                </PrimaryButton>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
