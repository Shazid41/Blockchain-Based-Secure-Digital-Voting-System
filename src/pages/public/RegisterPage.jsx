import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AlertMessage from '../../components/common/AlertMessage.jsx';
import FormInput from '../../components/common/FormInput.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import PasswordInput from '../../components/common/PasswordInput.jsx';
import PrimaryButton from '../../components/common/PrimaryButton.jsx';
import SecondaryButton from '../../components/common/SecondaryButton.jsx';
import SelectInput from '../../components/common/SelectInput.jsx';
import useLanguage from '../../hooks/useLanguage.js';
import { registerVoter, resendSignupVerification } from '../../services/authService.js';
import { checkNidForSignup } from '../../services/nidService.js';
import { listRegions } from '../../services/regionService.js';
import { isStrongPassword, isValidEmail, isValidVoterNumber } from '../../utils/validation.js';

function friendlyRegisterError(error) {
  const raw = String(error?.message || error || '');
  const message = raw.toLowerCase();
  if (message.includes('approved nid')) return 'This NID is not approved for registration. Please use one of the demo NID numbers or ask admin to add it.';
  if (message.includes('already registered') || message.includes('duplicate') || message.includes('already been registered')) return 'This email or NID is already used.';
  if (message.includes('invalid input syntax') && message.includes('uuid')) return 'Please select a valid region before submitting.';
  if (message.includes('email')) return raw;
  if (raw && raw !== '[object Object]' && raw !== '{}') return raw;
  return 'Registration failed. Please check the information and try again.';
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [regions, setRegions] = useState([]);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    voterNumber: '',
    dateOfBirth: '',
    phone: '',
    regionId: '',
    terms: false,
  });

  useEffect(() => {
    let active = true;
    listRegions()
      .then((data) => {
        if (active) setRegions(data);
      })
      .catch(() => {
        if (active) setError('Could not load regions. Please refresh the page.');
      });

    return () => {
      active = false;
    };
  }, []);

  const update = (field) => (event) => {
    const value = field === 'terms' ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const currentErrors = useMemo(() => {
    const errors = {};
    if (step === 0) {
      if (!form.fullName.trim()) errors.fullName = 'Full name is required.';
      if (!isValidEmail(form.email)) errors.email = 'Enter a valid email.';
      if (!isStrongPassword(form.password)) errors.password = 'Use at least 8 characters.';
      if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords must match.';
    }
    if (step === 1) {
      if (!isValidVoterNumber(form.voterNumber)) errors.voterNumber = 'Use a 10 or 16 digit voter/NID number.';
      if (!form.dateOfBirth) errors.dateOfBirth = 'Date of birth is required.';
      if (!form.phone.trim()) errors.phone = 'Phone number is required.';
      if (!form.regionId) errors.regionId = 'Select your region.';
    }
    if (step === 2 && !form.terms) errors.terms = t('termsRequired');
    return errors;
  }, [form, step, t]);

  async function nextStep() {
    setError('');
    if (Object.keys(currentErrors).length > 0) {
      setError('Please fix the highlighted fields before continuing.');
      return;
    }
    if (step === 1) {
      try {
        setLoading(true);
        const allowed = await checkNidForSignup(form.voterNumber);
        if (!allowed) {
          setError(
            'This NID is not in the approved demo list or it was already used. If you already submitted registration, open the verify email page and send a new verification email.',
          );
          return;
        }
      } catch (nidError) {
        setError(friendlyRegisterError(nidError));
        return;
      } finally {
        setLoading(false);
      }
    }
    setStep((value) => Math.min(value + 1, 2));
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    if (Object.keys(currentErrors).length > 0) {
      setError('Please complete the review step.');
      return;
    }
    try {
      setLoading(true);
      await registerVoter(form);
      let delivery = 'sent';
      try {
        await resendSignupVerification(form.email);
      } catch {
        delivery = 'check';
      }
      navigate(`/verify-email?email=${encodeURIComponent(form.email)}&delivery=${delivery}`);
    } catch (registerError) {
      const message = friendlyRegisterError(registerError);
      if (message.includes('already used') && isValidEmail(form.email)) {
        navigate(`/verify-email?email=${encodeURIComponent(form.email)}&delivery=existing`);
        return;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader title={t('voterRegistration')} description={t('registrationDescription')} />
      <section className="container-page py-10">
        <form className="card mx-auto max-w-3xl space-y-6 p-6" onSubmit={submit}>
          <div className="grid gap-3 sm:grid-cols-3">
            {[t('account'), t('voterInformation'), t('review')].map((label, index) => (
              <div key={label} className={`rounded border p-3 text-sm font-semibold ${index === step ? 'border-primary bg-primary-light text-primary-dark' : 'border-border text-muted'}`}>
                {index + 1}. {label}
              </div>
            ))}
          </div>
          {error ? <AlertMessage type="error">{error}</AlertMessage> : null}

          {step === 0 ? (
            <div className="grid gap-5">
              <FormInput id="fullName" label={t('fullName')} value={form.fullName} onChange={update('fullName')} error={currentErrors.fullName} />
              <FormInput id="registerEmail" label={t('emailAddress')} type="email" value={form.email} onChange={update('email')} error={currentErrors.email} />
              <PasswordInput id="registerPassword" label={t('password')} value={form.password} onChange={update('password')} error={currentErrors.password} />
              <PasswordInput id="confirmPassword" label={t('confirmPassword')} value={form.confirmPassword} onChange={update('confirmPassword')} error={currentErrors.confirmPassword} />
            </div>
          ) : null}

          {step === 1 ? (
            <div className="grid gap-5 sm:grid-cols-2">
              <FormInput id="voterNumber" label={t('voterNidNumber')} value={form.voterNumber} onChange={update('voterNumber')} error={currentErrors.voterNumber} />
              <FormInput id="dateOfBirth" label={t('dateOfBirth')} type="date" value={form.dateOfBirth} onChange={update('dateOfBirth')} error={currentErrors.dateOfBirth} />
              <FormInput id="phone" label={t('phoneNumber')} value={form.phone} onChange={update('phone')} error={currentErrors.phone} />
              <SelectInput id="region" label={t('region')} options={regions} value={form.regionId} onChange={update('regionId')} error={currentErrors.regionId} />
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4">
              <div className="card bg-primary-light p-4">
                <p><strong>Name:</strong> {form.fullName}</p>
                <p><strong>Email:</strong> {form.email}</p>
                <p><strong>Voter/NID:</strong> {form.voterNumber}</p>
                <p><strong>Approval:</strong> Pending admin approval</p>
              </div>
              <label className="flex gap-3 text-sm text-muted">
                <input type="checkbox" checked={form.terms} onChange={update('terms')} className="mt-1" />
                {t('registrationConsent')}
              </label>
              {currentErrors.terms ? <p className="text-sm font-medium text-error">{currentErrors.terms}</p> : null}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <SecondaryButton type="button" disabled={step === 0 || loading} onClick={() => setStep((value) => value - 1)}>
              {t('back')}
            </SecondaryButton>
            {step < 2 ? (
              <PrimaryButton type="button" disabled={loading} onClick={nextStep}>
                {loading ? 'Checking...' : t('continue')}
              </PrimaryButton>
            ) : (
              <PrimaryButton type="submit" disabled={loading}>
                {loading ? 'Creating account...' : t('submitRegistration')}
              </PrimaryButton>
            )}
          </div>
        </form>
      </section>
    </>
  );
}
