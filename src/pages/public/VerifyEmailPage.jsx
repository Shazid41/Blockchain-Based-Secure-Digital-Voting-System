import { MailCheck } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import PrimaryButton from '../../components/common/PrimaryButton.jsx';
import SecondaryButton from '../../components/common/SecondaryButton.jsx';
import { maskEmail } from '../../utils/validation.js';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const email = params.get('email') ?? '';

  return (
    <>
      <PageHeader title="Verify your email" description="A verification link has been sent to your email address." />
      <section className="container-page py-10">
        <div className="card mx-auto max-w-xl p-6 text-center">
          <MailCheck className="mx-auto text-primary" size={48} />
          <h2 className="mt-4 text-xl font-bold text-text">Check {maskEmail(email)}</h2>
          <p className="mt-3 text-muted">
            Open the verification link, then return to login. If you do not see the message, check spam or request a new
            verification email from Supabase.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <SecondaryButton>Resend verification</SecondaryButton>
            <SecondaryButton>
              <Link to="/register">Change email</Link>
            </SecondaryButton>
            <PrimaryButton>
              <Link to="/login">Return to login</Link>
            </PrimaryButton>
          </div>
        </div>
      </section>
    </>
  );
}
