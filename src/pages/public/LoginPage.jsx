import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AlertMessage from '../../components/common/AlertMessage.jsx';
import FormInput from '../../components/common/FormInput.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import PasswordInput from '../../components/common/PasswordInput.jsx';
import PrimaryButton from '../../components/common/PrimaryButton.jsx';
import SecondaryButton from '../../components/common/SecondaryButton.jsx';
import { loginWithOtp, loginWithPassword } from '../../services/authService.js';
import { isValidEmail } from '../../utils/validation.js';

function friendlyLoginError(error) {
  const message = String(error?.message ?? '').toLowerCase();
  if (message.includes('email not confirmed')) return 'Please verify your email before logging in.';
  if (message.includes('invalid')) return 'Invalid email or password.';
  if (message.includes('supabase is not configured')) return error.message;
  return 'Network or authentication error. Please try again.';
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(location.state?.notice ?? '');
  const [loading, setLoading] = useState(false);

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    if (!isValidEmail(form.email)) {
      setError('Enter a valid email address.');
      return;
    }
    if (!form.password) {
      setError('Password is required.');
      return;
    }
    try {
      setLoading(true);
      await loginWithPassword(form.email, form.password);
      navigate('/voter');
    } catch (authError) {
      setError(friendlyLoginError(authError));
    } finally {
      setLoading(false);
    }
  }

  async function handleOtp() {
    setError('');
    if (!isValidEmail(form.email)) {
      setError('Enter your email first to receive an OTP login link.');
      return;
    }
    try {
      setLoading(true);
      await loginWithOtp(form.email);
      setNotice('Email OTP link sent. Please check your inbox.');
    } catch (authError) {
      setError(friendlyLoginError(authError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader title="Login" description="Access your voter, admin, or auditor dashboard using verified credentials." />
      <section className="container-page py-10">
        <form className="card mx-auto max-w-xl space-y-5 p-6" onSubmit={handleSubmit}>
          {notice ? <AlertMessage type="success">{notice}</AlertMessage> : null}
          {error ? <AlertMessage type="error">{error}</AlertMessage> : null}
          <FormInput id="email" label="Email address" type="email" value={form.email} onChange={update('email')} />
          <PasswordInput id="password" label="Password" value={form.password} onChange={update('password')} />
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <Link className="focus-ring rounded font-semibold text-primary" to="/forgot-password">
              Forgot password?
            </Link>
            <Link className="focus-ring rounded font-semibold text-primary" to="/register">
              Create voter account
            </Link>
          </div>
          <PrimaryButton type="submit" className="w-full" disabled={loading}>
            {loading ? 'Checking account...' : 'Login'}
          </PrimaryButton>
          <SecondaryButton type="button" className="w-full" disabled={loading} onClick={handleOtp}>
            Email OTP option
          </SecondaryButton>
          <AlertMessage type="info" title="Security message">
            Accounts waiting for approval or suspended by admin cannot vote even after login.
          </AlertMessage>
        </form>
      </section>
    </>
  );
}
