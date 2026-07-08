import { useState } from 'react';
import { MailCheck } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import AlertMessage from '../../components/common/AlertMessage.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import PrimaryButton from '../../components/common/PrimaryButton.jsx';
import SecondaryButton from '../../components/common/SecondaryButton.jsx';
import useAuth from '../../hooks/useAuth.js';
import { resendSignupVerification } from '../../services/authService.js';
import { maskEmail } from '../../utils/validation.js';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const { isAuthenticated, loading } = useAuth();
  const email = params.get('email') ?? '';
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const hasAuthToken = typeof window !== 'undefined' && window.location.hash.includes('access_token=');
  const title = isAuthenticated ? 'Email verified successfully' : 'Verify your email';
  const description = isAuthenticated
    ? 'Your email confirmation is complete. You can continue to your voter account.'
    : 'A verification link has been sent to your email address.';

  async function handleResend() {
    setNotice('');
    setError('');
    if (!email) {
      setError('Email address is missing. Please register again with your email address.');
      return;
    }
    try {
      setResending(true);
      await resendSignupVerification(email);
      setNotice('New verification email sent. Open the newest email only; old links may be expired.');
    } catch (resendError) {
      setError(resendError?.message || 'Could not send verification email. Please try again.');
    } finally {
      setResending(false);
    }
  }

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
          {!isAuthenticated ? (
            <div className="mt-5 space-y-3 text-left">
              {notice ? <AlertMessage type="success">{notice}</AlertMessage> : null}
              {error ? <AlertMessage type="error">{error}</AlertMessage> : null}
              <AlertMessage type="warning" title="Important">
                If an old email opens localhost or says OTP expired, ignore that email and use the newest verification
                email after resending.
              </AlertMessage>
            </div>
          ) : null}
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
                <SecondaryButton disabled={resending} onClick={handleResend}>
                  {resending ? 'Sending...' : 'Send new verification email'}
                </SecondaryButton>
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
