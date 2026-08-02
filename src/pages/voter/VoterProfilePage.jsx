import { Download, LogOut, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AlertMessage from '../../components/common/AlertMessage.jsx';
import FormInput from '../../components/common/FormInput.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import PrimaryButton from '../../components/common/PrimaryButton.jsx';
import SecondaryButton from '../../components/common/SecondaryButton.jsx';
import SelectInput from '../../components/common/SelectInput.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import useAuth from '../../hooks/useAuth.js';
import { listRegions } from '../../services/regionService.js';
import { getCurrentProfile, updateCurrentProfile } from '../../services/profileService.js';
import { disableTwoFactor, enableTwoFactor } from '../../services/twoFactorService.js';
import { listVoterReceipts } from '../../services/verificationService.js';
import { downloadVoteReceipt } from '../../utils/receiptDownload.js';

export default function VoterProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [regions, setRegions] = useState([]);
  const [profile, setProfile] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [message, setMessage] = useState('');
  const [receiptError, setReceiptError] = useState('');
  const [twoFactorPin, setTwoFactorPin] = useState('');
  const [twoFactorBusy, setTwoFactorBusy] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([listRegions(), getCurrentProfile(user.id), listVoterReceipts(user.id)]).then(([regionRows, profileRow, receiptRows]) => {
      setRegions(regionRows);
      setProfile(profileRow);
      setReceipts(receiptRows);
      setReceiptError('');
    }).catch((error) => setReceiptError(error.message || 'Receipt history could not load.'));
  }, [user?.id]);

  if (!profile) return <PageHeader title="Profile" description="Loading profile..." />;

  async function save(event) {
    event.preventDefault();
    const saved = await updateCurrentProfile(user?.id, profile);
    setProfile(saved);
    setMessage('Profile updated. Role and approval status were not changed.');
  }

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  async function enableSecurityCode() {
    setMessage('');
    setTwoFactorBusy(true);
    try {
      const saved = await enableTwoFactor(user?.id, twoFactorPin);
      setProfile(saved);
      setTwoFactorPin('');
      setMessage('2FA enabled. Future logins will require this 6 digit code.');
    } catch (twoFactorError) {
      setMessage(twoFactorError.message || '2FA setup failed.');
    } finally {
      setTwoFactorBusy(false);
    }
  }

  async function disableSecurityCode() {
    setMessage('');
    setTwoFactorBusy(true);
    try {
      const saved = await disableTwoFactor(user?.id);
      setProfile(saved);
      setTwoFactorPin('');
      setMessage('2FA disabled for this account.');
    } catch (twoFactorError) {
      setMessage(twoFactorError.message || '2FA could not be disabled.');
    } finally {
      setTwoFactorBusy(false);
    }
  }

  return (
    <>
      <PageHeader eyebrow="Voter" title="Profile" description="Only safe personal fields can be updated by voters." />
      <section className="container-page space-y-6 py-6 sm:py-8">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <form className="card space-y-5 p-5 sm:p-6" onSubmit={save}>
            {message ? <AlertMessage type="success">{message}</AlertMessage> : null}
            <div className="grid gap-4 md:grid-cols-2">
              <FormInput id="profileName" label="Full name" value={profile.full_name ?? ''} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
              <FormInput id="profileEmail" label="Email" value={profile.email ?? ''} disabled />
              <FormInput id="profileVoter" label="Voter number" value={profile.voter_number ?? ''} disabled />
              <FormInput id="profilePhone" label="Phone" value={profile.phone ?? ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
              <FormInput id="profileDob" label="Date of birth" type="date" value={profile.date_of_birth ?? ''} onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })} />
              <SelectInput id="profileRegion" label="Region" options={regions} value={profile.region_id ?? ''} onChange={(e) => setProfile({ ...profile, region_id: e.target.value })} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="card bg-page p-4"><p className="text-sm text-muted">Role</p><p className="font-bold text-text">{profile.role}</p></div>
              <div className="card bg-page p-4"><p className="text-sm text-muted">Approval Status</p><div className="mt-2"><StatusBadge status={profile.approval_status} /></div></div>
            </div>
            <div className="rounded-xl border border-primary/15 bg-gradient-to-r from-primary-light to-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-extrabold uppercase tracking-wide text-primary">2FA Authentication</p>
                  <p className="mt-1 text-sm text-muted">
                    Status: <strong className="text-text">{profile.two_factor_enabled ? 'Enabled' : 'Disabled'}</strong>
                  </p>
                </div>
                <StatusBadge status={profile.two_factor_enabled ? 'verified' : 'pending'} />
              </div>
              {!profile.two_factor_enabled ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                  <FormInput
                    id="twoFactorSetup"
                    label="Set 6 digit 2FA code"
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={twoFactorPin}
                    onChange={(event) => setTwoFactorPin(event.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                  />
                  <PrimaryButton type="button" className="self-end" disabled={twoFactorBusy || twoFactorPin.length !== 6} onClick={enableSecurityCode}>
                    Enable 2FA
                  </PrimaryButton>
                </div>
              ) : (
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <SecondaryButton type="button" disabled={twoFactorBusy} onClick={disableSecurityCode}>
                    Disable 2FA
                  </SecondaryButton>
                  <p className="text-sm leading-6 text-muted">Logout and login again to test the 2FA challenge.</p>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <PrimaryButton type="submit">Save allowed changes</PrimaryButton>
              <SecondaryButton onClick={handleLogout}><LogOut size={18} /> Logout</SecondaryButton>
            </div>
          </form>

          <aside className="card space-y-4 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="rounded-2xl bg-primary-light p-3 text-primary"><ShieldCheck size={22} /></span>
              <div>
                <h2 className="text-2xl font-extrabold text-text">Receipt History</h2>
                <p className="mt-1 text-sm leading-6 text-muted">Download or verify receipts from elections where this account has voted.</p>
              </div>
            </div>
            {receiptError ? <AlertMessage type="warning">{receiptError}</AlertMessage> : null}
            {receipts.length ? (
              <div className="space-y-3">
                {receipts.map((receipt) => (
                  <article key={`${receipt.election_id}-${receipt.receipt_hash}`} className="rounded-xl border border-border bg-white/85 p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-extrabold text-text">{receipt.election_title}</h3>
                        <p className="text-sm text-muted">{new Date(receipt.cast_at).toLocaleString()}</p>
                      </div>
                      <StatusBadge status="included" />
                    </div>
                    <p className="mt-3 break-all rounded-lg bg-page p-3 font-mono text-xs text-muted">{receipt.receipt_hash}</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <SecondaryButton className="min-h-10 px-3 py-2" onClick={() => downloadVoteReceipt(receipt)}><Download size={16} /> Download</SecondaryButton>
                      <Link className="focus-ring inline-flex min-h-10 items-center justify-center rounded-lg bg-primary px-3 py-2 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft" to={`/voter/verify?receipt=${encodeURIComponent(receipt.receipt_hash)}`}>
                        Verify Hash
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-5 text-sm font-semibold text-muted">
                No vote receipts yet. After voting, receipts will appear here automatically.
              </div>
            )}
          </aside>
        </div>
      </section>
    </>
  );
}
