import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AlertMessage from '../../components/common/AlertMessage.jsx';
import FormInput from '../../components/common/FormInput.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import PrimaryButton from '../../components/common/PrimaryButton.jsx';
import SecondaryButton from '../../components/common/SecondaryButton.jsx';
import useAuth from '../../hooks/useAuth.js';
import { verifyTwoFactorCode } from '../../services/twoFactorService.js';

export default function TwoFactorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, logout } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const destination = location.state?.from?.pathname || (profile?.role === 'admin' ? '/admin' : '/voter');

  async function submit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyTwoFactorCode(user?.id, profile, code);
      navigate(destination, { replace: true });
    } catch (twoFactorError) {
      setError(twoFactorError.message || '2FA verification failed.');
    } finally {
      setLoading(false);
    }
  }

  async function exit() {
    await logout();
    navigate('/login');
  }

  return (
    <>
      <PageHeader
        eyebrow="Two Factor"
        title="2FA Verification"
        description="Enter your 6 digit security code to open the protected voting portal."
      />
      <section className="container-page py-8">
        <form className="card mx-auto max-w-md space-y-5 p-5 sm:p-6" onSubmit={submit}>
          <div className="rounded-xl border border-primary/15 bg-gradient-to-r from-primary-light to-white p-4">
            <p className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-primary">
              <ShieldCheck size={18} /> Secure session check
            </p>
            <p className="mt-1 text-sm text-muted">This second step protects voter and admin actions if a password is exposed.</p>
          </div>
          {error ? <AlertMessage type="error">{error}</AlertMessage> : null}
          <FormInput
            id="twoFactorCode"
            label="2FA code"
            inputMode="numeric"
            maxLength={6}
            pattern="[0-9]{6}"
            placeholder="123456"
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
          />
          <PrimaryButton type="submit" className="w-full" disabled={loading || code.length !== 6}>
            <LockKeyhole size={18} /> {loading ? 'Verifying...' : 'Verify and continue'}
          </PrimaryButton>
          <SecondaryButton type="button" className="w-full" onClick={exit}>
            Logout
          </SecondaryButton>
        </form>
      </section>
    </>
  );
}
