import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AlertMessage from '../../components/common/AlertMessage.jsx';
import FormInput from '../../components/common/FormInput.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import PasswordInput from '../../components/common/PasswordInput.jsx';
import PrimaryButton from '../../components/common/PrimaryButton.jsx';
import SecondaryButton from '../../components/common/SecondaryButton.jsx';
import { getProfile, loginWithPassword } from '../../services/authService.js';
import { isValidEmail } from '../../utils/validation.js';

const ADMIN_EMAIL = 'shazidsaharia21@gmail.com';

function friendlyLoginError(error) {
  const message = String(error?.message ?? '').toLowerCase();
  if (message.includes('email not confirmed')) return 'Please verify your email before logging in.';
  if (message.includes('invalid')) return 'Invalid email or password.';
  if (message.includes('supabase is not configured')) return error.message;
  return 'Network or authentication error. Please try again.';
}

export default function LoginPage({ adminMode = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: adminMode ? ADMIN_EMAIL : '', password: '' });
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
      const { user } = await loginWithPassword(form.email, form.password);
      const profile = await getProfile(user.id);
      navigate(profile?.role === 'admin' ? '/admin' : '/voter');
    } catch (authError) {
      setError(friendlyLoginError(authError));
    } finally {
      setLoading(false);
    }
  }

  function useAdminEmail() {
    setError('');
    setNotice('Admin email filled. Enter the admin password to continue.');
    setForm((current) => ({ ...current, email: ADMIN_EMAIL }));
  }

  return (
    <>
      <PageHeader title={adminMode ? 'Admin Login' : 'Voter Login'} description="Visitors can read the public project pages directly. Voters and admins must sign in for protected actions." />
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
          {!adminMode ? (
            <SecondaryButton type="button" className="w-full" disabled={loading} onClick={useAdminEmail}>
              Admin login option
            </SecondaryButton>
          ) : null}
          <AlertMessage type="info" title="Security message">
            Accounts waiting for approval or suspended by admin cannot vote even after login.
          </AlertMessage>
        </form>
      </section>
    </>
  );
}
