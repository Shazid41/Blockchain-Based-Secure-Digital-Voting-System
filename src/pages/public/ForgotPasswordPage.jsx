import { useState } from 'react';
import { Link } from 'react-router-dom';
import AlertMessage from '../../components/common/AlertMessage.jsx';
import FormInput from '../../components/common/FormInput.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import PrimaryButton from '../../components/common/PrimaryButton.jsx';
import { sendPasswordReset } from '../../services/authService.js';
import { isValidEmail } from '../../utils/validation.js';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    if (!isValidEmail(email)) {
      setError('Enter a valid email address.');
      return;
    }
    try {
      await sendPasswordReset(email);
      setMessage('Password reset link sent. Please check your email.');
    } catch (resetError) {
      setError(resetError.message);
    }
  }

  return (
    <>
      <PageHeader title="Forgot password" description="Send a secure password reset link to your verified email." />
      <section className="container-page py-10">
        <form className="card mx-auto max-w-xl space-y-5 p-6" onSubmit={submit}>
          {message ? <AlertMessage type="success">{message}</AlertMessage> : null}
          {error ? <AlertMessage type="error">{error}</AlertMessage> : null}
          <FormInput id="resetEmail" label="Email address" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <PrimaryButton type="submit" className="w-full">Send reset link</PrimaryButton>
          <Link className="focus-ring block rounded text-center text-sm font-semibold text-primary" to="/login">Return to login</Link>
        </form>
      </section>
    </>
  );
}
