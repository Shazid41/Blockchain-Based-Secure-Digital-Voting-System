import { useState } from 'react';
import AlertMessage from '../../components/common/AlertMessage.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import PasswordInput from '../../components/common/PasswordInput.jsx';
import PrimaryButton from '../../components/common/PrimaryButton.jsx';
import { updatePassword } from '../../services/authService.js';
import { isStrongPassword } from '../../utils/validation.js';

export default function ResetPasswordPage() {
  const [passwords, setPasswords] = useState({ password: '', confirm: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    if (!isStrongPassword(passwords.password)) {
      setError('Use at least 8 characters.');
      return;
    }
    if (passwords.password !== passwords.confirm) {
      setError('Passwords must match.');
      return;
    }
    try {
      await updatePassword(passwords.password);
      setMessage('Password updated successfully.');
    } catch (updateError) {
      setError(updateError.message);
    }
  }

  return (
    <>
      <PageHeader title="Reset password" description="Choose a new password for your secure voting account." />
      <section className="container-page py-10">
        <form className="card mx-auto max-w-xl space-y-5 p-6" onSubmit={submit}>
          {message ? <AlertMessage type="success">{message}</AlertMessage> : null}
          {error ? <AlertMessage type="error">{error}</AlertMessage> : null}
          <PasswordInput id="newPassword" label="New password" value={passwords.password} onChange={(event) => setPasswords((current) => ({ ...current, password: event.target.value }))} help="Use at least 8 characters." />
          <PasswordInput id="confirmNewPassword" label="Confirm password" value={passwords.confirm} onChange={(event) => setPasswords((current) => ({ ...current, confirm: event.target.value }))} />
          <PrimaryButton type="submit" className="w-full">Save password</PrimaryButton>
        </form>
      </section>
    </>
  );
}
